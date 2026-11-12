import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers } from '../../models/forms/registration.js';

const router = Router();

// Server-side validation rules (the client-side attributes are only a convenience)
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address')
        .toLowerCase(),
    body('emailConfirm')
        .trim()
        .toLowerCase()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[^A-Za-z0-9]/)
        .withMessage('Password must contain at least one symbol'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

// GET /register: show the empty form
const showRegistrationForm = (req, res) => {
    res.render('forms/registration/form', { title: 'User Registration' });
};

// POST /register: validate, check duplicates, hash, save, redirect
const processRegistration = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Only the messages are flashed: error objects also contain the submitted passwords
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/register');
    }

    const { name, email, password } = req.body;

    try {
        if (await emailExists(email)) {
            req.flash('warning', 'An account with that email already exists. Try logging in.');
            return res.redirect('/register');
        }

        // 10 = salt rounds: how much work bcrypt does (higher = slower and safer)
        const hashedPassword = await bcrypt.hash(password, 10);
        await saveUser(name, email, hashedPassword);

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error.message);
        req.flash('error', 'Something went wrong during registration. Please try again.');
        res.redirect('/register');
    }
};

// GET /register/list: show every registered user
const showAllUsers = async (req, res) => {
    let users = [];

    try {
        users = await getAllUsers();
    } catch (error) {
        console.error('Error retrieving users:', error.message);
    }

    res.render('forms/registration/list', {
        title: 'Registered Users',
        users
    });
};

router.get('/', showRegistrationForm);
router.post('/', registrationValidation, processRegistration);
router.get('/list', showAllUsers);

export default router;
