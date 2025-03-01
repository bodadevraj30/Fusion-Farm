const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to define the year globally for all views
app.use((req, res, next) => {
    res.locals.year = new Date().getFullYear();
    next();
});

// Include rout files
const farmerRoutes = require('../routes/farmerRoutes');
const showRoutes = require('./routes/show');

// Use route files
app.use(farmerRoutes);
app.use(showRoutes);

app.get('/Farmer_Dashboard', (req, res) => {
    res.render('Farmer_Dashboard');
});

// Handle search form submission
app.post('/showResults', (req, res) => {
    const searchQuery = req.body.searchQuery;

    // Perform database queries based on the search query
    const sql = `
        SELECT phone_number, name, company, price, weight, bags FROM seeds WHERE name LIKE ?
        UNION
        SELECT phone_number, name, company, price, weight, bags FROM fertilizers WHERE name LIKE ?
        UNION
        SELECT phone_number, name, company, price, weight, bags FROM pesticides WHERE name LIKE ?
    `;

    const sql1 = `
        SELECT phone_number, name, description, company, price, rentSale FROM machinery WHERE name LIKE ?
    `;

    // Combine both queries into a single query
    const combinedSql = `${sql} UNION ${sql1}`;

    db.query(combinedSql, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error executing MySQL query:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Process the results and send them back to the client
        res.render('showResults', { results })
    });
});
