const { getSupabaseClient, methodNotAllowed } = require('../_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);

  const { ref } = req.body || {};
  if (!ref) return res.status(400).json({ success: false, message: 'ref required.' });

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('ref', ref);

    if (error) return res.status(500).json({ success: false, message: error.message });

    return res.status(200).json({ success: true, message: 'Booking cancelled.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
