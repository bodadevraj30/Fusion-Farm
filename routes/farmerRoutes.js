// farmerRoutes.js

const express = require('express');
const router = express.Router();
const { db } = require('../index');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'images')); // Store images in public/images folder
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB file size limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only (JPEG, JPG, PNG)!');
    }
}

router.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Redirect the user to the login page after logout
        res.redirect('/login');
    });
});

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        next(); // User is logged in, proceed with the request
    } else {
        res.redirect('/login'); // User is not logged in, redirect to login page
    }
};

// Define other routes for Farmer dashboard
router.get('/farmer', isLoggedIn, (req, res) => {
    const isLoggedIn = req.session && req.session.user ? true : false;
    res.render('Farmer_Dashboard', { isLoggedIn });
});

// Function to render the seeds page
router.get('/farmer/seeds', isLoggedIn, (req, res) => {
    const isLoggedIn = req.session && req.session.user ? true : false;
    // Query the database to retrieve data from the seeds table
    const sql = `SELECT 
        S.name AS name,
        ARD.name AS seller_name,
        A.Mandal AS mandal,
        A.Pincode AS pincode,
        S.phone_number AS phone_number,
        S.price AS price,
        S.weight AS weight
    FROM 
        Seeds S
    JOIN 
        ARD ON S.phone_number = ARD.phone_number
    JOIN 
        Address A ON S.phone_number = A.phone_number`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching seeds data:', err);
            return res.status(500).send('Internal Server Error');
        }

        const seeds = results;
        // Render the seeds page and pass the retrieved data, along with productType
        res.render('seeds', { isLoggedIn, productType: 'seeds', seeds });
    });
});

// Function to render the fertilizers page
router.get('/farmer/fertilizers', isLoggedIn, (req, res) => {
    const isLoggedIn = req.session && req.session.user ? true : false;
    // Query the database to retrieve data from the fertilizers table
    const sql = `SELECT 
        F.name AS name,
        F.description AS description,
        F.company AS company,
        F.price AS price,
        F.weight AS weight,
        F.bags AS bags,
        ARD.name AS seller_name,
        Address.Mandal AS mandal,
        Address.Pincode AS pincode,
        F.phone_number AS phone_number
    FROM 
        Fertilizers F
    JOIN 
        ARD ON F.phone_number = ARD.phone_number
    JOIN 
        Address ON F.phone_number = Address.phone_number`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching fertilizers data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Render the fertilizers page and pass the retrieved data
        res.render('fertilizers', {isLoggedIn, fertilizers: results });
    });
});

// Function to render the pesticides page
router.get('/farmer/pesticides', isLoggedIn, (req, res) => {
    const isLoggedIn = req.session && req.session.user ? true : false;

    // Query the database to retrieve data from the pesticides table
    const sql = `SELECT 
        P.name AS name,
        P.description AS description,
        P.company AS company,
        P.price AS price,
        P.weight AS weight,
        P.bags AS bags,
        ARD.name AS seller_name,
        Address.Mandal AS mandal,
        Address.Pincode AS pincode,
        P.phone_number AS phone_number
    FROM 
        Pesticides P
    JOIN 
        ARD ON P.phone_number = ARD.phone_number
    JOIN 
        Address ON P.phone_number = Address.phone_number`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching pesticides data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Render the pesticides page and pass the retrieved data and login status
        res.render('pesticides', { pesticides: results, isLoggedIn });
    });
});


// Function to render the machinery page
router.get('/farmer/Machinerys', isLoggedIn, (req, res) => {
    const isLoggedIn = req.session && req.session.user ? true : false;

    // Query the database to retrieve data from the machinery table
    const sql = `SELECT 
        M.name AS name,
        M.description AS description,
        M.company AS company,
        M.price AS price,
        M.rentSale AS rentSale,
        AMD.name AS seller_name,
        Address.Mandal AS mandal,
        Address.Pincode AS pincode,
        M.phone_number AS phone_number
    FROM 
        Machinery M
    JOIN 
        AMD ON M.phone_number = AMD.phone_number
    JOIN 
        Address ON M.phone_number = Address.phone_number`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching machinery data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Render the machinery page and pass the retrieved data and login status
        res.render('Machinerys', { Machinerys: results, isLoggedIn });
    });
});

// Define route for farmer_upload
router.get('/farmer_upload', isLoggedIn, (req, res) => {
    // Assuming isLoggedIn is needed in this template
    res.render('farmer_upload', { isLoggedIn: true });
});


// Route to handle crop upload form submission
router.post('/upload/crop', isLoggedIn, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).send(err);
        } else {
            handleCropUpload(req, res);
        }
    });
});

function handleCropUpload(req, res) {
    const { name, quantity, price } = req.body;
    const phone_number = req.session.user.phone_number;
    if (!name || !quantity || !price) {
        return res.status(400).send('Missing data.');
    }

    const image = req.file.filename;

    // Insert crop data into the database
    const sql = 'INSERT INTO Crop (phone_number, name, quantity, price) VALUES (?, ?, ?, ?)';
    const values = [phone_number, name, quantity, price];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error uploading crop:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        console.log('Crop details inserted successfully.');
        // Redirect to the farmer_upload page
        res.redirect('/farmer_upload');
    });
}

router.get('/search', (req, res) => {
    console.log("Received search request:", req.query); // Debugging

    const searchQuery = req.query.query;
    const category = req.query.category || "all";  // Default to "all" if no category is provided

    let sql = "";
    let template = "";
    let queryParams = [];

    switch (category) {
        case "seeds":
            sql = `
                SELECT 
                S.name AS name,
                ARD.name AS seller_name,
                A.Mandal AS mandal,
                A.Pincode AS pincode,
                S.phone_number AS phone_number,
                S.price AS price,
                S.weight AS weight
                FROM 
                    Seeds S
                JOIN 
                    ARD ON S.phone_number = ARD.phone_number
                JOIN 
                    Address A ON S.phone_number = A.phone_number
                WHERE 
                    S.name LIKE ?`;
            template = "seeds";
            queryParams = [`%${searchQuery}%`];
            break;

        case "fertilizers":
            sql = `
                SELECT 
                F.name AS name,
                F.description AS description,
                F.company AS company,
                F.price AS price,
                F.weight AS weight,
                F.bags AS bags,
                ARD.name AS seller_name,
                Address.Mandal AS mandal,
                Address.Pincode AS pincode,
                F.phone_number AS phone_number
                FROM 
                    Fertilizers F
                JOIN 
                    ARD ON F.phone_number = ARD.phone_number
                JOIN 
                    Address ON F.phone_number = Address.phone_number
                WHERE 
                    F.name LIKE ?`;
            template = "fertilizers";
            queryParams = [`%${searchQuery}%`];
            break;

        case "pesticides":
            sql = `
                SELECT 
                P.name AS name,
                P.description AS description,
                P.company AS company,
                P.price AS price,
                P.weight AS weight,
                P.bags AS bags,
                ARD.name AS seller_name,
                Address.Mandal AS mandal,
                Address.Pincode AS pincode,
                P.phone_number AS phone_number
                FROM 
                    Pesticides P
                JOIN 
                    ARD ON P.phone_number = ARD.phone_number
                JOIN 
                    Address ON P.phone_number = Address.phone_number 
                WHERE 
                    P.name LIKE ?`;
            template = "pesticides";
            queryParams = [`%${searchQuery}%`];
            break;

        case "machinery":
            sql = `
                SELECT 
                M.name AS name,
                M.description AS description,
                M.company AS company,
                M.price AS price,
                M.rentSale AS rentSale,
                AMD.name AS seller_name,
                Address.Mandal AS mandal,
                Address.Pincode AS pincode,
                M.phone_number AS phone_number
                FROM 
                    Machinery M
                JOIN 
                    AMD ON M.phone_number = AMD.phone_number
                JOIN 
                    Address ON M.phone_number = Address.phone_number
                WHERE 
                    M.name LIKE ?`;
            template = "machinery";
            queryParams = [`%${searchQuery}%`];
            break;

        default:
            sql = `
                SELECT 
                S.name AS name,
                ARD.name AS seller_name,
                A.Mandal AS mandal,
                A.Pincode AS pincode,
                S.phone_number AS phone_number,
                S.price AS price,
                S.weight AS weight
                FROM 
                    Seeds S
                JOIN 
                    ARD ON S.phone_number = ARD.phone_number
                JOIN 
                    Address A ON S.phone_number = A.phone_number
                WHERE 
                    S.name LIKE ?
                UNION
                SELECT 
                F.name AS name,
                F.description AS description,
                F.company AS company,
                F.price AS price,
                F.weight AS weight,
                F.bags AS bags,
                ARD.name AS seller_name,
                Address.Mandal AS mandal,
                Address.Pincode AS pincode,
                F.phone_number AS phone_number
                FROM 
                    Fertilizers F
                JOIN 
                    ARD ON F.phone_number = ARD.phone_number
                JOIN 
                    Address ON F.phone_number = Address.phone_number
                WHERE 
                    F.name LIKE ?
                UNION
                SELECT 
                P.name AS name,
                P.description AS description,
                P.company AS company,
                P.price AS price,
                P.weight AS weight,
                P.bags AS bags,
                ARD.name AS seller_name,
                Address.Mandal AS mandal,
                Address.Pincode AS pincode,
                P.phone_number AS phone_number
                FROM 
                    Pesticides P
                JOIN 
                    ARD ON P.phone_number = ARD.phone_number
                JOIN 
                    Address ON P.phone_number = Address.phone_number 
                WHERE 
                    P.name LIKE ?
                UNION
                SELECT 
                M.name AS name,
                M.description AS description,
                M.company AS company,
                M.price AS price,
                M.rentSale AS rentSale,
                AMD.name AS seller_name,
                Address.Mandal AS mandal,
                Address.Pincode AS pincode,
                M.phone_number AS phone_number
                FROM 
                    Machinery M
                JOIN 
                    AMD ON M.phone_number = AMD.phone_number
                JOIN 
                    Address ON M.phone_number = Address.phone_number
                WHERE 
                    M.name LIKE ?`;
            template = "searchResults"; 
            queryParams = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`];
    }

    db.query(sql, queryParams, (err, results) => {
        if (err) {
            console.error("Error searching:", err);
            return res.status(500).send("Internal Server Error");
        }

        let data = {
            productType: category,
            isLoggedIn: req.session.user ? true : false
        };

        data[category] = results;

        res.render(template, data);
    });
});




// Route to handle adding items to the cart for different product types
router.post('/add-to-cart/:productType', isLoggedIn, (req, res) => {
    const buyerPhoneNumber = req.session.user.phone_number;
    const { itemName, price } = req.body;
    const currentTime = new Date().toLocaleTimeString();
    const currentDate = new Date().toLocaleDateString();
    const productType = req.params.productType;

    console.log('Buyer Phone Number:', buyerPhoneNumber);
    console.log(req.body);
    console.log('Product Type:', productType);

    // Define the appropriate table name based on the product type
    let tableName;
    switch (productType) {
        case 'seeds':
            tableName = 'Seeds';
            break;
        case 'machinery':
            tableName = 'Machinery';
            break;
        case 'pesticides':
            tableName = 'Pesticides';
            break;
        case 'fertilizers':
            tableName = 'Fertilizers';
            break;
        default:
            return res.status(400).json({ error: 'Invalid product type' });
    }

    console.log('Table Name:', tableName);

    // Query the specified table to get the seller's phone number based on the item name
    const sql = `SELECT phone_number FROM ${tableName} WHERE name = ?`;
    console.log('Query:', sql);
    db.query(sql, [itemName], (err, results) => {
        if (err) {
            console.error('Error fetching seller phone number:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const sellerPhoneNumber = results[0].phone_number;

        console.log('Seller Phone Number:', sellerPhoneNumber);

        // Insert the item into the cart table
        const insertSql = 'INSERT INTO Cart (buyer_phone_no, seller_phone_no, item_name, price, time, date) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [buyerPhoneNumber, sellerPhoneNumber, itemName, price, currentTime, currentDate];

        console.log('Insert Query:', insertSql);
        console.log('Values:', values);

        db.query(insertSql, values, (err, result) => {
            if (err) {
                console.error('Error adding item to cart:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            console.log('Item added to cart successfully.');
            res.sendStatus(200);
        });
    });
});



module.exports = router;
