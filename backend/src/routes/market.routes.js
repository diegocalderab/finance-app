const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { search, quote, history } = require("../controllers/market.controller");

const router = express.Router();
router.use(requireAuth);

router.get("/search", search);
router.get("/quote/:symbol", quote);
router.get("/history/:symbol", history);

module.exports = router;
