const express = require('express');
const router = express.Router();
const { db } = require('../index'); // Import the db object from index.js

// GET route to render the login form
// router.get('/login', (req, res) => {
//     res.render('login');
// });


// POST route to handle form submission
router.post('/login', (req, res) => {
    const { phoneNumber, password, user_type } = req.body; // Extracting user_type from the request body

    let tableName = ''; // Initialize the table name variable to store the appropriate table name for the user type
    let dashboardRoute = ''; // Initialize the dashboard route variable

    // Determine the table name and dashboard route based on the user type
    switch (user_type) {
        case 'farmer':
            tableName = 'farmers';
            dashboardRoute = '/farmer'; // Redirect route for Farmer
            break;
        case 'customer':
            tableName = 'customer';
            dashboardRoute = '/customer'; // Redirect route for Customer
            break;
        case 'ard':
            tableName = 'ard';
            dashboardRoute = '/ARD'; // Redirect route for ARD
            break;
        case 'amd':
            tableName = 'amd';
            dashboardRoute = '/AMD'; // Redirect route for AMD
            break;
        default:
            return res.send(`<script>alert("Invalid user type"); window.location='/login';</script>`);
    }

    // Retrieve user from the database based on phone number and user type
    const sql = `SELECT * FROM ${tableName} WHERE phone_number = ? AND password = ?`;
    db.query(sql, [phoneNumber, password], (err, results) => {
        if (err) {
            console.error('🔴 Error retrieving user:', err);
            return res.send(`<script>alert("Internal Server Error"); window.location='/login';</script>`);
        }

        // If no user found, show alert and redirect back to login
        if (results.length === 0) {
            return res.send(`<script>alert("Invalid phone number or password"); window.location='/login';</script>`);
        }

        // ✅ If login successful, set user session
        const user = results[0];
        req.session.user = user;
        req.session.userType = user_type;
        console.log("🟢 User successfully logged in:", req.session.user);

        // Redirect to the respective dashboard route
        res.redirect(dashboardRoute);
    });
});

module.exports = router;
