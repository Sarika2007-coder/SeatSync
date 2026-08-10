// ── Shared helpers ──────────────────────────────────────────
function logout() {
  try { if (window.supabaseAuth) window.supabaseAuth.signOutUser(); } catch (_) {}
  localStorage.removeItem('ss_role');
  localStorage.removeItem('ss_email');
  window.location.href = 'index.html';
}

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'auth-message ' + (type || 'info');
  el.style.display = 'block';
}

// ── User auth (user-login.html) ─────────────────────────────
let isSignup = false;

function setMode(signup) {
  isSignup = signup;
  const title  = document.getElementById('authTitle');
  const sub    = document.getElementById('authSub');
  const btn    = document.getElementById('authBtn');
  const row    = document.getElementById('confirmRow');
  const tText  = document.getElementById('toggleText');
  const tLink  = document.getElementById('toggleLink');
  const msg    = document.getElementById('authMsg');

  if (title)  title.textContent  = signup ? 'Create Account' : 'Welcome Back';
  if (sub)    sub.textContent    = signup ? 'Sign up to start booking tickets' : 'Sign in to book your bus tickets';
  if (btn)    btn.textContent    = signup ? 'Create Account' : 'Sign In';
  if (row)    row.style.display  = signup ? 'block' : 'none';
  if (tText)  tText.textContent  = signup ? 'Already have an account?' : "Don't have an account?";
  if (tLink)  tLink.textContent  = signup ? 'Sign In' : 'Create one';
  if (msg)    msg.style.display  = 'none';
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const btn      = document.getElementById('authBtn');
  const email    = document.getElementById('userEmail').value.trim();
  const password = document.getElementById('userPassword').value;
  const confirm  = document.getElementById('confirmPassword');

  if (isSignup && confirm && password !== confirm.value) {
    return showMsg('authMsg', 'Passwords do not match.', 'error');
  }

  btn.disabled   = true;
  btn.innerHTML  = '<span class="spinner"></span>';
  showMsg('authMsg', isSignup ? 'Creating your account…' : 'Signing you in…', 'info');

  try {
    if (!window.supabaseAuth) throw new Error('Auth not initialised — check Supabase config.');

    const result = isSignup
      ? await window.supabaseAuth.signUpUser(email, password)
      : await window.supabaseAuth.signInUser(email, password);

    if (result.error) throw result.error;

    if (isSignup) {
      showMsg('authMsg', '✅ Account created! Check your email to confirm, then sign in.', 'success');
      setMode(false);
    } else {
      localStorage.setItem('ss_role', 'user');
      localStorage.setItem('ss_email', email);
      window.location.href = 'user-dashboard.html';
    }
  } catch (err) {
    showMsg('authMsg', err.message || 'Authentication failed. Please try again.', 'error');
  } finally {
    btn.disabled  = false;
    btn.textContent = isSignup ? 'Create Account' : 'Sign In';
  }
}

// Wire toggle on user-login page
(function() {
  const tLink = document.getElementById('toggleLink');
  if (tLink) {
    tLink.addEventListener('click', () => setMode(!isSignup));
    setMode(false);
  }
})();

// ── Admin auth (admin-login.html) ───────────────────────────
async function adminLogin(e) {
  e.preventDefault();
  const btn      = document.getElementById('adminBtn');
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value;

  if (!username || !password) return showMsg('adminMsg', 'Please fill in all fields.', 'error');

  btn.disabled  = true;
  btn.innerHTML = '<span class="spinner"></span>';
  showMsg('adminMsg', 'Signing in…', 'info');

  try {
    const res  = await fetch('/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Invalid credentials.');
    localStorage.setItem('ss_role', 'admin');
    window.location.href = 'admin-dashboard.html';
  } catch (err) {
    showMsg('adminMsg', err.message, 'error');
    btn.disabled    = false;
    btn.textContent = 'Sign In as Admin';
  }
}
