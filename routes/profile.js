const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { db } = require("../index");

const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    console.log("🔴 User session not found. Redirecting to login.");
    res.redirect("/login");
  }
};

router.use(bodyParser.urlencoded({ extended: true }));

// ✅ Fetch user type without .promise()
router.get("/profile", isLoggedIn, (req, res) => {
  const phone_number = req.session.user.phone_number;

  // Identify user type
  const userTables = ["farmers", "customer", "ard", "amd"];
  let userType = "";

  const findUserType = (index) => {
    if (index >= userTables.length) {
      return res.status(404).json({ message: "User not found." });
    }

    const table = userTables[index];
    const countQuery = `SELECT COUNT(*) as count FROM ${table} WHERE phone_number = ?`;

    db.query(countQuery, [phone_number], (err, result) => {
      if (err) {
        console.error("Error checking user type:", err);
        return res.status(500).send("Internal Server Error");
      }

      if (result[0].count > 0) {
        userType = table;
        fetchUserDetails();
      } else {
        findUserType(index + 1);
      }
    });
  };

  const fetchUserDetails = () => {
    const sql = `
      SELECT U.name, U.phone_number, 
             A.H_No, A.village_city, A.Mandal, A.District, A.State, A.Landmark, A.Pincode 
      FROM ${userType} U
      JOIN address A ON U.phone_number = A.phone_number
      WHERE U.phone_number = ?`;

    db.query(sql, [phone_number], (err, result) => {
      if (err) {
        console.error("Error fetching user details:", err);
        return res.status(500).send("Internal Server Error");
      }

      if (result.length === 0) {
        return res.status(404).send("User not found.");
      }
      
      // ✅ Determine Home Page URL
      let homePage = "/";
      switch (userType) {
          case "farmer": homePage = "/farmer"; break;
          case "customer": homePage = "/customer"; break;
          case "ard": homePage = "/ARD"; break;
          case "amd": homePage = "/AMD"; break;
      }

      res.render("profile", { user: result[0], homePage });
    });
  };

  findUserType(0);
});



// ✅ UPDATE PROFILE (Fixed Version Without `.promise()`)
router.post("/profile", isLoggedIn, (req, res) => {
  const {
    Password,
    ReenterPassword,
    HNo,
    village_city,
    Mandal,
    District,
    State,
    Landmark,
    Pincode,
  } = req.body;
  const phone_number = req.session.user.phone_number;

  // 🔹 Step 1: Identify user type (farmers, customer, ard, amd)
  const userTables = ["farmers", "customer", "ard", "amd"];
  let userType = "";

  const findUserType = (index) => {
    if (index >= userTables.length) {
      console.log("🔴 No matching user type found for:", phone_number);
      return res.status(404).send("User not found.");
    }

    const table = userTables[index];
    const countQuery = `SELECT COUNT(*) as count FROM ${table} WHERE phone_number = ?`;

    db.query(countQuery, [phone_number], (err, result) => {
      if (err) {
        console.error("❌ Error checking user type:", err);
        return res.status(500).send("Internal Server Error");
      }

      if (result[0].count > 0) {
        console.log(`🟢 User found in table: ${table}`);
        userType = table;
        updateProfile();
      } else {
        findUserType(index + 1);
      }
    });
  };

  // 🔹 Step 2: Update Profile
  const updateProfile = () => {
    const updateAddressQuery = `
      UPDATE address
      SET 
        H_No = COALESCE(?, H_No),
        village_city = COALESCE(?, village_city),
        Mandal = COALESCE(?, Mandal),
        District = COALESCE(?, District),
        State = COALESCE(?, State),
        Landmark = COALESCE(?, Landmark),
        Pincode = COALESCE(?, Pincode)
      WHERE phone_number = ?`;

    const addressValues = [
      HNo || null,
      village_city || null,
      Mandal || null,
      District || null,
      State || null,
      Landmark || null,
      Pincode || null,
      phone_number,
    ];

    db.query(updateAddressQuery, addressValues, (err) => {
      if (err) {
        console.error("❌ Error updating address:", err);
        return res.status(500).send("Internal Server Error");
      }

      console.log("🟢 Address updated successfully.");

      // 🔹 Step 3: Update Password (Only if provided)
      if (Password && Password === ReenterPassword) {
        const updatePasswordQuery = `UPDATE ${userType} SET password = ? WHERE phone_number = ?`;

        db.query(updatePasswordQuery, [Password, phone_number], (err) => {
          if (err) {
            console.error("❌ Error updating password:", err);
            return res.status(500).send("Internal Server Error");
          }
          console.log("🟢 Password updated successfully.");
        });
      }

      console.log("🟢 User details updated successfully.");
      res.redirect("/profile");
    });
  };

  findUserType(0);
});

module.exports = router;
