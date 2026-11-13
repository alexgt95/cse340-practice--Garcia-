import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import {
    emailExists,
    saveUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../../models/forms/registration.js';

// Server-side validation rules (the client-side attributes are only a convenience)

// Validation rules for editing an account (name and email only)

// Convert a URL id to a whole number, or null if it is not one.
// Number('12abc') is NaN, which prevents sloppy parsing and a database error.
const parseId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) ? id : null;
};

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

// GET /register/list: show every registered user (buttons depend on who is logged in)
const showAllUsers = async (req, res) => {
    let users = [];

    try {
        users = await getAllUsers();
    } catch (error) {
        console.error('Error retrieving users:', error.message);
    }

    res.render('forms/registration/list', {
        title: 'Registered Users',
        users,
        user: req.session && req.session.user ? req.session.user : null
    });
};

// GET /register/:id/edit: users can edit themselves, admins can edit anyone
const showEditAccountForm = async (req, res) => {
    const targetUserId = parseId(req.params.id);
    const currentUser = req.session.user;

    if (targetUserId === null) {
        req.flash('error', 'User not found.');
        return res.redirect('/register/list');
    }

    try {
        const targetUser = await getUserById(targetUserId);

        if (!targetUser) {
            req.flash('error', 'User not found.');
            return res.redirect('/register/list');
        }

        const canEdit = currentUser.id === targetUserId || currentUser.roleName === 'admin';

        if (!canEdit) {
            req.flash('error', 'You do not have permission to edit this account.');
            return res.redirect('/register/list');
        }

        res.render('forms/registration/edit', {
            title: 'Edit Account',
            user: targetUser
        });
    } catch (error) {
        console.error('Error loading account:', error.message);
        req.flash('error', 'An error occurred while loading the account.');
        res.redirect('/register/list');
    }
};

// POST /register/:id/edit: permissions are checked AGAIN here (never trust the form)
const processEditAccount = async (req, res) => {
    const targetUserId = parseId(req.params.id);
    const currentUser = req.session.user;

    if (targetUserId === null) {
        req.flash('error', 'User not found.');
        return res.redirect('/register/list');
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect(`/register/${targetUserId}/edit`);
    }

    const { name, email } = req.body;

    try {
        const targetUser = await getUserById(targetUserId);

        if (!targetUser) {
            req.flash('error', 'User not found.');
            return res.redirect('/register/list');
        }

        const canEdit = currentUser.id === targetUserId || currentUser.roleName === 'admin';

        if (!canEdit) {
            req.flash('error', 'You do not have permission to edit this account.');
            return res.redirect('/register/list');
        }

        // The email may stay the same, but it cannot belong to a different account
        if (email !== targetUser.email && await emailExists(email)) {
            req.flash('error', 'An account with this email already exists.');
            return res.redirect(`/register/${targetUserId}/edit`);
        }

        await updateUser(targetUserId, name, email);

        // If people edited their own account, keep the session in sync
        if (currentUser.id === targetUserId) {
            req.session.user.name = name;
            req.session.user.email = email;
        }

        req.flash('success', 'Account updated successfully.');
        res.redirect('/register/list');
    } catch (error) {
        console.error('Error updating account:', error.message);
        req.flash('error', 'An error occurred while updating the account.');
        res.redirect(`/register/${targetUserId}/edit`);
    }
};

// POST /register/:id/delete: only admins, and never their own account
const processDeleteAccount = async (req, res) => {
    const targetUserId = parseId(req.params.id);
    const currentUser = req.session.user;

    if (currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to delete accounts.');
        return res.redirect('/register/list');
    }

    if (targetUserId === null) {
        req.flash('error', 'User not found.');
        return res.redirect('/register/list');
    }

    // Prevent admins from locking themselves out of the system
    if (currentUser.id === targetUserId) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/register/list');
    }

    try {
        const deleted = await deleteUser(targetUserId);

        if (deleted) {
            req.flash('success', 'User account deleted successfully.');
        } else {
            req.flash('error', 'User not found or already deleted.');
        }
    } catch (error) {
        console.error('Error deleting user:', error.message);
        req.flash('error', 'An error occurred while deleting the account.');
    }

    res.redirect('/register/list');
};

export {
    showRegistrationForm,
    processRegistration,
    showAllUsers,
    showEditAccountForm,
    processEditAccount,
    processDeleteAccount
};
