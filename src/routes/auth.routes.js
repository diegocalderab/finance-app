const express = require("express");
const passport = require("../config/passport");
const { register, login, oauthCallback } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  oauthCallback
);

router.get("/apple", passport.authenticate("apple", { session: false }));
router.post(
  "/apple/callback",
  passport.authenticate("apple", { session: false, failureRedirect: "/login" }),
  oauthCallback
);

module.exports = router;
