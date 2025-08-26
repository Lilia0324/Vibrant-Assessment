const jwt = require('jsonwebtoken');
require('dotenv').config();

const {
  JWT_SECRET,
  JWT_ISS,
  JWT_AUD,
} = process.env;

if (!JWT_SECRET) {
  // Fail fast at boot if secret is missing
  throw new Error('JWT_SECRET is required');
}

module.exports = function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const [scheme, token] = auth.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    // Verification options
    const opts = {
      algorithms: ['HS256'], 
      // 60s leeway for clock skew
      clockTolerance: 60,
    };
    if (JWT_ISS) opts.issuer = JWT_ISS;
    if (JWT_AUD) opts.audience = JWT_AUD;

    const payload = jwt.verify(token, JWT_SECRET, opts);

    // attach user info for downstream handlers
    req.user = {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      claims: payload,
    };

    return next();
  } catch (err) {
    // Token errors → 401
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    // Anything else
    return res.status(401).json({ error: 'Unauthorized' });
  }
};