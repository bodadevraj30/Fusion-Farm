// amd.js

const { db } = require('../index');

// Middleware function to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        // User is authenticated
        next();
    } else {
        // User is not authenticated, redirect to login page
        res.redirect('/login');
    }
};

// Controller function for rendering the AMD dashboard
const renderAmdDashboard = (req, res) => {
    // Logic to render the AMD dashboard
    res.render('Amd_Dashboard');
};

// Function to upload machinery
const uploadMachinery = (req, res) => {
    // Extract data from the form submission
    const { name, company, price, description, rentSale } = req.body;
    console.log(req.body);

    // Insert the data into the database
    const sql = 'INSERT INTO machinery (name, company, price, description, rentSale) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, company, price, description, rentSale], (err, results) => {
        if (err) {
            console.error('Error uploading machinery:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Redirect to the AMD dashboard page after successful submission
        res.redirect('/amd');
    });
};

module.exports = {
    isAuthenticated,
    renderAmdDashboard,
    uploadMachinery
};
