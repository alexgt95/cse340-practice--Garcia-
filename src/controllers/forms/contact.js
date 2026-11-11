import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { createContactForm, getAllContactForms } from '../../models/forms/contact.js';

const router = Router();

// Server-side validation rules (the real security check)
const contactValidation = [
    body('subject')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Subject must be at least 2 characters'),
    body('message')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Message must be at least 10 characters')
];

// GET /contact: show the empty form
const showContactForm = (req, res) => {
    res.render('forms/contact/form', { title: 'Contact Us' });
};

// POST /contact: validate, save, then redirect (Post-Redirect-Get)
const handleContactSubmission = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.redirect('/contact');
    }

    try {
        const { subject, message } = req.body;
        await createContactForm(subject, message);
        console.log('Contact form submitted successfully');
        res.redirect('/contact/responses');
    } catch (error) {
        console.error('Error saving contact form:', error);
        res.redirect('/contact');
    }
};

// GET /contact/responses: list all submissions
const showContactResponses = async (req, res) => {
    const contactForms = await getAllContactForms();

    res.render('forms/contact/responses', {
        title: 'Contact Responses',
        contactForms
    });
};

router.get('/', showContactForm);
router.post('/', contactValidation, handleContactSubmission);
router.get('/responses', showContactResponses);

export default router;
