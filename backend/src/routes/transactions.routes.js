const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { resolveAccount } = require("../middleware/account");
const { list, create, remove, summary, trend, availableBalance } = require("../controllers/transactions.controller");

const router = express.Router();
router.use(requireAuth, resolveAccount);

router.get("/", list);
router.get("/summary", summary);
router.get("/trend", trend);
router.get("/balance", availableBalance);
router.post("/", create);
router.delete("/:id", remove);

module.exports = router;
