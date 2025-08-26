const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { knex } = require('../db/knex');
require('dotenv').config();

const {
  JWT_SECRET,
  JWT_ISS,
  JWT_AUD,
  JWT_EXPIRES_IN = '1h',
} = process.env;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

function isEmail(s) {
  return typeof s === 'string' && /\S+@\S+\.\S+/.test(s);
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Success: { token, user: { id, email, name, roles } }
 */
router.post('/auth/login', express.json(), async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await knex('users').where({ email }).first();
    if (!user) {
      // Avoid user enumeration
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // roles stored as JSON string
    let roles = [];
    try { roles = JSON.parse(user.roles || '[]'); } catch {}

    const payload = {
      sub: String(user.id),
      email: user.email,
      roles,
    };

    const signOpts = {
      algorithm: 'HS256',
      expiresIn: JWT_EXPIRES_IN,
    };
    if (JWT_ISS) signOpts.issuer = JWT_ISS;
    if (JWT_AUD) signOpts.audience = JWT_AUD;

    const token = jwt.sign(payload, JWT_SECRET, signOpts);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
      },
    });
  } catch (err) {
    console.error('POST /api/auth/login failed:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;