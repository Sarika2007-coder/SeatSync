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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SeatSync server running on http://localhost:${PORT}`));
