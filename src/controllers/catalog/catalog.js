import { getAllCourses, getCourseBySlug } from '../../models/catalog/courses.js';
import { getSectionsByCourseSlug } from '../../models/catalog/catalog.js';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { createContactForm, getAllContactForms } from '../../models/forms/contact.js';

const router = Router();

/**
 * Display the contact form page.
 */
const showContactForm = (req, res) => {
    res.render('forms/contact/form', {
        title: 'Contact Us'
    });
};

/**
 * Handle contact form submission with validation.
 * If validation passes, save to database and redirect.
 * If validation fails, log errors and redirect back to form.
 */
const handleContactSubmission = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Log validation errors for developer debugging
        console.error('Validation errors:', errors.array());
        // Redirect back to form without saving
        return res.redirect('/contact');
    }

    // Extract validated data
    const { subject, message } = req.body;

    try {
        // Save to database
        await createContactForm(subject, message);
        console.log('Contact form submitted successfully');
        // Redirect to responses page on success
        res.redirect('/contact/responses');
    } catch (error) {
        console.error('Error saving contact form:', error);
        res.redirect('/contact');
    }
};

/**
 * Display all contact form submissions.
 */
const showContactResponses = async (req, res) => {
    let contactForms = [];

    try {
        contactForms = await getAllContactForms();
    } catch (error) {
        console.error('Error retrieving contact forms:', error);
    }

    res.render('forms/contact/responses', {
        title: 'Contact Form Submissions',
        contactForms
    });
};

/**
 * GET /contact - Display the contact form
 */
router.get('/', showContactForm);

/**
 * POST /contact - Handle contact form submission with validation
 */
router.post('/',
    [
        body('subject')
            .trim()
            .isLength({ min: 2 })
            .withMessage('Subject must be at least 2 characters'),
        body('message')
            .trim()
            .isLength({ min: 10 })
            .withMessage('Message must be at least 10 characters')
    ],
    handleContactSubmission
);

/**
 * GET /contact/responses - Display all contact form submissions
 */
router.get('/responses', showContactResponses);

export default router;

// Route handler for the course catalog list page
const catalogPage = async (req, res) => {
    // Model functions are async, so we must await them
    const courses = await getAllCourses();
    
    res.render('catalog/list', {
        title: 'Course Catalog',
        courses: courses
    });
};

// Route handler for individual course detail pages
const courseDetailPage = async (req, res, next) => {
    const courseSlug = req.params.slugId;
    
    // Model functions are async, so we must await them
    const course = await getCourseBySlug(courseSlug);
    
    // Our model returns empty object {} when not found, not null
    // Check if the object is empty using Object.keys()
    if (Object.keys(course).length === 0) {
        const err = new Error(`Course ${courseSlug} not found`);
        err.status = 404;
        return next(err);
    }
    
    // Get sections (course offerings) separately from the catalog
    // Pass the sortBy parameter directly to the model - PostgreSQL handles the sorting
    const sortBy = req.query.sort || 'time';
    const sections = await getSectionsByCourseSlug(courseSlug, sortBy);
    
    res.render('catalog/detail', {
        title: `${course.courseCode} - ${course.name}`,
        course: course,
        sections: sections,
        currentSort: sortBy
    });
};

export { catalogPage, courseDetailPage };