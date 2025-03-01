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

// Route for AMD Dashboard
router.get('/AMD', isLoggedIn, (req, res) => {
    // Logic to render the AMD dashboard
    res.render('Amd_Dashboard', { isLoggedIn: true });
});

// Route to handle machinery upload form submission
router.post('/upload/machinery', isLoggedIn, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).send(err);
        } else {
            handleMachineryUpload(req, res);
        }
    });
});

function handleMachineryUpload(req, res) {
    // Extract form data
    const { name, company, price, description, rentSale } = req.body;
    const phone_number = req.session.user.phone_number;
    console.log(phone_number);
    console.log(req.body);

    if (!name || !company || !price || !description || !rentSale) {
        return res.status(400).send('Missing data.');
    }

    // Insert the machinery data into the database
    const sql = 'INSERT INTO Machinery (phone_number, name, company, price, description, rentSale) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [phone_number, name, company, price, description, rentSale]; // Assuming req.file contains filename

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error uploading machinery:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        // If the insertion is successful, redirect to a success page or render a success message
        console.log('Machinery details inserted successfully.');
        res.status(200).send('Machinery details received and inserted successfully.');
    });
}

module.exports = router;
