const { getSupabaseClient, methodNotAllowed } = require('../_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') return methodNotAllowed(req, res, ['DELETE']);

  const id = req.query.id;

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('buses')
      .update({ active: false })
      .eq('id', id);

    if (error) return res.status(500).json({ success: false, message: error.message });

    return res.status(200).json({ success: true, message: 'Bus removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
