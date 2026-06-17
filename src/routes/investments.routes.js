const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { resolveAccount } = require("../middleware/account");
const { list, create, updatePrice } = require("../controllers/investments.controller");

const router = express.Router();
router.use(requireAuth, resolveAccount);

router.get("/", list);
router.post("/", create);
router.patch("/:id/price", updatePrice);

module.exports = router;
