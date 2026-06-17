const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { resolveAccount } = require("../middleware/account");
const { list, getOne, create, contribute } = require("../controllers/goals.controller");

const router = express.Router();
router.use(requireAuth, resolveAccount);

router.get("/", list);
router.get("/:id", getOne);
router.post("/", create);
router.post("/:id/contributions", contribute);

module.exports = router;
