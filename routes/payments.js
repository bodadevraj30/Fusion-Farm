// customerRoutes.js

const express = require('express');
const router = express.Router();

// Route to display the customer dashboard
router.get('/payments', (req, res) => {
    // Logic to render the customer dashboard
    res.render('payments');
});

module.exports = router;
