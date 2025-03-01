const express = require('express');
const router = express.Router();
const { db } = require('../index'); // Import the db object from index.js

// GET route to render the registration form
router.get('/register', (req, res) => {
    res.render('register');
});

// POST route to handle form submission
router.post('/register', (req, res) => {
    const { Name, Password, ReenterPassword, PhoneNumber, HNo, Street, Mandal, District, State, Landmark, Pincode, user_type } = req.body;


    // Check if passwords match
    if (Password !== ReenterPassword) {
        res.status(400).send('Passwords do not match');
        return;
    }

    // Insert user data into the appropriate table based on user_type
    const sql = `INSERT INTO ${user_type} (phone_number, name, password) VALUES (?, ?, ?)`;
    db.query(sql, [PhoneNumber, Name, Password], (err, results) => {
        if (err) {
            console.error('Error registering user:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Insert address details into the Address table
        const addressSql = `INSERT INTO Address (phone_number, State, District, Mandal, village_city, H_No, Pincode, Landmark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(addressSql, [PhoneNumber, State, District, Mandal, Street, HNo, Pincode, Landmark], (addressErr, addressResults) => {
            if (addressErr) {
                console.error('Error inserting address:', addressErr);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.redirect('/login'); // Redirect to the login page after successful registration
        });
    });
});

module.exports = router;
