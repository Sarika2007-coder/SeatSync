// Check user role
function checkUserRole() {
    const role = localStorage.getItem("ss_role");
    if (!role) {
        window.location.href = "index.html";
    }
}

// Logout
async function logout() {
    try {
        if (window.supabaseAuth) {
            await window.supabaseAuth.signOutUser();
        }
    } catch (error) {
        console.warn('Supabase logout error:', error);
    }

    localStorage.removeItem("ss_role");
    localStorage.removeItem("ss_email");

    window.location.href = "index.html";
}

async function showCurrentUserInfo() {
    if (!window.supabaseAuth) {
        return;
    }

    const session = await window.supabaseAuth.getSession();
    const user = session?.user;
    if (user) {
        const badge = document.getElementById('userInfo');
        if (badge) badge.style.display = 'flex';
        const emailEl = document.getElementById('userEmailDisplay');
        if (emailEl) emailEl.textContent = user.email;
    }
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
        const response = await fetch("/api/bookings");
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
                    <p><strong>Bus:</strong> ${booking.busName || "N/A"}</p>
                    <p><strong>Time:</strong> ${booking.time || "N/A"}</p>
                    <p><strong>Seat:</strong> ${booking.seats || "N/A"}</p>
                    <p><strong>Name:</strong> ${booking.contactEmail || "N/A"}</p>
                    <p><strong>Phone:</strong> ${booking.contactPhone || "N/A"}</p>
                    <p><strong>Email:</strong> ${booking.contactEmail || "N/A"}</p>
                    <p><strong>Price:</strong> ₹${booking.grandTotal || booking.totalAmount || 0}</p>
                    <p><strong>Booking Date:</strong> ${booking.bookedAt || "N/A"}</p>
                </div>
            `;
        });

        bookingHTML += `</div>`;
        bookingHTML += `
    <div class="back-button-container">
        <button onclick="window.close()">← Go Back</button>
    </div>
`;

        const bookingWindow = window.open("", "_blank");
        bookingWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SeatSync - Passenger Bookings</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #eef3ff; padding: 30px; color: #172554; }
                    h2 { text-align: center; }
                    .booking-list { max-width: 800px; margin: auto; }
                    .booking-item { background: white; padding: 20px; margin: 20px 0; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                    .booking-item h3 { color: #2563eb; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                    .booking-item p { margin: 8px 0; }
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
        alert("Unable to connect to SeatSync server. Make sure the backend is running.");
    }
}

// ==========================================
// LOAD BOOKING COUNT
// ==========================================

async function loadBookingCount() {
    if (!window.supabase) {
        return;
    }

    try {
        let userEmail = '';
        if (window.supabaseAuth) {
            const session = await window.supabaseAuth.getSession();
            userEmail = session?.user?.email || '';
        }
        if (!userEmail) userEmail = localStorage.getItem('ss_email') || '';
        if (!userEmail) return;

        const { data: bookings, error } = await window.supabase
            .from('bookings')
            .select('id')
            .eq('user_email', userEmail);

        if (error) {
            console.error('Supabase booking count error:', error);
            return;
        }

        const countElement = document.getElementById("bookingCount");
        if (countElement) {
            countElement.textContent = bookings ? bookings.length : '0';
        }
    } catch (error) {
        console.error("Error loading booking count:", error);
    }
}

window.addEventListener("DOMContentLoaded", loadBookingCount);
window.addEventListener('DOMContentLoaded', showCurrentUserInfo);
