const prisma = require("../config/db");

async function list(req, res, next) {
  try {
    const categories = await prisma.category.findMany({ where: { accountId: req.accountId } });
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, type, icon, color } = req.body;
    if (!name || !type || !icon || !color) return res.status(400).json({ error: "Faltan campos" });
    const category = await prisma.category.create({ data: { name, type, icon, color, accountId: req.accountId } });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, remove };
