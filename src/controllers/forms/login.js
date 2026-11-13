import { validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';


// GET /login: show the form
const showLoginForm = (req, res) => {
    res.render('forms/login/form', { title: 'User Login' });
};

// POST /login: validate, look up the user, verify the password, start the session
const processLogin = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/login');
    }

    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);

        // Same public message for "no such user" and "wrong password", so an attacker
        // cannot discover which emails are registered (account enumeration).
        // The real reason goes to the console only.
        if (!user) {
            console.log('Login failed: no user with that email');
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        const passwordMatches = await verifyPassword(password, user.password);

        if (!passwordMatches) {
            console.log('Login failed: wrong password');
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        // Never keep the password hash in the session
        delete user.password;
        req.session.user = user;

        req.flash('success', `Welcome back, ${user.name}!`);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error during login:', error.message);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/login');
    }
};

// GET /logout: destroy the session and clear its cookie
const processLogout = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Error destroying session:', error.message);
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

export { showLoginForm, processLogin, processLogout, showDashboard };
