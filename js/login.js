function userLogin(event) {

    event.preventDefault();

    const email = document.getElementById("userEmail").value;
    const password = document.getElementById("userPassword").value;

    if (email !== "" && password !== "") {

        // Store the role
        localStorage.setItem("role", "user");
        localStorage.setItem("userEmail", email);

        // Go to user dashboard
        window.location.href = "user-dashboard.html";

    } else {

        document.getElementById("loginMessage").textContent =
            "Please enter your details.";

    }
}


function adminLogin(event) {

    event.preventDefault();

    const username = document.getElementById("adminUsername").value;
    const password = document.getElementById("adminPassword").value;

    // Demo admin credentials
    if (username === "admin" && password === "1234") {

        localStorage.setItem("role", "admin");

        window.location.href = "admin-dashboard.html";

    } else {

        document.getElementById("adminMessage").textContent =
            "Invalid admin username or password.";

    }
}