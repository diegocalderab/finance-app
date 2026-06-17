const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { resolveAccount } = require("../middleware/account");
const { list, create, remove } = require("../controllers/categories.controller");

const router = express.Router();
router.use(requireAuth, resolveAccount);

router.get("/", list);
router.post("/", create);
router.delete("/:id", remove);

module.exports = router;
