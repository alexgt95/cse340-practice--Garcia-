import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';

const router = Router();

const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address')
        .toLowerCase(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
];

// GET /login: show the form
const showLoginForm = (req, res) => {
    res.render('forms/login/form', { title: 'User Login' });
};

// POST /login: validate, look up the user, verify the password, start the session
const processLogin = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Log only the messages: error objects also contain the submitted values
        console.error('Login validation errors:', errors.array().map(error => error.msg));
        return res.redirect('/login');
    }

    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);

        // Specific reasons go to the console only; the user never learns which part failed
        if (!user) {
            console.log('Login failed: no user with that email');
            return res.redirect('/login');
        }

        const passwordMatches = await verifyPassword(password, user.password);

        if (!passwordMatches) {
            console.log('Login failed: wrong password');
            return res.redirect('/login');
        }

        // Never keep the password hash in the session
        delete user.password;
        req.session.user = user;

        console.log('Login successful');
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error during login:', error.message);
        res.redirect('/login');
    }
};

// GET /logout: destroy the session and clear its cookie
const processLogout = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Error destroying session:', error.message);
            res.clearCookie('connect.sid');
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

// GET /dashboard: protected page (the route adds requireLogin)
const showDashboard = (req, res) => {
    // Safety net: make sure no password field ever reaches the template
    const { password, ...user } = req.session.user;

    res.render('dashboard', {
        title: 'Dashboard',
        user,
        sessionData: { ...req.session, user }
    });
};

router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);

export default router;
export { processLogout, showDashboard };
