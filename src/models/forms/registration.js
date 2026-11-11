import db from '../db.js';

// Does a user with this email already exist? Returns true or false.
const emailExists = async (email) => {
    const query = `SELECT EXISTS (SELECT 1 FROM users WHERE email = $1) AS exists`;
    const result = await db.query(query, [email]);
    return result.rows[0].exists;
};

// Save a new user. The password arrives already hashed. RETURNING gives back
// the saved row WITHOUT the password column.
const saveUser = async (name, email, hashedPassword) => {
    const query = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at
    `;
    const result = await db.query(query, [name, email, hashedPassword]);
    return result.rows[0];
};

// Get all users, newest first. Never selects the password.
const getAllUsers = async () => {
    const query = `
        SELECT id, name, email, created_at
        FROM users
        ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

export { emailExists, saveUser, getAllUsers };
