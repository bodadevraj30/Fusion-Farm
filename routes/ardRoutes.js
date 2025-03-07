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

// Route for ARD Dashboard
router.get('/ard', isLoggedIn, (req, res) => {
    // Logic to render the AMD dashboard
    res.render('Ard_Dashboard', { isLoggedIn: true });
});

// Route for handling seed upload
async function handleImageUpload(req) {
    if (!req.file) {
        throw new Error('No file uploaded.');
    }

    // ✅ Define unique filename
    const filename = `image-${Date.now()}.jpg`;
    const imagePath = path.join(__dirname, '..', 'public', 'images', filename);

    // ✅ Resize & save image
    await sharp(req.file.buffer)
        .resize(300, 300) // Resize to 300x300 pixels
        .toFormat('jpeg') // Convert to JPEG
        .toFile(imagePath);

    return `/images/${filename}`; // ✅ Return the stored image path
}

// ✅ Generic function to insert product data into the database
async function insertProduct(req, res, tableName, columns, values) {
    try {
        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(`Error inserting ${tableName} details:`, err);
                return res.status(500).send('Internal Server Error');
            }
            console.log(`${tableName} details inserted successfully.`);
            res.status(200).send(`${tableName} details received and inserted successfully.`);
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Request processing failed.');
    }
}

// ✅ Route to upload SEEDS
router.post('/upload/seeds', isLoggedIn, (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).send(err);

        const { name, company, price, weight, bags, description } = req.body;
        const phone_number = req.session.user.phone_number;

        if (!name || !company || !price || !weight) {
            return res.status(400).send('All fields except bags are required.');
        }

        try {
            const imagePath = await handleImageUpload(req);
            await insertProduct(req, res, 'seeds', 
                ['phone_number', 'name', 'company', 'price', 'weight', 'bags', 'description', 'image_path'],
                [phone_number, name, company, price, weight, bags || null, description || null, imagePath]
            );
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
});

// ✅ Route to upload PESTICIDES
router.post('/upload/pesticides', isLoggedIn, (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).send(err);

        const { name, company, price, weight, bags, description } = req.body;
        const phone_number = req.session.user.phone_number;

        if (!name || !company || !price || !weight) {
            return res.status(400).send('All fields except bags are required.');
        }

        try {
            const imagePath = await handleImageUpload(req);
            await insertProduct(req, res, 'pesticides', 
                ['phone_number', 'name', 'company', 'price', 'weight', 'bags', 'description', 'image_path'],
                [phone_number, name, company, price, weight, bags || null, description || null, imagePath]
            );
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
});

// ✅ Route to upload FERTILIZERS
router.post('/upload/fertilizers', isLoggedIn, (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).send(err);

        const { name, company, price, weight, bags, description } = req.body;
        const phone_number = req.session.user.phone_number;

        if (!name || !company || !price || !weight) {
            return res.status(400).send('All fields except bags are required.');
        }

        try {
            const imagePath = await handleImageUpload(req);
            await insertProduct(req, res, 'fertilizers', 
                ['phone_number', 'name', 'company', 'price', 'weight', 'bags', 'description', 'image_path'],
                [phone_number, name, company, price, weight, bags || null, description || null, imagePath]
            );
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
});

module.exports = router;