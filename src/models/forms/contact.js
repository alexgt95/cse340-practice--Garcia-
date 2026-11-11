import db from '../db.js';

// Save a new contact form submission. $1/$2 are parameters: the database treats
// the values as data, never as SQL, which prevents SQL injection.
const createContactForm = async (subject, message) => {
    const query = `
        INSERT INTO contact_form (subject, message)
        VALUES ($1, $2)
        RETURNING *
    `;
    const result = await db.query(query, [subject, message]);
    return result.rows[0];
};

// Get all submissions, newest first
const getAllContactForms = async () => {
    const query = `
        SELECT id, subject, message, submitted
        FROM contact_form
        ORDER BY submitted DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

export { createContactForm, getAllContactForms };
