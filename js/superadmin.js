// ========================================
// SEATSYNC SUPER ADMIN
// ========================================

// Get Supabase client
const supabase = window.supabase;


// ========================================
// PAGE LOAD
// ========================================

async function logActivity(action, description) {

    if (!supabase) return;

    try {

        await supabase
            .from("activity_logs")
            .insert({
                action: action,
                description: description
            });

    } catch (e) {

        console.error("Activity log error:", e);

    }

}



document.addEventListener("DOMContentLoaded", () => {

    console.log("SeatSync Super Admin JS loaded.");

    // Auth guard — skip on login page
    const loginForm =
        document.getElementById(
            "superAdminLoginForm"
        );

    if (
        !loginForm &&
        localStorage.getItem("ss_role") !==
            "superadmin"
    ) {

        window.location.href =
            "superadmin-login.html";

        return;

    }

    // Dashboard
    if (document.getElementById("totalAdmins")) {
        loadDashboardStats();
        loadRecentActivity();
    }

    // Manage Admins
    if (document.getElementById("adminList")) {
        loadAdmins();
    }

    // Manage Users
    if (document.getElementById("userList")) {
        loadUsers();
    }

    // Manage Buses
    if (document.getElementById("busList")) {
        loadBuses();
    }

    // Manage Routes
    if (document.getElementById("routeList")) {
        loadRoutes();
    }

    // Manage Bookings
    if (document.getElementById("bookingList")) {
        loadBookings();
    }


    // ========================================
    // ADD ADMIN FORM
    // ========================================

    const addAdminForm =
        document.getElementById("addAdminForm");

    if (addAdminForm) {
        addAdminForm.addEventListener(
            "submit",
            handleAddAdmin
        );
    }


    // ========================================
    // ADD BUS FORM
    // ========================================

    const addBusForm =
        document.getElementById("addBusForm");

    if (addBusForm) {
        addBusForm.addEventListener(
            "submit",
            handleAddBus
        );
    }


    // ========================================
    // ADD ROUTE FORM
    // ========================================

    const addRouteForm =
        document.getElementById("addRouteForm");

    if (addRouteForm) {
        addRouteForm.addEventListener(
            "submit",
            handleAddRoute
        );
    }


});


// ========================================
// SUPER ADMIN LOGIN
// ========================================

const loginForm =
    document.getElementById("superAdminLoginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const message =
                document.getElementById(
                    "loginMessage"
                );


            if (
                username === "admin" &&
                password === "admin123"
            ) {

                localStorage.setItem(
                    "ss_role",
                    "superadmin"
                );

                window.location.href =
                    "superadmin-dashboard.html";

            } else {

                if (message) {

                    message.textContent =
                        "Invalid username or password";

                    message.className =
                        "auth-message error";

                    message.style.display =
                        "block";

                } else {

                    alert(
                        "Invalid username or password"
                    );

                }

            }

        }
    );

}


// ========================================
// DASHBOARD STATISTICS
// ========================================

async function loadDashboardStats() {

    if (!supabase) {

        console.error(
            "Supabase client is not available."
        );

        return;

    }


    // ========================================
    // ADMINS
    // ========================================

    try {

        const {
            count,
            error
        } =
            await supabase
                .from("admins")
                .select("*", {
                    count: "exact",
                    head: true
                });


        if (error) {

            console.error(
                "Admin count error:",
                error
            );

        } else {

            const element =
                document.getElementById(
                    "totalAdmins"
                );

            if (element) {

                element.textContent =
                    count || 0;

            }

        }

    } catch (error) {

        console.error(
            "Admin error:",
            error
        );

    }


    // ========================================
    // USERS
    // ========================================

    try {

        const {
            count,
            error
        } =
            await supabase
                .from("users")
                .select("*", {
                    count: "exact",
                    head: true
                });


        if (error) {

            console.error(
                "User count error:",
                error
            );

        } else {

            const element =
                document.getElementById(
                    "totalUsers"
                );

            if (element) {

                element.textContent =
                    count || 0;

            }

        }

    } catch (error) {

        console.error(
            "User error:",
            error
        );

    }


    // ========================================
    // BUSES
    // ========================================

    try {

        const {
            count,
            error
        } =
            await supabase
                .from("buses")
                .select("*", {
                    count: "exact",
                    head: true
                });


        if (error) {

            console.error(
                "Bus count error:",
                error
            );

        } else {

            const element =
                document.getElementById(
                    "totalBuses"
                );

            if (element) {

                element.textContent =
                    count || 0;

            }

        }

    } catch (error) {

        console.error(
            "Bus error:",
            error
        );

    }


    // ========================================
    // BOOKINGS
    // ========================================

    try {

        const {
            count,
            error
        } =
            await supabase
                .from("bookings")
                .select("*", {
                    count: "exact",
                    head: true
                });


        if (error) {

            console.error(
                "Booking count error:",
                error
            );

        } else {

            const element =
                document.getElementById(
                    "totalBookings"
                );

            if (element) {

                element.textContent =
                    count || 0;

            }

        }

    } catch (error) {

        console.error(
            "Booking error:",
            error
        );

    }


    // ========================================
    // REVENUE
    // ========================================

    try {

        const {
            data,
            error
        } =
            await supabase
                .from("bookings")
                .select("grand_total");


        if (error) {

            console.error(
                "Revenue error:",
                error
            );

        } else {

            let totalRevenue = 0;

            (data || []).forEach(
                booking => {

                    totalRevenue +=
                        Number(
                            booking.grand_total || 0
                        );

                }
            );


            const element =
                document.getElementById(
                    "totalRevenue"
                );


            if (element) {

                element.textContent =
                    "₹" +
                    totalRevenue.toLocaleString(
                        "en-IN"
                    );

            }

        }

    } catch (error) {

        console.error(
            "Revenue error:",
            error
        );

    }

}


// ========================================
// RECENT ACTIVITY
// ========================================

async function loadRecentActivity() {

    const container =
        document.getElementById(
            "recentActivity"
        );

    if (!container || !supabase)
        return;


    try {

        const {
            data,
            error
        } =
            await supabase
                .from("activity_logs")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(5);


        if (error) {

            console.error(
                "Recent activity error:",
                error
            );

            return;

        }


        if (!data || data.length === 0) {

            container.innerHTML =
                "<p>No recent activity.</p>";

            return;

        }


        container.innerHTML = "";


        data.forEach(
            log => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "activity-item";


                const dateStr =
                    log.created_at
                        ? new Date(
                            log.created_at
                          ).toLocaleString(
                            "en-IN"
                          )
                        : "—";


                item.innerHTML = `

                    <p>
                        📋 <strong>
                            ${log.action}
                        </strong>
                        — ${log.description}
                    </p>

                    <small>
                        ${dateStr}
                    </small>

                `;


                container.appendChild(item);

            }
        );


    } catch (error) {

        console.error(error);

    }

}


// ========================================
// ADD ADMIN
// ========================================

async function hashPassword(pw) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pw + "ss_salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function handleAddAdmin(event) {

    event.preventDefault();


    if (!supabase) {

        alert(
            "Supabase is not connected."
        );

        return;

    }


    const nameElement =
        document.getElementById(
            "adminName"
        );

    const emailElement =
        document.getElementById(
            "adminEmail"
        );

    const passwordElement =
        document.getElementById(
            "adminPassword"
        );


    if (!nameElement || !emailElement) {

        alert(
            "Admin form fields not found."
        );

        return;

    }


    const name =
        nameElement.value.trim();

    const email =
        emailElement.value.trim();

    const password =
        passwordElement
            ? passwordElement.value
            : "";


    if (!name || !email || !password) {

        alert(
            "Please fill all fields."
        );

        return;

    }


    try {

        const hashedPw =
            await hashPassword(password);

        const {
            error
        } =
            await supabase
                .from("admins")
                .insert([
                    {
                        name: name,
                        email: email,
                        password: hashedPw
                    }
                ]);


        if (error) {

            console.error(
                "Add admin error:",
                error
            );

            alert(
                "Failed to add admin.\n\n" +
                error.message
            );

            return;

        }


        alert(
            "Admin added successfully!"
        );

        logActivity("Added Admin", "Added admin: " + name + " (" + email + ")");


        event.target.reset();


        if (
            document.getElementById(
                "adminList"
            )
        ) {

            loadAdmins();

        }


        loadDashboardStats();


    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong."
        );

    }

}


// ========================================
// LOAD ADMINS
// ========================================

async function loadAdmins() {

    const list =
        document.getElementById(
            "adminList"
        );

    if (!list || !supabase)
        return;


    list.innerHTML =
        "<p>Loading admins...</p>";


    try {

        const {
            data,
            error
        } =
            await supabase
                .from("admins")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(error);

            list.innerHTML =
                "<p>Unable to load admins.</p>";

            return;

        }


        if (!data || data.length === 0) {

            list.innerHTML =
                "<p>No admins found.</p>";

            return;

        }


        list.innerHTML = "";


        data.forEach(admin => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "bus-card";


            card.innerHTML = `

                <h3>
                    👨‍💼 ${admin.name || "Admin"}
                </h3>

                <p>
                    <strong>Email:</strong>
                    ${admin.email || "—"}
                </p>

                <div class="bus-actions">

                    <button
                        class="delete-admin-btn"
                        data-id="${admin.id}">
                        Delete
                    </button>

                </div>

            `;


            list.appendChild(card);

        });


        document
            .querySelectorAll(
                ".delete-admin-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            button.dataset.id;


                        if (
                            !confirm(
                                "Are you sure you want to delete this admin?"
                            )
                        ) {

                            return;

                        }


                        const {
                            error
                        } =
                            await supabase
                                .from("admins")
                                .delete()
                                .eq(
                                    "id",
                                    id
                                );


                        if (error) {

                            alert(
                                "Failed to delete admin.\n\n" +
                                error.message
                            );

                            return;

                        }


                        alert(
                            "Admin deleted successfully!"
                        );

                        logActivity("Deleted Admin", "Deleted admin ID: " + id);


                        loadAdmins();
                        loadDashboardStats();

                    }
                );

            });


    } catch (error) {

        console.error(error);

        list.innerHTML =
            "<p>Error loading admins.</p>";

    }

}


// ========================================
// LOAD USERS
// ========================================

async function loadUsers() {

    const list =
        document.getElementById(
            "userList"
        );

    if (!list || !supabase)
        return;


    list.innerHTML =
        "<p>Loading users...</p>";


    try {

        const {
            data,
            error
        } =
            await supabase
                .from("users")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(error);

            list.innerHTML =
                "<p>Unable to load users.</p>";

            return;

        }


        if (!data || data.length === 0) {

            list.innerHTML =
                "<p>No users found.</p>";

            return;

        }


        list.innerHTML = "";


        data.forEach(user => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "bus-card";


            card.innerHTML = `

                <h3>
                    👤 ${user.name || "User"}
                </h3>

                <p>
                    <strong>Email:</strong>
                    ${user.email || "—"}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${user.phone || "—"}
                </p>

                <div class="bus-actions">

                    <button
                        class="delete-user-btn"
                        data-id="${user.id}">
                        Delete
                    </button>

                </div>

            `;


            list.appendChild(card);

        });


        document
            .querySelectorAll(
                ".delete-user-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            button.dataset.id;


                        if (
                            !confirm(
                                "Are you sure you want to delete this user?"
                            )
                        ) {

                            return;

                        }


                        const {
                            error
                        } =
                            await supabase
                                .from("users")
                                .delete()
                                .eq(
                                    "id",
                                    id
                                );


                        if (error) {

                            alert(
                                "Failed to delete user.\n\n" +
                                error.message
                            );

                            return;

                        }


                        alert(
                            "User deleted successfully!"
                        );

                        logActivity("Deleted User", "Deleted user ID: " + id);


                        loadUsers();
                        loadDashboardStats();

                    }
                );

            });


    } catch (error) {

        console.error(error);

        list.innerHTML =
            "<p>Error loading users.</p>";

    }

}


// ========================================
// ADD BUS
// ========================================

async function handleAddBus(event) {

    event.preventDefault();


    const route =
        document
            .getElementById("busRoute")
            .value
            .trim();

    const name =
        document
            .getElementById("busName")
            .value
            .trim();

    const type =
        document
            .getElementById("busType")
            .value
            .trim();

    const time =
        document
            .getElementById("busTime")
            .value;

    const duration =
        document
            .getElementById("busDuration")
            .value
            .trim();

    const seats =
        Number(
            document
                .getElementById("busSeats")
                .value
        );

    const price =
        Number(
            document
                .getElementById("busPrice")
                .value
        );

    const rating =
        Number(
            document
                .getElementById("busRating")
                .value
        );


    if (
        !route ||
        !name ||
        !type ||
        !time ||
        !duration
    ) {

        alert(
            "Please fill all fields."
        );

        return;

    }


    try {

        const {
            error
        } =
            await supabase
                .from("buses")
                .insert([
                    {
                        route: route,
                        name: name,
                        type: type,
                        time: time,
                        duration: duration,
                        seats: seats,
                        price: price,
                        rating: rating,
                        active: true
                    }
                ]);


        if (error) {

            console.error(
                "Add bus error:",
                error
            );

            alert(
                "Failed to add bus.\n\n" +
                error.message
            );

            return;

        }


        alert(
            "Bus added successfully!"
        );

        logActivity("Added Bus", "Added bus: " + name + " on " + route);


        event.target.reset();


        loadBuses();
        loadDashboardStats();


    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong while adding the bus."
        );

    }

}


// ========================================
// LOAD BUSES
// ========================================

async function loadBuses() {

    const busList =
        document.getElementById(
            "busList"
        );

    if (!busList || !supabase)
        return;


    busList.innerHTML =
        "<p>Loading buses...</p>";


    try {

        const {
            data: buses,
            error
        } =
            await supabase
                .from("buses")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Load buses error:",
                error
            );

            busList.innerHTML =
                "<p>Unable to load buses.</p>";

            return;

        }


        if (
            !buses ||
            buses.length === 0
        ) {

            busList.innerHTML =
                "<p>No buses added yet.</p>";

            return;

        }


        busList.innerHTML = "";


        buses.forEach(bus => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "bus-card";


            card.innerHTML = `

                <h3>
                    ${bus.name || "Unnamed Bus"}
                </h3>

                <p>
                    <strong>Route:</strong>
                    ${bus.route || "—"}
                </p>

                <p>
                    <strong>Type:</strong>
                    ${bus.type || "—"}
                </p>

                <p>
                    <strong>Time:</strong>
                    ${bus.time || "—"}
                </p>

                <p>
                    <strong>Duration:</strong>
                    ${bus.duration || "—"}
                </p>

                <p>
                    <strong>Seats:</strong>
                    ${bus.seats || 0}
                </p>

                <p>
                    <strong>Price:</strong>
                    ₹${bus.price || 0}
                </p>

                <p>
                    <strong>Rating:</strong>
                    ⭐ ${bus.rating || 0}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${
                        bus.active
                            ? "Active"
                            : "Inactive"
                    }
                </p>

                <div class="bus-actions">

                    <button
                        class="edit-bus-btn"
                        data-id="${bus.id}">
                        Edit
                    </button>

                    <button
                        class="toggle-bus-btn"
                        data-id="${bus.id}"
                        data-active="${bus.active}">

                        ${
                            bus.active
                                ? "Deactivate"
                                : "Activate"
                        }

                    </button>

                    <button
                        class="delete-bus-btn"
                        data-id="${bus.id}">
                        Delete
                    </button>

                </div>

            `;


            busList.appendChild(card);

        });


        setupBusButtons();


    } catch (error) {

        console.error(error);

        busList.innerHTML =
            "<p>Error loading buses.</p>";

    }

}


// ========================================
// BUS BUTTONS
// ========================================

function setupBusButtons() {

    document
        .querySelectorAll(".edit-bus-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;


                    const {
                        data: bus,
                        error
                    } =
                        await supabase
                            .from("buses")
                            .select("*")
                            .eq(
                                "id",
                                id
                            )
                            .single();


                    if (error) {

                        alert(
                            "Unable to load bus."
                        );

                        return;

                    }


                    const name =
                        prompt(
                            "Enter bus name:",
                            bus.name || ""
                        );

                    if (name === null)
                        return;


                    const route =
                        prompt(
                            "Enter route:",
                            bus.route || ""
                        );

                    if (route === null)
                        return;


                    const type =
                        prompt(
                            "Enter bus type:",
                            bus.type || ""
                        );

                    if (type === null)
                        return;


                    const time =
                        prompt(
                            "Enter departure time:",
                            bus.time || ""
                        );

                    if (time === null)
                        return;


                    const duration =
                        prompt(
                            "Enter duration:",
                            bus.duration || ""
                        );

                    if (duration === null)
                        return;


                    const {
                        error: updateError
                    } =
                        await supabase
                            .from("buses")
                            .update({
                                name:
                                    name.trim(),

                                route:
                                    route.trim(),

                                type:
                                    type.trim(),

                                time:
                                    time.trim(),

                                duration:
                                    duration.trim()
                            })
                            .eq(
                                "id",
                                id
                            );


                    if (updateError) {

                        alert(
                            "Failed to update bus.\n\n" +
                            updateError.message
                        );

                        return;

                    }


                    alert(
                        "Bus updated successfully!"
                    );

                    logActivity("Updated Bus", "Updated bus ID: " + id);


                    loadBuses();

                }
            );

        });


    document
        .querySelectorAll(".toggle-bus-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;

                    const current =
                        button.dataset.active ===
                        "true";

                    const newStatus =
                        !current;


                    const {
                        error
                    } =
                        await supabase
                            .from("buses")
                            .update({
                                active:
                                    newStatus
                            })
                            .eq(
                                "id",
                                id
                            );


                    if (error) {

                        alert(
                            "Failed to update status.\n\n" +
                            error.message
                        );

                        return;

                    }

                    logActivity("Toggled Bus", "Toggled bus ID: " + id + " to " + (newStatus ? "active" : "inactive"));

                    loadBuses();

                }
            );

        });


    document
        .querySelectorAll(".delete-bus-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;


                    if (
                        !confirm(
                            "Are you sure you want to delete this bus?"
                        )
                    ) {

                        return;

                    }


                    const {
                        error
                    } =
                        await supabase
                            .from("buses")
                            .delete()
                            .eq(
                                "id",
                                id
                            );


                    if (error) {

                        alert(
                            "Failed to delete bus.\n\n" +
                            error.message
                        );

                        return;

                    }


                    alert(
                        "Bus deleted successfully!"
                    );

                    logActivity("Deleted Bus", "Deleted bus ID: " + id);


                    loadBuses();
                    loadDashboardStats();

                }
            );

        });

}


// ========================================
// ADD ROUTE
// ========================================

async function handleAddRoute(event) {

    event.preventDefault();


    const source =
        document
            .getElementById("routeSource")
            .value
            .trim();

    const destination =
        document
            .getElementById("routeDestination")
            .value
            .trim();

    const distance =
        document
            .getElementById("routeDistance")
            .value
            .trim();

    const duration =
        document
            .getElementById("routeDuration")
            .value
            .trim();


    if (
        !source ||
        !destination ||
        !distance ||
        !duration
    ) {

        alert(
            "Please fill all fields."
        );

        return;

    }


    try {

        const {
            error
        } =
            await supabase
                .from("routes")
                .insert([
                    {
                        source: source,
                        destination: destination,
                        distance: distance,
                        duration: duration,
                        active: true
                    }
                ]);


        if (error) {

            alert(
                "Failed to add route.\n\n" +
                error.message
            );

            return;

        }


        alert(
            "Route added successfully!"
        );

        logActivity("Added Route", "Added route: " + source + " → " + destination);


        event.target.reset();

        loadRoutes();


    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong."
        );

    }

}


// ========================================
// LOAD ROUTES
// ========================================

async function loadRoutes() {

    const routeList =
        document.getElementById(
            "routeList"
        );

    if (!routeList || !supabase)
        return;


    routeList.innerHTML =
        "<p>Loading routes...</p>";


    try {

        const {
            data: routes,
            error
        } =
            await supabase
                .from("routes")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(error);

            routeList.innerHTML =
                "<p>Unable to load routes.</p>";

            return;

        }


        if (
            !routes ||
            routes.length === 0
        ) {

            routeList.innerHTML =
                "<p>No routes added yet.</p>";

            return;

        }


        routeList.innerHTML = "";


        routes.forEach(route => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "bus-card";


            card.innerHTML = `

                <h3>
                    ${route.source || "—"}
                    →
                    ${route.destination || "—"}
                </h3>

                <p>
                    <strong>Distance:</strong>
                    ${route.distance || "—"}
                </p>

                <p>
                    <strong>Duration:</strong>
                    ${route.duration || "—"}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${
                        route.active
                            ? "Active"
                            : "Inactive"
                    }
                </p>

                <div class="bus-actions">

                    <button
                        class="edit-route-btn"
                        data-id="${route.id}">
                        Edit
                    </button>

                    <button
                        class="toggle-route-btn"
                        data-id="${route.id}"
                        data-active="${route.active}">

                        ${
                            route.active
                                ? "Deactivate"
                                : "Activate"
                        }

                    </button>

                    <button
                        class="delete-route-btn"
                        data-id="${route.id}">
                        Delete
                    </button>

                </div>

            `;


            routeList.appendChild(card);

        });


        setupRouteButtons();


    } catch (error) {

        console.error(error);

        routeList.innerHTML =
            "<p>Error loading routes.</p>";

    }

}


// ========================================
// ROUTE BUTTONS
// ========================================

function setupRouteButtons() {

    document
        .querySelectorAll(
            ".edit-route-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;


                    const {
                        data: route,
                        error
                    } =
                        await supabase
                            .from("routes")
                            .select("*")
                            .eq(
                                "id",
                                id
                            )
                            .single();


                    if (error) {

                        alert(
                            "Unable to load route."
                        );

                        return;

                    }


                    const source =
                        prompt(
                            "Enter source:",
                            route.source || ""
                        );

                    if (source === null)
                        return;


                    const destination =
                        prompt(
                            "Enter destination:",
                            route.destination || ""
                        );

                    if (destination === null)
                        return;


                    const distance =
                        prompt(
                            "Enter distance:",
                            route.distance || ""
                        );

                    if (distance === null)
                        return;


                    const duration =
                        prompt(
                            "Enter duration:",
                            route.duration || ""
                        );

                    if (duration === null)
                        return;


                    const {
                        error: updateError
                    } =
                        await supabase
                            .from("routes")
                            .update({
                                source:
                                    source.trim(),

                                destination:
                                    destination.trim(),

                                distance:
                                    distance.trim(),

                                duration:
                                    duration.trim()
                            })
                            .eq(
                                "id",
                                id
                            );


                    if (updateError) {

                        alert(
                            "Failed to update route.\n\n" +
                            updateError.message
                        );

                        return;

                    }


                    alert(
                        "Route updated successfully!"
                    );

                    logActivity("Updated Route", "Updated route ID: " + id);


                    loadRoutes();

                }
            );

        });


    document
        .querySelectorAll(
            ".toggle-route-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;

                    const current =
                        button.dataset.active ===
                        "true";


                    const {
                        error
                    } =
                        await supabase
                            .from("routes")
                            .update({
                                active:
                                    !current
                            })
                            .eq(
                                "id",
                                id
                            );


                    if (error) {

                        alert(
                            "Failed to update route.\n\n" +
                            error.message
                        );

                        return;

                    }

                    logActivity("Toggled Route", "Toggled route ID: " + id);

                    loadRoutes();

                }
            );

        });


    document
        .querySelectorAll(
            ".delete-route-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;


                    if (
                        !confirm(
                            "Are you sure you want to delete this route?"
                        )
                    ) {

                        return;

                    }


                    const {
                        error
                    } =
                        await supabase
                            .from("routes")
                            .delete()
                            .eq(
                                "id",
                                id
                            );


                    if (error) {

                        alert(
                            "Failed to delete route.\n\n" +
                            error.message
                        );

                        return;

                    }


                    alert(
                        "Route deleted successfully!"
                    );

                    logActivity("Deleted Route", "Deleted route ID: " + id);


                    loadRoutes();

                }
            );

        });

}



// ========================================
// LOAD BOOKINGS
// ========================================

async function loadBookings() {

    const list =
        document.getElementById(
            "bookingList"
        );

    if (!list || !supabase)
        return;


    list.innerHTML =
        "<p>Loading bookings...</p>";


    try {

        const {
            data: bookings,
            error
        } =
            await supabase
                .from("bookings")
                .select("*")
                .order(
                    "booked_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Bookings error:",
                error
            );


            list.innerHTML = `
                <div class="alert alert-error">

                    <h3>
                        Unable to load bookings
                    </h3>

                    <p>
                        ${error.message}
                    </p>

                </div>
            `;

            return;

        }


        if (
            !bookings ||
            bookings.length === 0
        ) {

            list.innerHTML = `
                <div class="empty-state">

                    <div class="icon">
                        🎟️
                    </div>

                    <h3>
                        No bookings yet
                    </h3>

                    <p>
                        There are currently no bookings.
                    </p>

                </div>
            `;

            return;

        }


        list.innerHTML = "";


        bookings.forEach(booking => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "bus-card";


            card.innerHTML = `

                <h3>
                    🎟️ Booking
                    ${
                        booking.ref ||
                        booking.id
                    }
                </h3>

                <p>
                    <strong>ID:</strong>
                    ${booking.id || "—"}
                </p>

                <p>
                    <strong>Reference:</strong>
                    ${booking.ref || "—"}
                </p>

                <p>
                    <strong>User Email:</strong>
                    ${booking.user_email || "—"}
                </p>

                <p>
                    <strong>Route:</strong>
                    ${booking.route || "—"}
                </p>

                <p>
                    <strong>Bus Name:</strong>
                    ${booking.bus_name || "—"}
                </p>

                <p>
                    <strong>Bus Type:</strong>
                    ${booking.bus_type || "—"}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${booking.date || "—"}
                </p>

                <p>
                    <strong>Time:</strong>
                    ${
                        booking.time
                            ? formatTime(
                                booking.time
                            )
                            : "—"
                    }
                </p>

                <p>
                    <strong>Seats:</strong>
                    ${booking.seats || "—"}
                </p>

                <p>
                    <strong>Passengers:</strong>
                    ${booking.passengers || "—"}
                </p>

                <p>
                    <strong>Contact Email:</strong>
                    ${booking.contact_email || "—"}
                </p>

                <p>
                    <strong>Contact Phone:</strong>
                    ${booking.contact_phone || "—"}
                </p>

                <p>
                    <strong>Total Amount:</strong>
                    ₹${booking.total_amount || 0}
                </p>

                <p>
                    <strong>Tax:</strong>
                    ₹${booking.tax || 0}
                </p>

                <p>
                    <strong>Grand Total:</strong>
                    ₹${booking.grand_total || 0}
                </p>

                <p>
                    <strong>Payment Method:</strong>
                    ${
                        booking.payment_method ||
                        "—"
                    }
                </p>

                <p>
                    <strong>Status:</strong>
                    ${
                        booking.status ||
                        "—"
                    }
                </p>

                <p>
                    <strong>Booked At:</strong>
                    ${formatBookedDate(
                        booking.booked_at
                    )}
                </p>

                <div class="bus-actions">

                    <button
                        class="edit-booking-btn"
                        data-id="${booking.id}">
                        Edit Status
                    </button>

                    <button
                        class="delete-booking-btn"
                        data-id="${booking.id}">
                        Delete
                    </button>

                </div>

            `;


            list.appendChild(card);

        });


        setupBookingButtons();


    } catch (error) {

        console.error(error);

        list.innerHTML =
            "<p>Error loading bookings.</p>";

    }

}


// ========================================
// BOOKING BUTTONS
// ========================================

function setupBookingButtons() {

    document
        .querySelectorAll(
            ".edit-booking-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;


                    const {
                        data: booking,
                        error
                    } =
                        await supabase
                            .from("bookings")
                            .select("*")
                            .eq(
                                "id",
                                id
                            )
                            .single();


                    if (error) {

                        alert(
                            "Unable to load booking."
                        );

                        return;

                    }


                    const status =
                        prompt(
                            "Enter booking status:",
                            booking.status ||
                            "Confirmed"
                        );


                    if (status === null)
                        return;


                    const {
                        error: updateError
                    } =
                        await supabase
                            .from("bookings")
                            .update({
                                status:
                                    status.trim()
                            })
                            .eq(
                                "id",
                                id
                            );


                    if (updateError) {

                        alert(
                            "Failed to update booking.\n\n" +
                            updateError.message
                        );

                        return;

                    }


                    alert(
                        "Booking updated successfully!"
                    );

                    logActivity("Updated Booking", "Updated booking ID: " + id + " status to " + status.trim());


                    loadBookings();
                    loadDashboardStats();

                }
            );

        });


    document
        .querySelectorAll(
            ".delete-booking-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;


                    if (
                        !confirm(
                            "Are you sure you want to delete this booking?"
                        )
                    ) {

                        return;

                    }


                    const {
                        error
                    } =
                        await supabase
                            .from("bookings")
                            .delete()
                            .eq(
                                "id",
                                id
                            );


                    if (error) {

                        alert(
                            "Failed to delete booking.\n\n" +
                            error.message
                        );

                        return;

                    }


                    alert(
                        "Booking deleted successfully!"
                    );

                    logActivity("Deleted Booking", "Deleted booking ID: " + id);


                    loadBookings();
                    loadDashboardStats();

                }
            );

        });

}


// ========================================
// FORMAT TIME
// ========================================

function formatTime(time) {

    if (!time)
        return "—";


    const parts =
        time.split(":");


    const hours =
        Number(parts[0]);


    const minutes =
        parts[1] || "00";


    const period =
        hours >= 12
            ? "PM"
            : "AM";


    const hour12 =
        hours % 12 || 12;


    return (
        String(hour12).padStart(2, "0") +
        ":" +
        minutes +
        " " +
        period
    );

}


// ========================================
// FORMAT BOOKING DATE
// ========================================

function formatBookedDate(date) {

    if (!date)
        return "—";


    try {

        return new Date(
            date
        ).toLocaleString(
            "en-IN"
        );

    } catch (error) {

        return date;

    }

}


// ========================================
// LOGOUT
// ========================================

function logout() {

    localStorage.removeItem("ss_role");

    window.location.href =
        "superadmin-login.html";

}

window.logout = logout;
