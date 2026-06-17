const express = require("express");
const passport = require("../config/passport");
const { register, login, oauthCallback } = require("../controllers/auth.controller");

const router = express.Router();

function requireStrategy(name) {
  return (req, res, next) => {
    if (!passport._strategy(name)) {
      return res.status(501).json({ error: `Login con ${name} no está configurado en el servidor` });
    }
    next();
  };
}

router.post("/register", register);
router.post("/login", login);

router.get(
  "/google",
  requireStrategy("google"),
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  requireStrategy("google"),
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  oauthCallback
);

router.get(
  "/apple",
  requireStrategy("apple"),
  passport.authenticate("apple", { session: false })
);
router.post(
  "/apple/callback",
  requireStrategy("apple"),
  passport.authenticate("apple", { session: false, failureRedirect: "/login" }),
  oauthCallback
);

module.exports = router;
