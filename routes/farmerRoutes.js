const express = require('express');
const router = express.Router();
const app = express();
const { db } = require('../index');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();

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

// ✅ Retrieve and Display All Products in Farmer Dashboard
router.get('/farmer', isLoggedIn, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 12;
    const offset = (page - 1) * itemsPerPage;

    // ✅ SQL query to retrieve products with images
    const sql = `
        SELECT 
            'seeds' AS category,
            seeds.name,
            seeds.price,
            seeds.phone_number AS seller_phone,
            ard.name AS seller_name,
            address.Mandal AS mandal,
            address.Pincode AS pincode,
            seeds.weight,
            seeds.image_path -- ✅ Fetch image path
        FROM seeds
        JOIN ard ON seeds.phone_number = ard.phone_number
        JOIN address ON seeds.phone_number = address.phone_number

        UNION ALL

        SELECT 
            'fertilizers' AS category,
            fertilizers.name,
            fertilizers.price,
            fertilizers.phone_number AS seller_phone,
            ard.name AS seller_name,
            address.Mandal AS mandal,
            address.Pincode AS pincode,
            fertilizers.weight,
            fertilizers.image_path -- ✅ Fetch image path
        FROM fertilizers
        JOIN ard ON fertilizers.phone_number = ard.phone_number
        JOIN address ON fertilizers.phone_number = address.phone_number

        UNION ALL

        SELECT 
            'pesticides' AS category,
            pesticides.name,
            pesticides.price,
            pesticides.phone_number AS seller_phone,
            ard.name AS seller_name,
            address.Mandal AS mandal,
            address.Pincode AS pincode,
            pesticides.weight,
            pesticides.image_path -- ✅ Fetch image path
        FROM pesticides
        JOIN ard ON pesticides.phone_number = ard.phone_number
        JOIN address ON pesticides.phone_number = address.phone_number

        UNION ALL

        SELECT 
            'machinery' AS category,
            machinery.name,
            machinery.price,
            machinery.phone_number AS seller_phone,
            amd.name AS seller_name,
            address.Mandal AS mandal,
            address.Pincode AS pincode,
            NULL AS weight,
            machinery.image_path -- ✅ Fetch image path
        FROM machinery
        JOIN amd ON machinery.phone_number = amd.phone_number
        JOIN address ON machinery.phone_number = address.phone_number

        LIMIT ? OFFSET ?
    `;

    // First, get total count of products
    const countSql = `
        SELECT COUNT(*) as total FROM (
            SELECT name FROM seeds
            UNION ALL
            SELECT name FROM fertilizers
            UNION ALL
            SELECT name FROM pesticides
            UNION ALL
            SELECT name FROM machinery
        ) as total_products
    `;

    db.query(countSql, (err, countResult) => {
        if (err) {
            console.error('Error getting total count:', err);
            return res.status(500).send('Internal Server Error');
        }

        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / itemsPerPage);

        // Then get paginated products
        db.query(sql, [itemsPerPage, offset], (err, results) => {
            if (err) {
                console.error('Error fetching products:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('Farmer_Dashboard', {
                products: results,
                currentPage: page,
                totalPages: totalPages,
                isLoggedIn: req.session.user ? true : false
            });
        });
    });
});

// Function to render the seeds page
router.get('/farmer/seeds', isLoggedIn, (req, res) => {
    const sql = `
        SELECT S.name, S.price, S.weight, S.image_path, 
               A.Mandal AS mandal, A.Pincode AS pincode, 
               S.phone_number, ard.name AS seller_name 
        FROM seeds S
        JOIN ard ON S.phone_number = ard.phone_number
        JOIN address A ON S.phone_number = A.phone_number`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching seeds data:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.render('seeds', { seeds: results, isLoggedIn: req.session.user ? true : false });
    });
});

// Function to render the fertilizers page
router.get('/farmer/fertilizers', isLoggedIn, (req, res) => {
    const sql = `
        SELECT F.name, F.price, F.weight, F.bags, F.image_path, 
               A.Mandal AS mandal, A.Pincode AS pincode, 
               F.phone_number, ard.name AS seller_name 
        FROM fertilizers F
        JOIN ard ON F.phone_number = ard.phone_number
        JOIN address A ON F.phone_number = A.phone_number`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching fertilizers data:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.render('fertilizers', { fertilizers: results, isLoggedIn: req.session.user ? true : false });
    });
});

// Function to render the pesticides page
router.get('/farmer/pesticides', isLoggedIn, (req, res) => {
    const sql = `
        SELECT P.name, P.price, P.weight, P.bags, P.image_path, 
               A.Mandal AS mandal, A.Pincode AS pincode, 
               P.phone_number, ard.name AS seller_name 
        FROM pesticides P
        JOIN ard ON P.phone_number = ard.phone_number
        JOIN address A ON P.phone_number = A.phone_number`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching pesticides data:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.render('pesticides', { pesticides: results, isLoggedIn: req.session.user ? true : false });
    });
});


// Function to render the machinery page
router.get('/farmer/machinerys', isLoggedIn, (req, res) => {
    const sql = `
        SELECT M.name, M.price, M.rentSale, M.image_path, 
               A.Mandal AS mandal, A.Pincode AS pincode, 
               M.phone_number, amd.name AS seller_name 
        FROM machinery M
        JOIN amd ON M.phone_number = amd.phone_number
        JOIN address A ON M.phone_number = A.phone_number`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching machinery data:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.render('machinerys', { machinerys: results, isLoggedIn: req.session.user ? true : false });
    });
});

// Define route for farmer_upload
router.get('/farmer_upload', isLoggedIn, (req, res) => {
    // Assuming isLoggedIn is needed in this template
    res.render('farmer_upload', { isLoggedIn: true });
});


// Route to handle crop upload form submission
router.post('/upload/crop', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send(err);
        }

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { name, quantity, price } = req.body;
        const phone_number = req.session.user.phone_number;

        if (!name || !quantity || !price) {
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
            const sql = 'INSERT INTO crop (phone_number, name, quantity, price, image_path) VALUES (?, ?, ?, ?, ?)';
            const values = [phone_number, name, quantity, price, `/images/${filename}`];

            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error uploading crop:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                console.log('✅ Crop details inserted successfully.');
                res.redirect('/farmer_upload'); // Redirect after upload
            });
        } catch (error) {
            console.error('Error processing image:', error);
            res.status(500).send('Image processing failed.');
        }
    });
});


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
                ard.name AS seller_name,
                A.Mandal AS mandal,
                A.Pincode AS pincode,
                S.phone_number AS phone_number,
                S.price AS price,
                S.weight AS weight
                FROM 
                    seeds S
                JOIN 
                    ard ON S.phone_number = ard.phone_number
                JOIN 
                    address A ON S.phone_number = A.phone_number
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
                ard.name AS seller_name,
                address.Mandal AS mandal,
                address.Pincode AS pincode,
                F.phone_number AS phone_number
                FROM 
                    fertilizers F
                JOIN 
                    ard ON F.phone_number = ard.phone_number
                JOIN 
                    address ON F.phone_number = address.phone_number
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
                ard.name AS seller_name,
                address.Mandal AS mandal,
                address.Pincode AS pincode,
                P.phone_number AS phone_number
                FROM 
                    pesticides P
                JOIN 
                    ard ON P.phone_number = ard.phone_number
                JOIN 
                    address ON P.phone_number = address.phone_number 
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
                amd.name AS seller_name,
                address.Mandal AS mandal,
                address.Pincode AS pincode,
                M.phone_number AS phone_number
                FROM 
                    machinery M
                JOIN 
                    amd ON M.phone_number = amd.phone_number
                JOIN 
                    address ON M.phone_number = address.phone_number
                WHERE 
                    M.name LIKE ?`;
            template = "machinery";
            queryParams = [`%${searchQuery}%`];
            break;

        default:
            sql = `
                SELECT 
                S.name AS name,
                ard.name AS seller_name,
                A.Mandal AS mandal,
                A.Pincode AS pincode,
                S.phone_number AS phone_number,
                S.price AS price,
                S.weight AS weight
                FROM 
                    seeds S
                JOIN 
                    ard ON S.phone_number = ard.phone_number
                JOIN 
                    address A ON S.phone_number = A.phone_number
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
                ard.name AS seller_name,
                address.Mandal AS mandal,
                address.Pincode AS pincode,
                F.phone_number AS phone_number
                FROM 
                    fertilizers F
                JOIN 
                    ard ON F.phone_number = ard.phone_number
                JOIN 
                    address ON F.phone_number = address.phone_number
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
                ard.name AS seller_name,
                address.Mandal AS mandal,
                address.Pincode AS pincode,
                P.phone_number AS phone_number
                FROM 
                    pesticides P
                JOIN 
                    ard ON P.phone_number = ard.phone_number
                JOIN 
                    address ON P.phone_number = address.phone_number 
                WHERE 
                    P.name LIKE ?
                UNION
                SELECT 
                M.name AS name,
                M.description AS description,
                M.company AS company,
                M.price AS price,
                M.rentSale AS rentSale,
                amd.name AS seller_name,
                address.Mandal AS mandal,
                address.Pincode AS pincode,
                M.phone_number AS phone_number
                FROM 
                    machinery M
                JOIN 
                    amd ON M.phone_number = amd.phone_number
                JOIN 
                    address ON M.phone_number = address.phone_number
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
router.post('/addToCart/:productType', isLoggedIn, (req, res) => {
    console.log("🔵 Received Add to Cart request:", req.body); // ✅ Log received data

    if (!req.body || Object.keys(req.body).length === 0) {
        console.error("🔴 Request body is empty. Fix frontend fetch or server middleware.");
        return res.status(400).json({ error: "Empty request body received." });
    }

    const now = new Date();
    const buyerPhoneNumber = req.session?.user?.phone_number;
    const { itemName, price } = req.body;
    const productType = req.params.productType.toLowerCase();
    const currentTime = now.toTimeString().split(' ')[0];
    const currentDate = now.toISOString().split('T')[0];

    console.log('in farmer.js');
    console.log('🟢 Buyer Phone Number:', buyerPhoneNumber);
    console.log('🟢 Product Type:', productType);
    console.log('🟢 Item Name:', itemName);
    console.log('🟢 Price:', price);

    if (!buyerPhoneNumber) {
        return res.status(401).json({ error: "User not logged in." });
    }

    // Define the appropriate table name based on the product type
    let tableName;
    switch (productType) {
        case 'seeds':
            tableName = 'seeds';
            break;
        case 'machinery':
        case 'machinerys': // Fix typo from 'machinerys' to 'machinery'
            tableName = 'machinery';
            break;
        case 'pesticides':
            tableName = 'pesticides';
            break;
        case 'fertilizers':
            tableName = 'fertilizers';
            break;
        default:
            console.error('🔴 Invalid product type:', productType);
            return res.status(400).json({ error: `Invalid product type: ${productType}` });
    }

    console.log('🟢 Table Name:', tableName);

    // Query the specified table to get the seller's phone number based on the item name
    const sql = `SELECT phone_number FROM ${tableName} WHERE LOWER(name) = LOWER(?)`;
    console.log('🟢 Query:', sql);

    db.query(sql, [itemName], (err, results) => {
        if (err) {
            console.error('🔴 Error fetching seller phone number:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            console.error('🔴 Item not found in database:', itemName);
            return res.status(404).json({ error: `Item not found: ${itemName}` });
        }

        const sellerPhoneNumber = results[0].phone_number;
        console.log('🟢 Seller Phone Number:', sellerPhoneNumber);

        // Insert the item into the cart table
        const insertSql = `INSERT INTO cart (buyer_phone_no, seller_phone_no, item_name, price, time, date) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [buyerPhoneNumber, sellerPhoneNumber, itemName, price, currentTime, currentDate];

        console.log('🟢 Insert Query:', insertSql);
        console.log('🟢 Values:', values);

        db.query(insertSql, values, (err, result) => {
            if (err) {
                console.error('🔴 Error adding item to cart:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            console.log('🟢 Item added to cart successfully.');
            res.json({ message: "Item added to cart successfully!" });
        });
    });
});




module.exports = router;
