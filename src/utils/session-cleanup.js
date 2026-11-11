import db from '../models/db.js';

// Remove sessions whose expiry date has passed
const cleanupExpiredSessions = async () => {
    try {
        const result = await db.query('DELETE FROM session WHERE expire < NOW()');
        if (result.rowCount > 0) {
            console.log(`Cleaned up ${result.rowCount} expired sessions`);
        }
    } catch (error) {
        // 42P01 = table doesn't exist yet (created on first use), not a real problem
        if (error.code !== '42P01') {
            console.error('Session cleanup error:', error.message);
        }
    }
};

const startSessionCleanup = () => {
    cleanupExpiredSessions();
    setInterval(cleanupExpiredSessions, 12 * 60 * 60 * 1000);
};

export { startSessionCleanup };
