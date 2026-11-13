import db from '../db.js';

// Does a user with this email already exist? Returns true or false.
const emailExists = async (email) => {
    const query = `SELECT EXISTS (SELECT 1 FROM users WHERE email = $1) AS exists`;
    const result = await db.query(query, [email]);
    return result.rows[0].exists;
};

// Save a new user. The password arrives already hashed. RETURNING gives back
// the saved row WITHOUT the password column. The role defaults to 'user'.
const saveUser = async (name, email, hashedPassword) => {
    const query = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at
    `;
    const result = await db.query(query, [name, email, hashedPassword]);
    return result.rows[0];
};

// Get all users with their role, newest first. Never selects the password.
const getAllUsers = async () => {
    const query = `
        SELECT users.id, users.name, users.email, users.created_at,
               roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        ORDER BY users.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

// Get one user by id, with role. Never selects the password.
const getUserById = async (id) => {
    const query = `
        SELECT users.id, users.name, users.email, users.created_at,
               roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

// Update a user's name and email
const updateUser = async (id, name, email) => {
    const query = `
        UPDATE users
        SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, name, email, updated_at
    `;
    const result = await db.query(query, [name, email, id]);
    return result.rows[0] || null;
};

// Delete a user. Returns true if a row was deleted.
const deleteUser = async (id) => {
    const result = await db.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
};

export { emailExists, saveUser, getAllUsers, getUserById, updateUser, deleteUser };
