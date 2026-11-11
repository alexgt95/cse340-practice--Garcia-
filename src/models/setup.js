import db from './db.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Runs practice.sql (our own tables). Safe on every start because it uses
 * CREATE TABLE IF NOT EXISTS. Skipped quietly if the file is missing.
 */
const setupPracticeTables = async () => {
    const practicePath = join(__dirname, 'sql', 'practice.sql');
    if (fs.existsSync(practicePath)) {
        await db.query(fs.readFileSync(practicePath, 'utf8'));
        console.log('Practice database tables initialized.');
    }
};

/**
 * Sets up the database by running the seed.sql file if needed.
 * Checks if faculty table has data - if not, runs a full re-seed.
 */
const setupDatabase = async () => {
    let hasData = false;
    try {
        const result = await db.query(
            "SELECT EXISTS (SELECT 1 FROM faculty LIMIT 1) as has_data"
        );
        hasData = result.rows[0]?.has_data || false;
    } catch (error) {
        // If the query fails (e.g., table doesn't exist), treat it as no data
        hasData = false;
    }

    if (hasData) {
        console.log('Database already seeded');
        await setupPracticeTables();
        return true;
    }

    console.log('Seeding database...');
    const seedPath = join(__dirname, 'sql', 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    await db.query(seedSQL);
    console.log('Database seeded successfully');
    await setupPracticeTables();

    return true;
};

/**
 * Tests the database connection by executing a simple query.
 */
const testConnection = async () => {
    const result = await db.query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
};

export { setupDatabase, testConnection };
