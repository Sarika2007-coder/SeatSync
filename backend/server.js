// Must be first — allows corporate SSL proxy certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const crypto  = require("crypto");
const { createClient } = require("@supabase/supabase-js");

// Load .env before anything that reads process.env
try { process.loadEnvFile(path.join(__dirname, "..", ".env")); } catch (_) {}

// Validate required env vars
const required = ["SUPABASE_URL","SUPABASE_SECRET_KEY","ADMIN_USERNAME","ADMIN_PASSWORD"];
const missing  = required.filter(k => !process.env[k]);
if (missing.length) {
    console.error("Missing env vars:", missing.join(", "));
    process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PW_HASH  = crypto.createHash("sha256")
    .update(process.env.ADMIN_PASSWORD + "ss_salt").digest("hex");

function hashPassword(pw) {
    return crypto.createHash("sha256").update(pw + "ss_salt").digest("hex");
}

const app = express();
app.use(cors());
app.use(express.json());

// Serve publishable Supabase config to frontend only
app.get("/js/env-config.js", (req, res) => {
    res.type("application/javascript");
    res.send(`window.__SUPABASE_CONFIG = ${JSON.stringify({
        url:     process.env.SUPABASE_URL || "",
        anonKey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || ""
    })};`);
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..")));

// ── Auth ─────────────────────────────────────────────────────

app.post("/auth/admin-login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ success: false, message: "Username and password required." });
    if (username === ADMIN_USERNAME && hashPassword(password) === ADMIN_PW_HASH)
        return res.json({ success: true });
    res.status(401).json({ success: false, message: "Invalid admin credentials." });
});

// ── Bus management ────────────────────────────────────────────

app.post("/bus", async (req, res) => {
    const { route, name, type, time, duration, seats, price, rating } = req.body;
    if (!route || !name || !type || !time || !price)
        return res.status(400).json({ success: false, message: "route, name, type, time and price are required." });

    const { data, error } = await supabase.from("buses").insert([{
        route, name, type, time,
        duration: duration || "—",
        seats:    parseInt(seats)  || 40,
        price:    parseFloat(price),
        rating:   parseFloat(rating) || 4.0,
        active:   true,
    }]).select().single();

    if (error) return res.status(500).json({ success: false, message: error.message });
    console.log("Bus added:", name, "on", route);
    res.json({ success: true, bus: data });
});

// All buses — admin view (must be before /buses/:route)
app.get("/buses", async (req, res) => {
    const { data, error } = await supabase
        .from("buses").select("*")
        .order("route").order("time");
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, buses: data || [] });
});

// Buses for a specific route — user search
app.get("/buses/:route", async (req, res) => {
    const { data, error } = await supabase
        .from("buses").select("*")
        .eq("route", req.params.route)
        .eq("active", true)
        .order("time");
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, buses: data || [] });
});

app.delete("/bus/:id", async (req, res) => {
    const { error } = await supabase.from("buses")
        .update({ active: false }).eq("id", req.params.id);
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, message: "Bus removed." });
});

// ── Routes & Stops (NEW) ──────────────────────────────────────

// Get all active routes
app.get("/api/routes", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("routes")
            .select("*")
            .eq("active", true)
            .order("name");
        
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        
        res.json({ success: true, routes: data || [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all stops for a specific route (ordered by sequence)
app.get("/api/routes/:id/stops", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("stops")
            .select("*")
            .eq("route_id", req.params.id)
            .order("sequence");
        
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        
        res.json({ success: true, stops: data || [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Seat availability ─────────────────────────────────────────

app.get("/seats/booked", async (req, res) => {
    const { busId, date } = req.query;
    if (!busId || !date)
        return res.status(400).json({ success: false, message: "busId and date required." });

    const { data, error } = await supabase.from("bookings").select("seats")
        .eq("bus_name", busId).eq("date", date).neq("status", "cancelled");

    if (error) return res.status(500).json({ success: false, message: error.message });

    const booked = (data || [])
        .flatMap(r => (r.seats || "").split(",").map(s => s.trim()))
        .filter(Boolean);
    res.json({ success: true, booked });
});

// ── Bookings ──────────────────────────────────────────────────

app.post("/booking", async (req, res) => {
    const b = req.body;
    const { error } = await supabase.from("bookings").insert([{
        ref:            b.ref,
        user_email:     b.contactEmail,
        route:          b.route,
        bus_name:       b.busName,
        bus_type:       b.busType,
        date:           b.date,
        time:           b.time,
        seats:          b.seats,
        passengers:     b.passengers,
        contact_email:  b.contactEmail,
        contact_phone:  b.contactPhone,
        total_amount:   b.totalAmount,
        tax:            b.tax,
        grand_total:    b.grandTotal,
        payment_method: b.paymentMethod,
        status:         b.status || "confirmed",
        booked_at:      b.bookedAt || new Date().toISOString(),
    }]);
    if (error) { console.error("Insert error:", error.message); return res.status(500).json({ success: false, message: error.message }); }
    console.log("Booking saved:", b.ref);
    res.json({ success: true, message: "Booking saved successfully!" });
});

app.post("/booking/cancel", async (req, res) => {
    const { ref } = req.body;
    if (!ref) return res.status(400).json({ success: false, message: "ref required." });
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("ref", ref);
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, message: "Booking cancelled." });
});

app.get("/bookings", async (req, res) => {
    const { data, error } = await supabase.from("bookings").select("*").order("booked_at", { ascending: false });
    if (error) return res.status(500).json({ success: false, message: error.message });
    const bookings = (data || []).map(r => ({
        ref:           r.ref,
        route:         r.route,
        busName:       r.bus_name,
        busType:       r.bus_type,
        date:          r.date,
        time:          r.time,
        seats:         r.seats,
        passengers:    r.passengers,
        contactEmail:  r.contact_email,
        contactPhone:  r.contact_phone,
        totalAmount:   r.total_amount,
        tax:           r.tax,
        grandTotal:    r.grand_total,
        paymentMethod: r.payment_method,
        status:        r.status,
        bookedAt:      r.booked_at,
    }));
    res.json({ success: true, bookings });
});

// ── SEGMENT-BASED BOOKING (Intermediate Stops) ────────────────

// Get available segments for a bus schedule
app.get("/api/segments/:scheduleId", async (req, res) => {
    try {
        const { scheduleId } = req.params;
        
        const { data: schedule, error: schedError } = await supabase
            .from("bus_schedules")
            .select("route_id")
            .eq("id", scheduleId)
            .single();
        
        if (schedError) return res.status(500).json({ success: false, message: schedError.message });
        if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });
        
        // Get all stops for this route, ordered by sequence
        const { data: stops, error: stopsError } = await supabase
            .from("stops")
            .select("id, name, sequence, arrival_time, departure_time")
            .eq("route_id", schedule.route_id)
            .order("sequence");
        
        if (stopsError) return res.status(500).json({ success: false, message: stopsError.message });
        
        res.json({ success: true, stops: stops || [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get segment-aware seat availability
app.get("/api/seats/segment-availability", async (req, res) => {
    try {
        const { scheduleId, boardingStopSeq, droppingStopSeq } = req.query;
        
        if (!scheduleId || boardingStopSeq === undefined || droppingStopSeq === undefined) {
            return res.status(400).json({ success: false, message: "scheduleId, boardingStopSeq, and droppingStopSeq required" });
        }
        
        // Get the bus_id from the schedule
        const { data: schedule, error: schedError } = await supabase
            .from("bus_schedules")
            .select("bus_id, available_seats")
            .eq("id", scheduleId)
            .single();
        
        if (schedError) return res.status(500).json({ success: false, message: schedError.message });
        if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });
        
        const busId = schedule.bus_id;
        const boarding = parseInt(boardingStopSeq);
        const dropping = parseInt(droppingStopSeq);
        
        // Get all seats for this bus
        const { data: allSeats, error: seatsError } = await supabase
            .from("bus_seats")
            .select("id, seat_number, row, column")
            .eq("bus_id", busId);
        
        if (seatsError) return res.status(500).json({ success: false, message: seatsError.message });
        
        // Get bookings that overlap with the requested segment
        const { data: bookings, error: bookingsError } = await supabase
            .from("bookings_v2")
            .select("seat_id, boarding_sequence, dropping_sequence")
            .eq("schedule_id", scheduleId);
        
        if (bookingsError) return res.status(500).json({ success: false, message: bookingsError.message });
        
        // Determine which seats are available for this segment
        const bookedSeatIds = new Set();
        (bookings || []).forEach(booking => {
            // A seat is booked for this segment if:
            // The booking starts before or at our dropping point AND ends at or after our boarding point
            if (booking.boarding_sequence <= dropping && booking.dropping_sequence >= boarding) {
                bookedSeatIds.add(booking.seat_id);
            }
        });
        
        const availableSeats = (allSeats || []).filter(seat => !bookedSeatIds.has(seat.id));
        
        res.json({ 
            success: true, 
            availableSeats,
            bookedCount: bookedSeatIds.size,
            totalSeats: allSeats.length
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Book a seat with intermediate stops
app.post("/api/bookings/segment", async (req, res) => {
    try {
        const {
            userId,
            scheduleId,
            busId,
            seatId,
            seatNumber,
            boardingStopId,
            boardingStopName,
            boardingStopSeq,
            droppingStopId,
            droppingStopName,
            droppingStopSeq,
            passengerName,
            passengerPhone,
            passengerAge,
            passengerGender,
            amount,
            tax,
            grandTotal,
            paymentMethod,
            contactEmail,
            contactPhone
        } = req.body;
        
        // Validation
        if (!scheduleId || !busId || !seatId || !boardingStopId || !droppingStopId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        
        if (boardingStopSeq >= droppingStopSeq) {
            return res.status(400).json({ success: false, message: "Dropping stop must be after boarding stop" });
        }
        
        // Create booking
        const { data: booking, error } = await supabase
            .from("bookings_v2")
            .insert([{
                user_id: userId,
                bus_id: busId,
                schedule_id: scheduleId,
                seat_id: seatId,
                seat_number: seatNumber,
                boarding_stop_id: boardingStopId,
                boarding_stop: boardingStopName,
                boarding_sequence: boardingStopSeq,
                dropping_stop_id: droppingStopId,
                dropping_stop: droppingStopName,
                dropping_sequence: droppingStopSeq,
                passenger_name: passengerName,
                passenger_phone: passengerPhone,
                passenger_age: passengerAge,
                passenger_gender: passengerGender,
                amount,
                tax,
                grand_total: grandTotal,
                payment_method: paymentMethod,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                booking_status: "confirmed",
                payment_status: "completed"
            }])
            .select()
            .single();
        
        if (error) return res.status(500).json({ success: false, message: error.message });
        
        res.json({ 
            success: true, 
            message: "Booking confirmed!",
            booking
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update exit stop (mark passenger as alighting at an intermediate stop)
app.patch("/api/bookings/:bookingId/exit-stop", async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { exitStopId, exitStopName, exitStopSeq } = req.body;
        
        if (!exitStopId) {
            return res.status(400).json({ success: false, message: "exitStopId required" });
        }
        
        // Update the dropping stop to the intermediate exit stop
        const { error } = await supabase
            .from("bookings_v2")
            .update({
                dropping_stop_id: exitStopId,
                dropping_stop: exitStopName,
                dropping_sequence: exitStopSeq
            })
            .eq("id", bookingId);
        
        if (error) return res.status(500).json({ success: false, message: error.message });
        
        res.json({ 
            success: true, 
            message: "Exit stop updated. Seat availability updated for other passengers." 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SeatSync server running on http://localhost:${PORT}`));
