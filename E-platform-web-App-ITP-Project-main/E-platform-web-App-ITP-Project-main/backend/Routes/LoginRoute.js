const express = require("express");
const router = express.Router();
const Customer = require("../Models/CustomerModel");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {

    // Log immediately at the top
    console.log("Print From User Login:", req.body);

    const { mail, password } = req.body;

    const user = await Customer.findOne({ mail });
    if (!user) return res.status(401).json({ error: "User not found" });

    // Block OAuth users from normal login
    if (user.isOAuth) return res.status(400).json({ error: "Please log in with Google" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Success", user }); // ✅ match frontend
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return next(err);

      // Clear cookie with exact same name and path
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",  // must match session cookie
        secure: false,    // true if HTTPS
      });

      return res.json({ message: "Logged out successfully" });
    });
  });
});


router.get("/me", (req, res) => {
  if (req.user) {
    const safeUser = { ...req.user.toObject() };
    delete safeUser.password;
    res.json({ user: safeUser });
  } else {
    res.json({ user: null });
  }
});


module.exports = router;