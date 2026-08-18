const { getSupabaseClient, methodNotAllowed } = require('../_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);

  try {
    const b = req.body || {};
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('bookings').insert([
      {
        ref: b.ref,
        user_email: b.userEmail || b.contactEmail,
        route: b.route,
        bus_name: b.busName,
        bus_type: b.busType,
        date: b.date,
        time: b.time,
        seats: b.seats,
        passengers: b.passengers,
        contact_email: b.contactEmail,
        contact_phone: b.contactPhone,
        total_amount: b.totalAmount,
        tax: b.tax,
        grand_total: b.grandTotal,
        payment_method: b.paymentMethod,
        status: b.status || 'confirmed',
        booked_at: b.bookedAt || new Date().toISOString()
      }
    ]);

    if (error) return res.status(500).json({ success: false, message: error.message });

    return res.status(200).json({ success: true, message: 'Booking saved successfully!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
