const express = require('express');
const router = express.Router();

// Import the database connection from index.js
const { db } = require('../index');

// Define route to fetch cart items
router.get('/cart', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        // If user is not logged in, redirect to login page
        return res.redirect('/login');
    }

    // Fetch cart items for the logged-in user
    const buyerPhoneNo = req.session.user.phone_number;
    const sql = 'SELECT item_name, date, price FROM Cart WHERE buyer_phone_no = ?';

    db.query(sql, [buyerPhoneNo], (err, results) => {
        if (err) {
            console.error('Error fetching cart items:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Render the cart page with the retrieved items
        res.render('cart', { cart: results });
    });
});

router.post('/cart', (req, res) => {
    res.status(200).send('redirecting to purchases page');
});


// Export the router
module.exports = router;
