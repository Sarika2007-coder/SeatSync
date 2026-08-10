// Check user role
function checkUserRole() {

    const role = localStorage.getItem("role");

    if (!role) {

        window.location.href = "index.html";

    }

}


// Logout
function logout() {

    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");

    window.location.href = "index.html";

}


// User functions

function viewBookings() {

    alert("My bookings page will be added here.");

}


// Admin functions

function manageRoutes() {

    alert("Route management section");

}


function manageBuses() {

    alert("Bus management section");

}


function manageTimings() {

    alert("Bus timing management section");

}


async function viewAllBookings() {

    try {

        const response = await fetch("http://localhost:3000/bookings");

        const data = await response.json();

        if (!data.success) {
            alert("Could not load bookings.");
            return;
        }

        const bookings = data.bookings;

        if (bookings.length === 0) {
            alert("No passenger bookings found.");
            return;
        }

        let bookingHTML = `
            <h2>📋 Passenger Bookings</h2>
            <div class="booking-list">
        `;

        bookings.forEach((booking, index) => {

            bookingHTML += `
                <div class="booking-item">

                    <h3>Booking ${index + 1}</h3>

                    <p><strong>Route:</strong> ${booking.route || "N/A"}</p>

                    <p><strong>Bus:</strong> ${booking.bus || "N/A"}</p>

                    <p><strong>Time:</strong> ${booking.time || "N/A"}</p>

                    <p><strong>Seat:</strong> ${booking.seats || "N/A"}</p>

                    <p><strong>Name:</strong> ${booking.name || "N/A"}</p>

                    <p><strong>Mobile:</strong> ${booking.mobile || "N/A"}</p>

                    <p><strong>Email:</strong> ${booking.email || "N/A"}</p>

                    <p><strong>Price:</strong> ₹${booking.totalPrice || 0}</p>

                    <p><strong>Booking Date:</strong> ${booking.bookingDate || "N/A"}</p>

                </div>
            `;

        });

       

        bookingHTML += `</div>`;
        bookingHTML += `
    <div class="back-button-container">
        <button onclick="window.close()">
            ← Go Back
        </button>
    </div>
`;

        const bookingWindow = window.open("", "_blank");

        bookingWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SeatSync - Passenger Bookings</title>

                <style>

                    body {
                        font-family: Arial, sans-serif;
                        background: #eef3ff;
                        padding: 30px;
                        color: #172554;
                    }

                    h2 {
                        text-align: center;
                    }

                    .booking-list {
                        max-width: 800px;
                        margin: auto;
                    }

                    .booking-item {
                        background: white;
                        padding: 20px;
                        margin: 20px 0;
                        border-radius: 15px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    }

                    .booking-item h3 {
                        color: #2563eb;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 10px;
                    }

                    .booking-item p {
                        margin: 8px 0;
                    }

                </style>

            </head>

            <body>

                ${bookingHTML}

            </body>
            </html>
        `);

        bookingWindow.document.close();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to SeatSync server. Make sure the backend is running."
        );

    }

}

// ==========================================
// LOAD BOOKING COUNT
// ==========================================

async function loadBookingCount() {

    try {

        const response = await fetch("http://localhost:3000/bookings");

        const data = await response.json();

        if (data.success) {

            const countElement =
                document.getElementById("bookingCount");

            if (countElement) {
                countElement.textContent = data.bookings.length;
            }

        }

    } catch (error) {

        console.error("Error loading booking count:", error);

    }

}

window.addEventListener("DOMContentLoaded", loadBookingCount);