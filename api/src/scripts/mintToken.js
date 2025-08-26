require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { sub: '123', email: 'dev@example.com', roles: ['user'] },
  process.env.JWT_SECRET,
  {
    algorithm: 'HS256',
    issuer: process.env.JWT_ISS,
    audience: process.env.JWT_AUD,
    expiresIn: '1h',
  }
);

console.log(token);