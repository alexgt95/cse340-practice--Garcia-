import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { createContactForm, getAllContactForms } from '../../models/forms/contact.js';

const router = Router();

const contactValidation = [
    body('subject')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Subject must be between 2 and 255 characters')
        .matches(/^[a-zA-Z0-9\s\-.,!?]+$/)
        .withMessage('Subject contains invalid characters'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters')
        .custom((value) => {
            // Spam heuristic: a long message that repeats the same few words
            const words = value.split(/\s+/);
            const uniqueWords = new Set(words);
            if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                throw new Error('Message appears to be spam');
            }
            return true;
        })
];

// GET /contact: show the empty form
const showContactForm = (req, res) => {
    res.render('forms/contact/form', { title: 'Contact Us' });
};

// POST /contact: validate, save, flash a message, then redirect (Post-Redirect-Get)
const handleContactSubmission = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/contact');
    }

    try {
        const { subject, message } = req.body;
        await createContactForm(subject, message);
        req.flash('success', 'Thank you! Your message has been sent.');
        res.redirect('/contact');
    } catch (error) {
        console.error('Error saving contact form:', error.message);
        req.flash('error', 'Something went wrong. Please try again.');
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
