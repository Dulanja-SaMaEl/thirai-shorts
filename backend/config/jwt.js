import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'thirai_plus_secure_jwt_secret_key_2026_production_grade';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a new JWT token for an authenticated user
 * @param {Object} payload - { id, email, role, full_name }
 * @returns {string} - Signed JWT
 */
export const signToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role || 'viewer',
      full_name: payload.full_name || ''
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Cryptographically verify a JWT token
 * @param {string} token
 * @returns {Object|null} - Decoded payload or null if invalid/expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
