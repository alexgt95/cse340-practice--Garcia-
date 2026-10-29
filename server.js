// Import express using ESM syntax
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
// import router from './src/controllers/routes.js';

// Log fatal errors so they show up in Render's logs
process.on('uncaughtException', (err) => {
    console.error('FATAL STARTUP EXCEPTION:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL UNHANDLED REJECTION at:', promise, 'reason:', reason);
    process.exit(1);
});

// ESM has no built-in __dirname, so rebuild it from this file's URL.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;
const name = process.env.NAME;

// Create an instance of an Express application
const app = express();

/**
 * Configure Express
 */

// Set EJS as the templating engine and tell Express where the templates are
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routes
 */
// app.use(router);

app.get('/', (req, res) => {
    const title = 'Welcome Home';
    res.render('home', { title });
});

app.get('/about', (req, res) => {
    const title = 'About Me';
    res.render('about', { title });
});

app.get('/products', (req, res) => {
    const title = 'Our Products';
    res.render('products', { title });
});

// Start the server. No host argument means it listens on all interfaces,
// which is what Render needs.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${NODE_ENV})`);
});