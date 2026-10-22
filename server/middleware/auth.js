const jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next) {
  const secret = process.env.JWT_SECRET;
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : '';

  if (!secret || !token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    req.admin = jwt.verify(token, secret);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired or invalid.' });
  }
}

module.exports = verifyAdmin;