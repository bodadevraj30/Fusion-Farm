const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const mysql = require('mysql');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Specify the directory for your views (EJS templates)
app.set('views', path.join(__dirname, 'views'));

// Middleware to define the year globally for all views
app.use((req, res, next) => {
    res.locals.year = new Date().getFullYear();
    next();
});

// Add express-session middleware
app.use(session({
    secret: 'dev', // Specify a secret key for session encryption
    resave: false,
    saveUninitialized: false
}));

// MySQL connection configuration
const db = mysql.createConnection({
    host: 'fusionfarm.czyqa0eceppw.ap-south-1.rds.amazonaws.com',
    user: 'root',
    password: 'bodaDEV1234',
    database: 'fusionfarm_db'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Export the db object
module.exports.db = db;

// Include route files
const farmerRoutes = require('./routes/farmerRoutes');
const customerRoutes = require('./routes/customerRoutes'); // Import customerRoutes
const ardRoutes = require('./routes/ardRoutes');
const amdRoutes = require('./routes/amdRoutes');
const loginRoutes = require('./routes/loginRoutes');
const registerRoutes = require('./routes/registerRoutes');
const showRoutes = require('./routes/show');
const cartRoutes = require('./routes/cart');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');

// Use route files
app.use(farmerRoutes);
app.use(customerRoutes); // Use customerRoutes
app.use(ardRoutes);
app.use(amdRoutes);
app.use(loginRoutes);
app.use(registerRoutes);
app.use(showRoutes);
app.use(cartRoutes);
app.use(profileRoutes);
app.use(paymentRoutes);


// Define a route to render your main EJS file (if needed)
app.get('/', (req, res) => {
    res.render('index');
});

// Route to handle search form submission
app.post('/showResults', (req, res) => {
    const searchQuery = req.body.searchQuery; // Get search query from the form
    
    // Perform database queries based on the search query
    const sql = `
        SELECT phone_number, name, company, price, weight, bags FROM seeds WHERE name LIKE ?
        UNION
        SELECT phone_number, name, company, price, weight, bags FROM fertilizers WHERE name LIKE ?
        UNION
        SELECT phone_number, name, company, price, weight, bags FROM pesticides WHERE name LIKE ?
    `;

    const sql1 = `
        SELECT phone_number, name, description, company, price, rentSale FROM machinery WHERE name LIKE ?
    `;

    const sql2 = `
        SELECT phone_number, name, NULL AS company, price, quantity, NULL AS bags FROM crop WHERE name LIKE ?
    `;

    // Combine both queries into a single query
    const combinedSql = `${sql} UNION ${sql1} UNION ${sql2}`;


    // Execute the SQL query
    db.query(combinedSql, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error executing MySQL query:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Render the search results page with the retrieved data
        res.render('showResults', { results })
    });
});

// POST route to handle form submission
app.get('/login', (req, res) => {
    res.render('login', { year: year });
});

app.get('/register', (req, res) => {
    res.render('register', { year: year });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
