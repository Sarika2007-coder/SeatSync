const { getSupabaseClient, methodNotAllowed } = require('../_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return methodNotAllowed(req, res, ['GET']);

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booked_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, message: error.message });

    const bookings = (data || []).map((r) => ({
      ref: r.ref,
      route: r.route,
      busName: r.bus_name,
      busType: r.bus_type,
      date: r.date,
      time: r.time,
      seats: r.seats,
      passengers: r.passengers,
      contactEmail: r.contact_email,
      contactPhone: r.contact_phone,
      totalAmount: r.total_amount,
      tax: r.tax,
      grandTotal: r.grand_total,
      paymentMethod: r.payment_method,
      status: r.status,
      bookedAt: r.booked_at
    }));

    return res.status(200).json({ success: true, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
