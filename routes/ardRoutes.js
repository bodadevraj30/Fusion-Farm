const express = require('express');
const router = express.Router();
const multer = require('multer'); // For handling file uploads
const path = require('path');
const { db } = require('../index');

// Set storage engine for multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'images')); // Correct destination path
    },
    filename: function(req, file, cb) {
        // Customize filename to avoid conflicts
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


// Initialize multer upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB file size limit
    fileFilter: function(req, file, cb) {
        // Check file type
        checkFileType(file, cb);
    }
}).single('image'); // 'image' corresponds to the name attribute of the file input field in the form

// Function to check file type
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only (JPEG, JPG, PNG)!');
    }
}

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        next(); // User is logged in, proceed with the request
    } else {
        res.redirect('/login'); // User is not logged in, redirect to login page
    }
};

// Route for ARD Dashboard
router.get('/ARD', isLoggedIn, (req, res) => {
    // Logic to render the AMD dashboard
    res.render('Ard_Dashboard', { isLoggedIn: true });
});

// Route for handling seed upload
router.post('/upload/seeds', isLoggedIn, (req, res) => {
    // Handle file upload
    upload(req, res, (err) => {
        if (err) {
            res.status(400).send(err);
        } else {
            // Extract data from the request body
            const { name, company, price, weight, bags, description } = req.body;
            const seedImage = req.file; // Uploaded image
            const phone_number = req.session.user.phone_number; // Get phone_number from session

            // Check if all required fields are provided
            if (!name || !company || !price || !weight) {
                return res.status(400).send('All fields except bags are required.');
            }

            // Logic to insert seed data into the 'seeds' table in the database
            const sql = `
                INSERT INTO seeds (phone_number, name, company, price, weight, bags)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [phone_number, name, company, price, weight, bags, description];

            // Execute the SQL query
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error inserting seed details:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                console.log('Seed details inserted successfully.');
                res.status(200).send('Seed details received and inserted successfully.');
            });
        }
    });
});

// Route for handling pesticide upload
router.post('/upload/pesticides', isLoggedIn, (req, res) => {
    // Handle file upload
    upload(req, res, (err) => {
        if (err) {
            res.status(400).send(err);
        } else {
            // Extract data from the request body
            const { name, company, price, weight, bags, description } = req.body;
            const phone_number = req.session.user.phone_number; // Get phone_number from session
            const pesticideFile = req.file; // Uploaded file

            // Check if all required fields are provided
            if (!name || !company || !price || !weight) {
                return res.status(400).send('All fields except bags are required.');
            }

            // Logic to handle pesticide data insertion into the database
            const sql = `
                INSERT INTO pesticides (phone_number, name, company, price, weight, bags, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [phone_number, name, company, price, weight, bags, description];

            // Execute the SQL query
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error inserting pesticide details:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                console.log('Pesticide details inserted successfully.');
                res.status(200).send('Pesticide details received and inserted successfully.');
            });
        }
    });
});

// Route for handling fertilizer upload
router.post('/upload/fertilizers', isLoggedIn, (req, res) => {
    // Handle file upload
    upload(req, res, (err) => {
        if (err) {
            res.status(400).send(err);
        } else {
            // Extract data from the request body
            const { name, company, price, weight, bags, description } = req.body;
            const fertilizerFile = req.file; // Uploaded file
            const phone_number = req.session.user.phone_number; // Get phone_number from session

            // Check if all required fields are provided
            if (!name || !company || !price || !weight) {
                return res.status(400).send('All fields except bags are required.');
            }

            // Logic to handle fertilizer data insertion into the database
            const sql = `
                INSERT INTO fertilizers (phone_number, name, company, price, weight, bags, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [phone_number, name, company, price, weight, bags, description];

            // Execute the SQL query
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error inserting fertilizer details:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                console.log('Fertilizer details inserted successfully.');
                res.status(200).send('Fertilizer details received and inserted successfully.');
            });
        }
    });
});

module.exports = router;
