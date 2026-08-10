// ---- Shared auth utilities ----

function checkUserRole() {
    const role = localStorage.getItem("role");
    if (!role) window.location.href = "index.html";
}

async function logout() {
    try {
        if (window.supabaseAuth) await window.supabaseAuth.signOutUser();
    } catch (error) {
        console.warn('Logout error:', error);
    }
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
}

async function showCurrentUserInfo() {
    if (!window.supabaseAuth) return;
    const session = await window.supabaseAuth.getSession();
    const user = session?.user;
    if (user) {
        const userInfo = document.getElementById('userInfo');
        if (userInfo) userInfo.textContent = `Logged in as ${user.email}`;
    }
}


// ---- User auth (user-login.html) ----

let isSignupMode = false;

function setAuthMode(signup) {
    isSignupMode = signup;
    const authButton = document.getElementById('authButton');
    const authToggleText = document.getElementById('authToggleText');
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    const confirmPasswordRow = document.getElementById('confirmPasswordRow');
    const loginMessage = document.getElementById('loginMessage');
    if (authButton) authButton.textContent = signup ? 'Sign Up' : 'Login';
    if (authToggleText) authToggleText.textContent = signup ? 'Already have an account?' : "Don't have an account?";
    if (toggleAuthMode) toggleAuthMode.textContent = signup ? 'Login' : 'Create one';
    if (confirmPasswordRow) confirmPasswordRow.style.display = signup ? 'block' : 'none';
    if (loginMessage) loginMessage.textContent = '';
}

async function handleAuthSubmit(event) {
    event.preventDefault();
    const loginMessage = document.getElementById('loginMessage');
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value.trim();
    const confirmPasswordEl = document.getElementById('confirmPassword');
    const confirmPassword = confirmPasswordEl ? confirmPasswordEl.value.trim() : '';

    if (!email || !password || (isSignupMode && !confirmPassword)) {
        if (loginMessage) loginMessage.textContent = 'Please fill in all required fields.';
        return;
    }
    if (isSignupMode && password !== confirmPassword) {
        if (loginMessage) loginMessage.textContent = 'Passwords do not match.';
        return;
    }

    if (loginMessage) loginMessage.textContent = isSignupMode ? 'Creating account...' : 'Signing in...';

    try {
        const result = isSignupMode
            ? await window.supabaseAuth.signUpUser(email, password)
            : await window.supabaseAuth.signInUser(email, password);

        if (result.error) {
            if (loginMessage) loginMessage.textContent = result.error.message || 'Unable to authenticate.';
            return;
        }
        if (isSignupMode) {
            if (loginMessage) loginMessage.textContent = 'Account created! You can now log in.';
            setAuthMode(false);
            return;
        }
        window.location.href = 'user-dashboard.html';
    } catch (error) {
        console.error('Auth error:', error);
        if (loginMessage) loginMessage.textContent = 'Authentication failed. Try again.';
    }
}

// Wire up toggle only when user-login elements exist
(function () {
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    if (toggleAuthMode) {
        toggleAuthMode.addEventListener('click', () => setAuthMode(!isSignupMode));
        setAuthMode(false);
    }
})();


// ---- Admin auth (admin-login.html) ----

async function adminLogin(event) {
    event.preventDefault();
    const adminMessage = document.getElementById('adminMessage');
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();

    if (!username || !password) {
        if (adminMessage) adminMessage.textContent = 'Please enter username and password.';
        return;
    }
    if (adminMessage) adminMessage.textContent = 'Signing in...';

    try {
        const res = await fetch('/auth/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!data.success) {
            if (adminMessage) adminMessage.textContent = data.message || 'Invalid credentials.';
            return;
        }
        localStorage.setItem('role', 'admin');
        window.location.href = 'admin-dashboard.html';
    } catch (error) {
        console.error('Admin auth error:', error);
        if (adminMessage) adminMessage.textContent = 'Login failed. Is the server running?';
    }
}


// ---- Dashboard functions ----

function viewBookings() {
    alert("My bookings page will be added here.");
}

function manageRoutes() {
    alert("Route management section");
}

function manageBuses() {
    alert("Bus management section");
}

function manageTimings() {
    alert("Bus timing management section");
}

