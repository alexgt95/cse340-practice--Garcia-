import bcrypt from 'bcrypt';
import db from '../db.js';

// Find a user by email (case-insensitive). Returns the full row INCLUDING the
// password hash, because the caller needs it to verify the password.
// Returns null when nobody matches.
const findUserByEmail = async (email) => {
    const query = `
        SELECT id, name, email, password, created_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
};

// Compare a plain-text password with a stored bcrypt hash
const verifyPassword = async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};

export { findUserByEmail, verifyPassword };
