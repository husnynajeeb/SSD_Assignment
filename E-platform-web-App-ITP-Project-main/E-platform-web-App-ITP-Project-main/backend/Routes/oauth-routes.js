const express = require("express");
const router = express.Router();
const passport = require("../../passport");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.FRONTEND_URL.trim() + "/login",
    session: true,
  }),
  (req, res) => {
    // ✅ redirect to frontend after login
    res.redirect(process.env.FRONTEND_URL.trim());
  }
);

module.exports = router;