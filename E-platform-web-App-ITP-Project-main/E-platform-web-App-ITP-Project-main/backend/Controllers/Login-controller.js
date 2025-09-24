const express = require("express");
const router = express.Router();
const Customer = require("../Models/CustomerModel");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {

     console.log("Print From User Login: " , req.body);


    const { mail, password } = req.body;


    const user = await Customer.findOne({ mail });
    if (!user) return res.status(401).json({ error: "User not found" });

    if (user.isOAuth) return res.status(400).json({ error: "Please log in with Google" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Logged in successfully", user });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }


});

module.exports = router;
