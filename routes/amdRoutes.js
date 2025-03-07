const express = require('express');
const router = express.Router();
const multer = require('multer'); // For handling file uploads
const path = require('path');
const { db } = require('../index');
const sharp = require('sharp'); 

// Set storage engine for multer
const storage = multer.memoryStorage();

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
router.get('/amd', isLoggedIn, (req, res) => {
    // Logic to render the AMD dashboard
    res.render('Amd_Dashboard', { isLoggedIn: true });
});

router.post('/upload/machinery', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send(err);
        }

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { name, company, price, description, rentSale } = req.body;
        const phone_number = req.session.user.phone_number;

        if (!name || !company || !price || !description || !rentSale) {
            return res.status(400).send('Missing data.');
        }

        // ✅ Define unique filename
        const filename = `image-${Date.now()}.jpg`;
        const imagePath = path.join(__dirname, '..', 'public', 'images', filename);

        try {
            // ✅ Resize & save image
            await sharp(req.file.buffer)
                .resize(300, 300) // Resize to 300x300 pixels
                .toFormat('jpeg') // Convert to JPEG
                .toFile(imagePath);

            // ✅ Store image path in the database
            const sql = 'INSERT INTO machinery (phone_number, name, company, price, description, rentSale, image_path) VALUES (?, ?, ?, ?, ?, ?)';
            const values = [phone_number, name, company, price, description, rentSale, imagePath];

            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error uploading machinery:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                console.log('✅ machinery details inserted successfully.');
                res.redirect('/farmer_upload'); // Redirect after upload
            });
        } catch (error) {
            console.error('Error processing image:', error);
            res.status(500).send('Image processing failed.');
        }
    });
});

module.exports = router;
