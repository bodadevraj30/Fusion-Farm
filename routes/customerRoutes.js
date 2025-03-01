const express = require('express');
const router = express.Router();
const { db } = require('../index');

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        next(); // User is logged in, proceed with the request
    } else {
        res.redirect('/login'); // User is not logged in, redirect to login page
    }
};

// Route to display the customer dashboard
router.get('/customer', isLoggedIn, (req, res) => {
    // Logic to render the customer dashboard
    res.render('Customer_Dashboard', { isLoggedIn: true });
});

// Route to display vegetable page
router.get('/customer/vegitables', isLoggedIn, (req, res) => {
    // Query the database to retrieve data from the Crop, Farmers, and Address tables
    const sql = `SELECT 
        C.name AS name,
        C.quantity AS quantity,
        F.name AS seller_name,
        C.price AS price,
        F.name AS farmer_name,
        A.Mandal AS mandal,
        F.phone_number AS phone_number,
        A.Pincode AS pincode
    FROM 
        Crop C
    JOIN 
        Farmers F ON C.phone_number = F.phone_number
    JOIN 
        Address A ON C.phone_number = A.phone_number`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching vegetables data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Render the vegetables page and pass the retrieved data
        res.render('Vegitables', { vegetables: results, isLoggedIn: true });
    });
});

router.get('/searchVegi', (req, res) => {
    const searchQuery = req.query.query;

    // Modify SQL query to filter seeds based on search
    const sql = `SELECT 
        C.name AS name,
        C.quantity AS quantity,
        F.name AS seller_name,
        C.price AS price,
        F.name AS farmer_name,
        A.Mandal AS mandal,
        F.phone_number AS phone_number,
        A.Pincode AS pincode
    FROM 
        Crop C
    JOIN 
        Farmers F ON C.phone_number = F.phone_number
    JOIN 
        Address A ON C.phone_number = A.phone_number
    WHERE 
        C.name LIKE ?`;

    db.query(sql, [`%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error searching seeds:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.render('Vegitables', { vegetables: results, isLoggedIn: true });
    });
});

// Other routes for customer-related actions...

module.exports = router;
