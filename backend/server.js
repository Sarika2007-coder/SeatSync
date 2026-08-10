const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// Load .env from project root (Node 22+ built-in)
try {
    process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch {
    // .env not found — fall back to system environment variables
}

// Serve Supabase config to the frontend — publishable key only, never the secret key
app.get('/js/env-config.js', (req, res) => {
    const config = {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || ''
    };
    res.type('application/javascript');
    res.send(`window.__SUPABASE_CONFIG = ${JSON.stringify(config)};`);
});

// Serve frontend from project root
app.use(express.static(path.join(__dirname, "..")));

// Supabase client — uses service role key to bypass RLS (server-side only)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    console.error("ERROR: SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env");
    process.exit(1);
}

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    console.error("ERROR: ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
}
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PW_HASH = crypto.createHash("sha256")
    .update(process.env.ADMIN_PASSWORD + "ss_salt")
    .digest("hex");

function hashPassword(pw) {
    return crypto.createHash("sha256").update(pw + "ss_salt").digest("hex");
}

// Admin login (uses username/password, separate from Supabase user auth)
app.post("/auth/admin-login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ success: false, message: "Username and password required." });
    if (username === ADMIN_USERNAME && hashPassword(password) === ADMIN_PW_HASH)
        return res.json({ success: true });
    res.status(401).json({ success: false, message: "Invalid admin credentials." });
});

// Save a booking to Supabase
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

    if (error) {
        console.error("Supabase insert error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
    console.log("Booking saved to Supabase:", b.ref);
    res.json({ success: true, message: "Booking saved successfully!" });
});

// Cancel a booking by ref (marks status = 'cancelled' in Supabase)
app.post("/booking/cancel", async (req, res) => {
    const { ref } = req.body;
    if (!ref) return res.status(400).json({ success: false, message: "ref required." });

    const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("ref", ref);

    if (error) {
        console.error("Cancel error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
    res.json({ success: true, message: "Booking cancelled." });
});

// Get all bookings for Admin Dashboard
app.get("/bookings", async (req, res) => {
    const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("booked_at", { ascending: false });

    if (error) {
        console.error("Fetch bookings error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }

    // Normalise column names to match existing frontend expectations
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
app.listen(PORT, () => {
    console.log(`SeatSync server running on http://localhost:${PORT}`);
});