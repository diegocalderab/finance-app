const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { listMine } = require("../controllers/accounts.controller");

const router = express.Router();

router.get("/me", requireAuth, listMine);

module.exports = router;
