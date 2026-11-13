import { Router } from 'express';

import { addDemoHeaders } from '../middleware/demo/headers.js';
import { requireLogin } from '../middleware/auth.js';
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';
import { showContactForm, processContactForm, showContactResponses } from './forms/contact.js';
import {
    showRegistrationForm,
    processRegistration,
    showAllUsers,
    showEditAccountForm,
    processEditAccount,
    processDeleteAccount
} from './forms/registration.js';
import { showLoginForm, processLogin, processLogout, showDashboard } from './forms/login.js';
import {
    contactValidation,
    registrationValidation,
    loginValidation,
    updateAccountValidation
} from '../middleware/validation/forms.js';

const router = Router();

// Section-specific styles: these run before the routes below, only for matching paths
router.use('/catalog', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/catalog.css">');
    next();
});

router.use('/faculty', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/faculty.css">');
    next();
});

router.use('/contact', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/contact.css">');
    next();
});

router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});

router.use(['/login', '/dashboard'], (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/login.css">');
    next();
});

// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Course catalog routes
router.get('/catalog', catalogPage);
router.get('/catalog/:slugId', courseDetailPage);

// Faculty directory routes
router.get('/faculty', facultyListPage);
router.get('/faculty/:facultySlug', facultyDetailPage);

// Contact form routes
router.get('/contact', showContactForm);
router.post('/contact', contactValidation, processContactForm);
router.get('/contact/responses', showContactResponses);

// User registration routes
router.get('/register', showRegistrationForm);
router.post('/register', registrationValidation, processRegistration);
router.get('/register/list', showAllUsers);
router.get('/register/:id/edit', requireLogin, showEditAccountForm);
router.post('/register/:id/edit', requireLogin, updateAccountValidation, processEditAccount);
router.post('/register/:id/delete', requireLogin, processDeleteAccount);

// Login, logout and the protected dashboard
router.get('/login', showLoginForm);
router.post('/login', loginValidation, processLogin);
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);

// Demo page with special middleware
router.get('/demo', addDemoHeaders, demoPage);

// Route to trigger a test error
router.get('/test-error', testErrorPage);

export default router;
