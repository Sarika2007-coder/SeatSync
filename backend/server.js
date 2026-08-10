const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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

const bookingsFile = path.join(__dirname, "bookings.json");

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

// Save a booking
app.post("/booking", (req, res) => {
    const newBooking = req.body;

    fs.readFile(bookingsFile, "utf8", (err, data) => {
        let bookings = [];

        if (!err && data) {
            try {
                bookings = JSON.parse(data);
            } catch (error) {
                bookings = [];
            }
        }

        bookings.push(newBooking);

        fs.writeFile(
            bookingsFile,
            JSON.stringify(bookings, null, 2),
            (err) => {
                if (err) {
                    console.error("Error saving booking:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Could not save booking"
                    });
                }

                console.log("New booking saved:", newBooking);

                res.json({
                    success: true,
                    message: "Booking saved successfully!"
                });
            }
        );
    });
});

// Cancel a booking by index (admin) or by ref (user)
app.post("/booking/cancel", (req, res) => {
    const { index, ref } = req.body;
    if (index === undefined && !ref)
        return res.status(400).json({ success: false, message: "Index or ref required." });

    fs.readFile(bookingsFile, "utf8", (err, data) => {
        let bookings = [];
        if (!err && data) {
            try { bookings = JSON.parse(data); } catch (_) {}
        }

        const idx = ref !== undefined
            ? bookings.findIndex(b => b.ref === ref)
            : index;

        if (idx < 0 || idx >= bookings.length)
            return res.status(404).json({ success: false, message: "Booking not found." });

        bookings.splice(idx, 1);
        fs.writeFile(bookingsFile, JSON.stringify(bookings, null, 2), (err) => {
            if (err) return res.status(500).json({ success: false, message: "Could not update bookings." });
            res.json({ success: true, message: "Booking cancelled." });
        });
    });
});

// Get all bookings for Admin Dashboard
app.get("/bookings", (req, res) => {
    fs.readFile(bookingsFile, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Could not read bookings"
            });
        }

        let bookings = [];

        try {
            bookings = data ? JSON.parse(data) : [];
        } catch (error) {
            bookings = [];
        }

        res.json({
            success: true,
            bookings: bookings
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SeatSync server running on http://localhost:${PORT}`);
});