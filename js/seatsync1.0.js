const loginMessage = document.getElementById('loginMessage');
const authForm = document.getElementById('authForm');
const authButton = document.getElementById('authButton');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authToggleText = document.getElementById('authToggleText');
const confirmPasswordRow = document.getElementById('confirmPasswordRow');

let isSignupMode = false;

function setAuthMode(signup) {
    isSignupMode = signup;
    authButton.textContent = signup ? 'Sign Up' : 'Login';
    authToggleText.textContent = signup ? 'Already have an account?' : "Don't have an account?";
    toggleAuthMode.textContent = signup ? 'Login' : 'Create one';
    confirmPasswordRow.style.display = signup ? 'block' : 'none';
    loginMessage.textContent = '';
}

async function handleAuthSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!email || !password || (isSignupMode && !confirmPassword)) {
        loginMessage.textContent = 'Please fill in all required fields.';
        return;
    }

    if (isSignupMode && password !== confirmPassword) {
        loginMessage.textContent = 'Passwords do not match.';
        return;
    }

    loginMessage.textContent = isSignupMode ? 'Creating account...' : 'Signing in...';

    try {
        let result;
        if (isSignupMode) {
            result = await window.supabaseAuth.signUpUser(email, password);
        } else {
            result = await window.supabaseAuth.signInUser(email, password);
        }

        if (result.error) {
            loginMessage.textContent = result.error.message || 'Unable to authenticate.';
            return;
        }

        if (isSignupMode) {
            loginMessage.textContent = 'Account created. Please check your email to confirm your account.';
            return;
        }

        if (result.data?.session?.user) {
            window.location.href = 'user-dashboard.html';
            return;
        }

        loginMessage.textContent = 'Login succeeded. Redirecting...';
        window.location.href = 'user-dashboard.html';

    } catch (error) {
        console.error('Auth error:', error);
        loginMessage.textContent = 'Authentication failed. Try again.';
    }
}

toggleAuthMode.addEventListener('click', () => {
    setAuthMode(!isSignupMode);
});

setAuthMode(false);
