// customerRoutes.js

const express = require('express');
const router = express.Router();

// Route to display the customer dashboard
router.get('/showResults', (req, res) => {
    // Logic to render the customer dashboard
    res.render('showResults');
});

// Other routes for customer-related actions...

module.exports = router;
