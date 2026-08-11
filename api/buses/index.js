const { getSupabaseClient, methodNotAllowed } = require('../_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return methodNotAllowed(req, res, ['GET']);

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .order('route')
      .order('time');

    if (error) return res.status(500).json({ success: false, message: error.message });

    return res.status(200).json({ success: true, buses: data || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
