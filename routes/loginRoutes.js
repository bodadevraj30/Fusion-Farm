const express = require('express');
const router = express.Router();
const { db } = require('../index'); // Import the db object from index.js

// GET route to render the login form
router.get('/login', (req, res) => {
    res.render('login');
});

// POST route to handle form submission
router.post('/login', (req, res) => {
    const { phoneNumber, password, user_type } = req.body; // Extracting user_type from the request body

    let tableName = ''; // Initialize the table name variable to store the appropriate table name for the user type
    let dashboardRoute = ''; // Initialize the dashboard route variable

    // Determine the table name and dashboard route based on the user type
    switch (user_type) {
        case 'farmer':
            tableName = 'farmers';
            dashboardRoute = '/farmer'; // Set the dashboard route for Farmer
            break;
        case 'customer':
            tableName = 'customer';
            dashboardRoute = '/customer'; // Set the dashboard route for Customer
            break;
        case 'ard':
            tableName = 'ard';
            dashboardRoute = '/ARD'; // Set the dashboard route for ARD
            break;
        case 'amd':
            tableName = 'ard';
            dashboardRoute = '/AMD'; // Set the dashboard route for AMD
            break;
        default:
            res.status(400).send('Invalid user type');
            return;
    }

    // Retrieve user from the database based on the provided phone number and user type
    const sql = `SELECT * FROM ${tableName} WHERE phone_number = ? AND password = ?`;
    db.query(sql, [phoneNumber, password], (err, results) => {
        if (err) {
            console.error('Error retrieving user:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Check if a user with the provided phone number and password exists
        if (results.length === 0) {
            res.status(401).send('Invalid phone number or password');
            return;
        }

        // At this point, the user is authenticated
        // You may choose to set up a session or send a JWT token for authentication
        // For simplicity, let's assume we set a session
        const user = results[0];
        req.session.user = user;
        res.redirect(dashboardRoute); // Redirect to the respective dashboard route
    });
});

module.exports = router;
