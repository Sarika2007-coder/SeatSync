// ── User auth elements (only present on user-login.html) ──────
const loginMessage = document.getElementById('loginMessage');
const authForm = document.getElementById('authForm');
const authButton = document.getElementById('authButton');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authToggleText = document.getElementById('authToggleText');
const confirmPasswordRow = document.getElementById('confirmPasswordRow');

let isSignupMode = false;

function showUserMsg(text, type) {
    if (!loginMessage) return;
    loginMessage.textContent = text;
    loginMessage.className = 'auth-message' + (type ? ' ' + type : '');
    loginMessage.style.display = text ? 'block' : 'none';
}

function setAuthMode(signup) {
    isSignupMode = signup;
    if (authButton) authButton.textContent = signup ? 'Sign Up' : 'Login';
    if (authToggleText) authToggleText.textContent = signup ? 'Already have an account?' : "Don't have an account?";
    if (toggleAuthMode) toggleAuthMode.textContent = signup ? 'Login' : 'Create one';
    if (confirmPasswordRow) confirmPasswordRow.style.display = signup ? 'block' : 'none';
    showUserMsg('');
}

async function handleAuthSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword')?.value.trim();

    if (!email || !password || (isSignupMode && !confirmPassword)) {
        showUserMsg('Please fill in all required fields.', 'error');
        return;
    }

    if (isSignupMode && password !== confirmPassword) {
        showUserMsg('Passwords do not match.', 'error');
        return;
    }

    showUserMsg(isSignupMode ? 'Creating account...' : 'Signing in...', 'info');

    try {
        let result;
        if (isSignupMode) {
            result = await window.supabaseAuth.signUpUser(email, password);
        } else {
            result = await window.supabaseAuth.signInUser(email, password);
        }

        if (result.error) {
            showUserMsg(result.error.message || 'Unable to authenticate.', 'error');
            return;
        }

        if (isSignupMode) {
            showUserMsg('Account created. Please check your email to confirm your account.', 'success');
            return;
        }

        localStorage.setItem('ss_role', 'user');
        localStorage.setItem('ss_email', email);

        if (result.data?.session?.user) {
            window.location.href = 'user-dashboard.html';
            return;
        }

        showUserMsg('Login succeeded. Redirecting...', 'info');
        window.location.href = 'user-dashboard.html';

    } catch (error) {
        console.error('Auth error:', error);
        showUserMsg('Authentication failed. Try again.', 'error');
    }
}

// ── Admin login (called from admin-login.html) ────────────────
async function adminLogin(event) {
    event.preventDefault();

    const username = document.getElementById('adminUsername')?.value.trim();
    const password = document.getElementById('adminPassword')?.value.trim();
    const msgEl = document.getElementById('adminMsg');

    if (!username || !password) {
        if (msgEl) {
            msgEl.textContent = 'Please enter username and password.';
            msgEl.className = 'auth-message error';
            msgEl.style.display = 'block';
        }
        return;
    }

    if (msgEl) {
        msgEl.textContent = 'Signing in...';
        msgEl.className = 'auth-message info';
        msgEl.style.display = 'block';
    }

    try {
        const res = await fetch('/api/auth/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem('ss_role', 'admin');
            window.location.href = 'admin-dashboard.html';
        } else {
            if (msgEl) {
                msgEl.textContent = data.message || 'Invalid credentials.';
                msgEl.className = 'auth-message error';
                msgEl.style.display = 'block';
            }
        }
    } catch (error) {
        if (msgEl) {
            msgEl.textContent = 'Connection failed. Is the backend running?';
            msgEl.className = 'auth-message error';
            msgEl.style.display = 'block';
        }
    }
}

// ── Guard user-specific event listeners ───────────────────────
if (toggleAuthMode) {
    toggleAuthMode.addEventListener('click', () => {
        setAuthMode(!isSignupMode);
    });
    setAuthMode(false);
}
