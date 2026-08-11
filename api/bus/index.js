const { getSupabaseClient, methodNotAllowed } = require('../_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);

  const { route, name, type, time, duration, seats, price, rating } = req.body || {};

  if (!route || !name || !type || !time || !price) {
    return res.status(400).json({
      success: false,
      message: 'route, name, type, time and price are required.'
    });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('buses')
      .insert([
        {
          route,
          name,
          type,
          time,
          duration: duration || '—',
          seats: parseInt(seats, 10) || 40,
          price: parseFloat(price),
          rating: parseFloat(rating) || 4.0,
          active: true
        }
      ])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, message: error.message });

    return res.status(200).json({ success: true, bus: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
