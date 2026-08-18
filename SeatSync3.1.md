<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment – SeatSync</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<nav class="navbar">
  <a class="logo" href="user-dashboard.html">🚌 Seat<span>Sync</span></a>
  <ul class="nav-links">
    <li><a href="page4.html">← Back</a></li>
  </ul>
</nav>

<div class="steps-bar">
  <div class="step done"><div class="step-num">✓</div><span class="step-label">Search</span></div>
  <div class="step-sep"></div>
  <div class="step done"><div class="step-num">✓</div><span class="step-label">Select Bus</span></div>
  <div class="step-sep"></div>
  <div class="step done"><div class="step-num">✓</div><span class="step-label">Choose Seats</span></div>
  <div class="step-sep"></div>
  <div class="step done"><div class="step-num">✓</div><span class="step-label">Select Stops</span></div>
  <div class="step-sep"></div>
  <div class="step done"><div class="step-num">✓</div><span class="step-label">Passenger Details</span></div>
  <div class="step-sep"></div>
  <div class="step active"><div class="step-num">6</div><span class="step-label">Payment</span></div>
</div>

<!-- Loading overlay -->
<div class="loading-overlay" id="loadingOverlay">
  <div class="loading-box">
    <div class="loading-spinner"></div>
    <p id="loadingMsg">Processing your payment…</p>
  </div>
</div>

<div class="content-wrap">
  <div class="payment-wrap" id="payWrap">

    <!-- Payment form -->
    <div class="card" style="padding:32px;">
      <h2>Secure Payment</h2>
      <p class="sub" style="margin-bottom:24px;">Choose your payment method</p>

      <!-- Method tabs -->
      <div class="pay-tabs">
        <button class="pay-tab active" id="tabCard" onclick="showTab('card')">💳 Card</button>
        <button class="pay-tab" id="tabUpi"  onclick="showTab('upi')">📱 UPI</button>
        <button class="pay-tab" id="tabNb"   onclick="showTab('nb')">🏦 Net Banking</button>
      </div>

      <!-- Credit/Debit Card -->
      <div id="panelCard">
        <div class="form-group">
          <label>Card Number</label>
          <input type="text" id="cardNumber" class="form-control" placeholder="1234 5678 9012 3456" maxlength="19" oninput="formatCard(this)">
        </div>
        <div class="form-group">
          <label>Cardholder Name</label>
          <input type="text" id="cardName" class="form-control" placeholder="Name on card">
        </div>
        <div class="two-col">
          <div class="form-group">
            <label>Expiry Date</label>
            <input type="text" id="cardExpiry" class="form-control" placeholder="MM / YY" maxlength="7" oninput="formatExpiry(this)">
          </div>
          <div class="form-group">
            <label>CVV</label>
            <input type="password" id="cardCvv" class="form-control" placeholder="•••" maxlength="4">
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
          <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" height="28">
          <img src="https://img.icons8.com/color/48/000000/mastercard-logo.png" alt="MC" height="28">
          <img src="https://img.icons8.com/color/48/000000/rupay.png" alt="RuPay" height="28" onerror="this.style.display='none'">
        </div>
      </div>

      <!-- UPI -->
      <div id="panelUpi" class="hidden">
        <div class="upi-apps">
          <div class="upi-app" onclick="selectUpi(this,'gpay')">
            <span class="app-icon">🟢</span>GPay
          </div>
          <div class="upi-app" onclick="selectUpi(this,'phonepe')">
            <span class="app-icon">🟣</span>PhonePe
          </div>
          <div class="upi-app" onclick="selectUpi(this,'paytm')">
            <span class="app-icon">🔵</span>Paytm
          </div>
          <div class="upi-app" onclick="selectUpi(this,'bhim')">
            <span class="app-icon">🟠</span>BHIM
          </div>
        </div>
        <div class="form-group">
          <label>Or enter UPI ID</label>
          <input type="text" id="upiId" class="form-control" placeholder="yourname@upi">
        </div>
      </div>

      <!-- Net Banking -->
      <div id="panelNb" class="hidden">
        <div class="form-group">
          <label>Select Your Bank</label>
          <select id="bankSelect" class="form-control">
            <option value="">— Choose Bank —</option>
            <option>State Bank of India</option>
            <option>HDFC Bank</option>
            <option>ICICI Bank</option>
            <option>Axis Bank</option>
            <option>Kotak Mahindra Bank</option>
            <option>Yes Bank</option>
            <option>Bank of Baroda</option>
            <option>Punjab National Bank</option>
          </select>
        </div>
        <div class="alert alert-info" style="font-size:13px;">
          ℹ️ You'll be redirected to your bank's secure portal to complete payment.
        </div>
      </div>

      <div class="secure-badge">
        <span>🔒</span>
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>

      <button class="btn-full" style="margin-top:20px;" id="payBtn" onclick="processPayment()">
        Pay ₹<span id="payBtnAmount">0</span>
      </button>
    </div>

    <!-- Order summary -->
    <div class="card order-card">
      <h3>Order Summary</h3>
      <div class="order-row"><span class="lbl">Bus</span><span class="val" id="ordBus">—</span></div>
      <div class="order-row"><span class="lbl">Route</span><span class="val" id="ordRoute">—</span></div>
      <div class="order-row"><span class="lbl">Date</span><span class="val" id="ordDate">—</span></div>
      <div class="order-row"><span class="lbl">Departure</span><span class="val" id="ordTime">—</span></div>
      <div class="order-row">
        <span class="lbl">Seats</span>
        <div class="order-chips" id="ordChips"></div>
      </div>
      <div class="order-row"><span class="lbl">Passengers</span><span class="val" id="ordPass">—</span></div>
      <div class="divider"></div>
      <div class="order-row"><span class="lbl">Ticket Fare</span><span class="val" id="ordFare">₹0</span></div>
      <div class="order-row"><span class="lbl">Taxes & Fees (5%)</span><span class="val" id="ordTax">₹0</span></div>
      <div class="divider"></div>
      <div class="order-total">
        <span>Total Amount</span>
        <span class="val" id="ordTotal">₹0</span>
      </div>
    </div>

  </div>
</div>

<footer><strong>SeatSync</strong> &copy; 2024</footer>

<script>
const booking = JSON.parse(sessionStorage.getItem('ss_booking') || 'null');
if (!booking) { window.location.href = 'page4.html'; }

function routeLabel(r) {
  return r ? r.replace('-', ' → ').replace(/\b\w/g, c => c.toUpperCase()) : '';
}

// Fill order summary
const seats = booking.selectedSeats || [];
document.getElementById('ordBus').textContent   = booking.name;
document.getElementById('ordRoute').textContent = routeLabel(booking.route);
document.getElementById('ordDate').textContent  = booking.date || '—';
document.getElementById('ordTime').textContent  = booking.time;
document.getElementById('ordPass').textContent  = seats.length + ' passenger(s)';
document.getElementById('ordFare').textContent  = '₹' + booking.totalAmount;
document.getElementById('ordTax').textContent   = '₹' + (booking.tax || 0);
document.getElementById('ordTotal').textContent = '₹' + (booking.grandTotal || booking.totalAmount);
document.getElementById('payBtnAmount').textContent = booking.grandTotal || booking.totalAmount;
document.getElementById('ordChips').innerHTML   = seats.map(s => `<span class="order-chip">${s}</span>`).join('');

// Tab switching
let activeTab = 'card';
function showTab(tab) {
  activeTab = tab;
  ['card','upi','nb'].forEach(t => {
    document.getElementById('panel' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('hidden', t !== tab);
    document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('active', t === tab);
  });
}
// Normalise panel ids
function showTab(tab) {
  activeTab = tab;
  document.getElementById('panelCard').classList.toggle('hidden', tab !== 'card');
  document.getElementById('panelUpi').classList.toggle('hidden',  tab !== 'upi');
  document.getElementById('panelNb').classList.toggle('hidden',   tab !== 'nb');
  document.getElementById('tabCard').classList.toggle('active', tab === 'card');
  document.getElementById('tabUpi').classList.toggle('active',  tab === 'upi');
  document.getElementById('tabNb').classList.toggle('active',   tab === 'nb');
}

// Card formatting helpers
function formatCard(el) {
  let v = el.value.replace(/\D/g,'').substring(0,16);
  el.value = v.replace(/(.{4})/g,'$1 ').trim();
}
function formatExpiry(el) {
  let v = el.value.replace(/\D/g,'').substring(0,4);
  if (v.length > 2) v = v.slice(0,2) + ' / ' + v.slice(2);
  el.value = v;
}

let selectedUpiApp = '';
function selectUpi(el, app) {
  document.querySelectorAll('.upi-app').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
  selectedUpiApp = app;
}

function validatePayment() {
  if (activeTab === 'card') {
    const num  = document.getElementById('cardNumber').value.replace(/\s/g,'');
    const name = document.getElementById('cardName').value.trim();
    const exp  = document.getElementById('cardExpiry').value.trim();
    const cvv  = document.getElementById('cardCvv').value.trim();
    if (num.length < 16) { alert('Please enter a valid 16-digit card number.'); return false; }
    if (!name) { alert('Please enter the cardholder name.'); return false; }
    if (exp.length < 7) { alert('Please enter a valid expiry date (MM / YY).'); return false; }
    if (cvv.length < 3) { alert('Please enter a valid CVV.'); return false; }
  } else if (activeTab === 'upi') {
    const upi = document.getElementById('upiId').value.trim();
    if (!selectedUpiApp && (!upi || !upi.includes('@'))) {
      alert('Please select a UPI app or enter a valid UPI ID.'); return false;
    }
  } else if (activeTab === 'nb') {
    if (!document.getElementById('bankSelect').value) { alert('Please select a bank.'); return false; }
  }
  return true;
}

async function processPayment() {
  if (!validatePayment()) return;

  const overlay = document.getElementById('loadingOverlay');
  const msg     = document.getElementById('loadingMsg');
  overlay.classList.add('show');
  msg.textContent = 'Validating payment details…';

  await delay(1000);
  msg.textContent = 'Processing your payment…';
  await delay(1500);
  msg.textContent = 'Confirming your booking…';

  // Save to backend
  const ref = 'SS' + Date.now().toString().slice(-8).toUpperCase();
  const bookingPayload = {
    ref,
    busName:      booking.name,
    busType:      booking.type,
    route:        booking.route,
    date:         booking.date,
    time:         booking.time,
    seats:        booking.selectedSeats.join(', '),
    passengers:   booking.passengers,
    contactEmail: booking.contactEmail,
    contactPhone: booking.contactPhone,
    totalAmount:  booking.totalAmount,
    tax:          booking.tax,
    grandTotal:   booking.grandTotal,
    paymentMethod: activeTab,
    status:       'confirmed',
    bookedAt:     new Date().toISOString(),
  };

  try {
    await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
  } catch (_) { /* backend optional for demo */ }

  // Save to localStorage for my bookings
  const myBookings = JSON.parse(localStorage.getItem('ss_my_bookings') || '[]');
  myBookings.push({
    ref,
    route:  booking.route ? booking.route.replace('-',' → ').replace(/\b\w/g,c=>c.toUpperCase()) : '—',
    bus:    booking.name,
    date:   booking.date,
    seats:  booking.selectedSeats.join(', '),
    total:  booking.grandTotal,
    status: 'confirmed',
  });
  localStorage.setItem('ss_my_bookings', JSON.stringify(myBookings));

  // Store confirmation
  sessionStorage.setItem('ss_confirmation', JSON.stringify({ ...bookingPayload }));

  await delay(500);
  overlay.classList.remove('show');
  window.location.href = 'page5.html';
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
</script>
</body>
</html>
