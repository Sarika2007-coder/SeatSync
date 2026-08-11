const { createClient } = require('@supabase/supabase-js');

let cachedClient = null;

function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL or SUPABASE_SECRET_KEY is not configured.');
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false }
  });

  return cachedClient;
}

function methodNotAllowed(req, res, methods) {
  res.setHeader('Allow', methods.join(', '));
  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}

module.exports = {
  getSupabaseClient,
  methodNotAllowed
};
