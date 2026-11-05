// Import express using ESM syntax
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// ESM has no built-in __dirname, so rebuild it from this file's URL.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;

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
 * Global template variables middleware
 * 
 * Makes common variables available to all EJS templates without having to pass
 * them individually from each route handler
 */
app.use((req, res, next) => {
    // Make NODE_ENV available to all templates
    res.locals.NODE_ENV = NODE_ENV.toLowerCase() || 'production';
    
    // Continue to the next middleware or route handler
    next();
});


/**
 * Routes
 */

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

// When in development mode, start a WebSocket server for live reloading
if (NODE_ENV.includes('dev')) {
    // Top-level await works outside an async function because package.json
    // has "type": "module", and ES modules allow it. The dynamic import also
    // keeps 'ws' (a devDependency) from loading in production.
    const ws = await import('ws');

    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}


// Start the server. No host argument means it listens on all interfaces,
// which is what Render needs.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${NODE_ENV})`);
});