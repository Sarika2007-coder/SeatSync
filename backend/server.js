const express = require("express");
const cors = require("cors")
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.json());

const bookingsFile = path.join(__dirname, "bookings.json");

// Home test
app.get("/", (req, res) => {
    res.send("SeatSync Backend is Working!");
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


// Start server
app.listen(3000, () => {
    console.log("SeatSync server running on http://localhost:3000");
});