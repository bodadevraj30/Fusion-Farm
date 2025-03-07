const express = require('express');
const app = express();
const router = express.Router();
const { db } = require('../index');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        next(); // User is logged in, proceed with the request
    } else {
        res.redirect('/login'); // User is not logged in, redirect to login page
    }
};

// Route to display customer dashboard
router.get('/customer', isLoggedIn, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 12;
    const offset = (page - 1) * itemsPerPage;

    // ✅ Query to retrieve `image_path`
    const sql = `
        SELECT 
            C.name AS name,
            C.price AS price,
            F.name AS seller_name,
            A.Mandal AS mandal,
            A.Pincode AS pincode,
            C.image_path -- ✅ Fetch image path
        FROM 
            crop C
        JOIN 
            farmers F ON C.phone_number = F.phone_number
        JOIN 
            address A ON C.phone_number = A.phone_number
        LIMIT ? OFFSET ?
    `;

    // ✅ Get total count of crops
    const countSql = `SELECT COUNT(*) as total FROM crop`;

    db.query(countSql, (err, countResult) => {
        if (err) {
            console.error('Error getting total count:', err);
            return res.status(500).send('Internal Server Error');
        }

        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / itemsPerPage);

        // ✅ Get paginated crops
        db.query(sql, [itemsPerPage, offset], (err, results) => {
            if (err) {
                console.error('Error fetching crops:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('Customer_Dashboard', {
                products: results,
                currentPage: page,
                totalPages: totalPages,
                isLoggedIn: req.session.user ? true : false
            });
        });
    });
});

// Route to display vegetable page
router.get('/customer/vegitables', isLoggedIn, (req, res) => {
    const sql = `
        SELECT 
            C.name AS name,
            C.quantity AS quantity,
            F.name AS seller_name,
            C.price AS price,
            A.Mandal AS mandal,
            F.phone_number AS phone_number,
            A.Pincode AS pincode,
            C.image_path -- ✅ Fetch image path
        FROM 
            crop C
        JOIN 
            farmers F ON C.phone_number = F.phone_number
        JOIN 
            address A ON C.phone_number = A.phone_number`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching vegetables data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.render('Vegitables', { vegetables: results, isLoggedIn: true });
    });
});

// ✅ Route to Search Vegetables (Crops)
router.get('/searchVegi', (req, res) => {
    const searchQuery = req.query.query;

    const sql = `
        SELECT 
            C.name AS name,
            C.quantity AS quantity,
            F.name AS seller_name,
            C.price AS price,
            A.Mandal AS mandal,
            F.phone_number AS phone_number,
            A.Pincode AS pincode,
            C.image_path -- ✅ Fetch image path
        FROM 
            crop C
        JOIN 
            farmers F ON C.phone_number = F.phone_number
        JOIN 
            address A ON C.phone_number = A.phone_number
        WHERE 
            C.name LIKE ?`;

    db.query(sql, [`%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error searching crops:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.render('Vegitables', { vegetables: results, isLoggedIn: true });
    });
});

router.post('/addToCart/crop', isLoggedIn, (req, res) => {
    console.log("🔵 Received Add to Cart request:", req.body); // ✅ Log received data

    if (!req.body || Object.keys(req.body).length === 0) {
        console.error("🔴 Request body is empty. Fix frontend fetch or server middleware.");
        return res.status(400).json({ error: "Empty request body received." });
    }

    const { itemName, price } = req.body;

    if (!itemName || !price) {
        console.error("🔴 Missing itemName or price - Received:", req.body);
        return res.status(400).json({ error: "Missing itemName or price" });
    }

    console.log("🟢 Looking for item:", itemName, "with price:", price);

    const sql = `SELECT c.phone_number FROM crop c 
                 JOIN farmers f ON c.phone_number = f.phone_number 
                 WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(?))`;

    db.query(sql, [itemName], (err, results) => {
        if (err) {
            console.error('🔴 Error fetching seller phone number:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            console.error('🔴 Item not found in database:', itemName);
            return res.status(404).json({ error: `Item not found: ${itemName}` });
        }

        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0]; 
        const currentDate = now.toISOString().split('T')[0];

        const sellerPhoneNumber = results[0].phone_number;
        console.log('🟢 Seller Phone Number:', sellerPhoneNumber);

        const insertSql = 'INSERT INTO cart (buyer_phone_no, seller_phone_no, item_name, price, time, date) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [req.session.user.phone_number, sellerPhoneNumber, itemName, price, currentTime, currentDate];

        console.log('🟢 Inserting into cart:', values);

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
