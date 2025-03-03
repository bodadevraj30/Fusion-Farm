const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { db } = require('../index');

const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/profile', isLoggedIn, (req, res) => {
  if (req.session && req.session.user && req.session.user.name) {
    console.log(`You are logged in as ${req.session.user.name}.`);
    res.render('profile', { userName: req.session.user.name });
  } else {
    res.redirect('/login');
  }
});

router.post('/profile', async (req, res) => {
  try {
    // Assuming middleware ensures a valid session (remove check if confident)
    // const { phone_number } = req.session.user;  // Optional check

    const { Password, ReenterPassword, HNo, village_city, Mandal, District, State, Landmark, Pincode } = req.body;
    const phone_number = req.session.user.phone_number;  // Retrieve phone number

    const updateAddressQuery = `
      UPDATE address
      SET H_No = ?, village_city = ?, Mandal = ?, District = ?, State = ?, Landmark = ?, Pincode = ?
      WHERE phone_number = ?`;
    const addressValues = [HNo, village_city, Mandal, District, State, Landmark, Pincode, phone_number];
    await db.query(updateAddressQuery, addressValues);

    let userType = '';
    const userTables = ['farmers', 'customer', 'ard', 'amd'];
    for (const table of userTables) {
      const countQuery = `SELECT COUNT(*) as count FROM ${table} WHERE phone_number = ?`;
      const result = await db.query(countQuery, [phone_number]);
      if (result && result.length > 0) {
        const [countRows] = result;
        if (countRows.count > 0) {
          userType = table;
          break;
        }
      }
    }

    if (!userType) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatePasswordQuery = `
      UPDATE ${userType}
      SET password = ?
      WHERE phone_number = ?`;
    const passwordValues = [Password, phone_number];
    await db.query(updatePasswordQuery, passwordValues);

    res.redirect('/profile');
  } catch (error) {
    console.error("Error updating form data in the database:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
