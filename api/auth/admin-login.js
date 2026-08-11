const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'ss_salt').digest('hex');
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return res.status(500).json({
      success: false,
      message: 'Admin credentials are not configured on the server.'
    });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password required.'
    });
  }

  const providedHash = hashPassword(password);
  const expectedHash = hashPassword(adminPassword);

  if (username === adminUsername && providedHash === expectedHash) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid admin credentials.'
  });
};
