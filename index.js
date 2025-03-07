const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const mysql = require('mysql');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Set up static file serving
app.use(express.json());
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
    secret: 'Boda@123Devraj', // Specify a secret key for session encryption
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
        process.exit(1); // Exit process if DB connection fails
    }
    console.log('Connected to MySQL');
});
// Export the db object
module.exports.db = db;

// Include route files
const customerRoutes = require('./routes/customerRoutes'); 
const farmerRoutes = require('./routes/farmerRoutes');
const ardRoutes = require('./routes/ardRoutes');
const amdRoutes = require('./routes/amdRoutes');
const loginRoutes = require('./routes/loginRoutes');
const registerRoutes = require('./routes/registerRoutes');
const showRoutes = require('./routes/show');
const cartRoutes = require('./routes/cart');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');

// Use route files
app.use(customerRoutes); 
app.use(farmerRoutes);
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
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 12;
    const offset = (page - 1) * itemsPerPage;

    // Query to get all products from different tables
    const sql = `
    SELECT 
        'crop' AS category,
        crop.name,
        crop.price,
        crop.phone_number AS seller_phone,
        farmers.name AS seller_name,
        address.Mandal AS mandal,
        address.Pincode AS pincode,
        crop.quantity AS weight,
        crop.image_path,  -- ✅ Fetch image path
        NULL AS description,
        NULL AS company,
        NULL AS rentSale,
        NULL AS bags
    FROM crop
    JOIN farmers ON crop.phone_number = farmers.phone_number
    JOIN address ON crop.phone_number = address.phone_number

    UNION ALL

    SELECT 
        'seeds' AS category,
        seeds.name,
        seeds.price,
        seeds.phone_number AS seller_phone,
        ard.name AS seller_name,
        address.Mandal AS mandal,
        address.Pincode AS pincode,
        seeds.weight,
        seeds.image_path,  -- ✅ Fetch image path
        NULL AS description,
        seeds.company,
        NULL AS rentSale,
        seeds.bags
    FROM seeds
    JOIN ard ON seeds.phone_number = ard.phone_number
    JOIN address ON seeds.phone_number = address.phone_number

    UNION ALL

    SELECT 
        'fertilizers' AS category,
        fertilizers.name,
        fertilizers.price,
        fertilizers.phone_number AS seller_phone,
        ard.name AS seller_name,
        address.Mandal AS mandal,
        address.Pincode AS pincode,
        fertilizers.weight,
        fertilizers.image_path,  -- ✅ Fetch image path
        fertilizers.description,
        fertilizers.company,
        NULL AS rentSale,
        fertilizers.bags
    FROM fertilizers
    JOIN ard ON fertilizers.phone_number = ard.phone_number
    JOIN address ON fertilizers.phone_number = address.phone_number

    UNION ALL

    SELECT 
        'pesticides' AS category,
        pesticides.name,
        pesticides.price,
        pesticides.phone_number AS seller_phone,
        ard.name AS seller_name,
        address.Mandal AS mandal,
        address.Pincode AS pincode,
        pesticides.weight,
        pesticides.image_path,  -- ✅ Fetch image path
        pesticides.description,
        pesticides.company,
        NULL AS rentSale,
        pesticides.bags
    FROM pesticides
    JOIN ard ON pesticides.phone_number = ard.phone_number
    JOIN address ON pesticides.phone_number = address.phone_number

    UNION ALL

    SELECT 
        'machinery' AS category,
        machinery.name,
        machinery.price,
        machinery.phone_number AS seller_phone,
        amd.name AS seller_name,
        address.Mandal AS mandal,
        address.Pincode AS pincode,
        NULL AS weight,
        machinery.image_path,  -- ✅ Fetch image path
        machinery.description,
        machinery.company,
        machinery.rentSale,
        NULL AS bags
    FROM machinery
    JOIN amd ON machinery.phone_number = amd.phone_number
    JOIN address ON machinery.phone_number = address.phone_number

    LIMIT ? OFFSET ?
    `;


    // First, get total count of products
    const countSql = `
        SELECT COUNT(*) as total FROM (
            SELECT name FROM crop
            UNION ALL
            SELECT name FROM seeds
            UNION ALL
            SELECT name FROM fertilizers
            UNION ALL
            SELECT name FROM pesticides
            UNION ALL
            SELECT name FROM machinery
        ) as total_products
    `;

    db.query(countSql, (err, countResult) => {
        if (err) {
            console.error('Error getting total count:', err);
            return res.status(500).send('Internal Server Error');
        }

        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / itemsPerPage);

        // Then get paginated products
        db.query(sql, [itemsPerPage, offset], (err, results) => {
            if (err) {
                console.error('Error fetching products:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('index', {
                products: results,
                currentPage: page,
                totalPages: totalPages,
                isLoggedIn: req.session.user ? true : false
            });
        });
    });
});

// Route to handle search form submission
app.post('/index', (req, res) => {
    const searchQuery = req.body.searchQuery.trim();

    const searchSql = `
        SELECT 'seeds' AS category, phone_number, name, company, price, weight, bags, image_path FROM seeds WHERE name LIKE ?
        UNION ALL
        SELECT 'fertilizers' AS category, phone_number, name, company, price, weight, bags, image_path FROM fertilizers WHERE name LIKE ?
        UNION ALL
        SELECT 'pesticides' AS category, phone_number, name, company, price, weight, bags, image_path FROM pesticides WHERE name LIKE ?
        UNION ALL
        SELECT 'machinery' AS category, phone_number, name, description, company, price, rentSale, image_path FROM machinery WHERE name LIKE ?
        UNION ALL
        SELECT 'crop' AS category, phone_number, name, NULL AS company, price, quantity AS weight, NULL AS bags, image_path FROM crop WHERE name LIKE ?
    `;

    db.query(searchSql, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error executing MySQL query:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ products: results });
    });
});


app.post('/farmer', (req, res) => {
    const searchQuery = req.body.searchQuery.trim(); // Get and sanitize input
    
    // Perform database queries based on the search query
    const searchSql = `
        SELECT 'seeds' AS category, phone_number, name, company, price, weight, bags, image_path FROM seeds WHERE name LIKE ?
        UNION ALL
        SELECT 'fertilizers' AS category, phone_number, name, company, price, weight, bags, image_path FROM fertilizers WHERE name LIKE ?
        UNION ALL
        SELECT 'pesticides' AS category, phone_number, name, company, price, weight, bags, image_path FROM pesticides WHERE name LIKE ?
        UNION ALL
        SELECT 'machinery' AS category, phone_number, name, description, company, price, rentSale, image_path  FROM machinery WHERE name LIKE ?
    `;

    // Execute the SQL query
    db.query(searchSql, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error executing MySQL query:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Return JSON response for AJAX call
        res.json({ products: results });
    });
});

// Route to handle search form submission
app.post('/customer', (req, res) => {
    const searchQuery = req.body.searchQuery.trim(); // Get and sanitize input
    
    // Perform database queries based on the search query
    const searchSql = `
        SELECT 'crop' AS category, phone_number, name, NULL AS company, price, image_path, quantity AS weight, NULL AS bags FROM crop WHERE name LIKE ?
    `;

    // Execute the SQL query
    db.query(searchSql, [`%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error executing MySQL query:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Return JSON response for AJAX call
        res.json({ products: results });
    });
});

// POST route to handle form submission
app.get('/login', (req, res) => {
    res.render('login', { year: new Date().getFullYear() });
});

app.get('/register', (req, res) => {
    res.render('register', { year: new Date().getFullYear() });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
