const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length
    && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

router.post('/login', (req, res) => {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(503).json({ message: 'Admin authentication is not configured.' });
  }

  const { username, password } = req.body || {};
  if (
    typeof username !== 'string'
    || typeof password !== 'string'
    || !safeEqual(username, ADMIN_USERNAME)
    || !safeEqual(password, ADMIN_PASSWORD)
  ) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  return res.json({ token, expiresIn: 86400 });
});

module.exports = router;