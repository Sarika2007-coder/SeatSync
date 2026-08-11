const { getSupabaseClient, methodNotAllowed } = require('../_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return methodNotAllowed(req, res, ['GET']);

  const { busId, date } = req.query;
  if (!busId || !date) {
    return res.status(400).json({ success: false, message: 'busId and date required.' });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('seats')
      .eq('bus_name', busId)
      .eq('date', date)
      .neq('status', 'cancelled');

    if (error) return res.status(500).json({ success: false, message: error.message });

    const booked = (data || [])
      .flatMap((r) => (r.seats || '').split(',').map((s) => s.trim()))
      .filter(Boolean);

    return res.status(200).json({ success: true, booked });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
