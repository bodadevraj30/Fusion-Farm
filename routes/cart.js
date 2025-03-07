const express = require('express');
const router = express.Router();

// Import the database connection from index.js
const { db } = require('../index');

// Define route to fetch cart items
router.get('/cart', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // Fetch cart items for the logged-in user
    const buyerPhoneNo = req.session.user.phone_number;

    // Determine the user's home page based on user type
    let homePage = "/";
    if (req.session.userType === "farmer") homePage = "/farmer";
    else if (req.session.userType === "customer") homePage = "/customer";
    else if (req.session.userType === "ard") homePage = "/ARD";
    else if (req.session.userType === "amd") homePage = "/AMD";

    // ✅ Fetch cart items (No need for itemName, price, or time here)
    const sql = 'SELECT item_name, date, price FROM cart WHERE buyer_phone_no = ?';

    db.query(sql, [buyerPhoneNo], (err, results) => {
        if (err) {
            console.error('Error fetching cart items:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // ✅ Render the cart page with the retrieved items
        res.render('cart', { cart: results, homePage });
    });
});

router.post('/cart/remove', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const buyerPhoneNo = req.session.user.phone_number;
    const itemName = req.body.item_name;

    if (!itemName) {
        return res.status(400).send('Invalid request: Item name is missing.');
    }

    const sql = 'DELETE FROM cart WHERE buyer_phone_no = ? AND item_name = ? LIMIT 1';

    db.query(sql, [buyerPhoneNo, itemName], (err, result) => {
        if (err) {
            console.error('Error removing item from cart:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        console.log(`🟢 Item "${itemName}" removed from cart successfully.`);
        res.redirect('/cart');
    });
});

router.post('/cart', (req, res) => {
    res.status(200).send('redirecting to purchases page');
});


// Export the router
module.exports = router;
