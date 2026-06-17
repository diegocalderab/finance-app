const prisma = require("../config/db");

function withCurrent(goal) {
  const current = goal.contributions.reduce((a, c) => a + Number(c.amount), 0);
  return { ...goal, current };
}

async function list(req, res, next) {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { accountId: req.accountId },
      include: { contributions: true },
    });
    res.json(goals.map(withCurrent));
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const goal = await prisma.savingsGoal.findUnique({
      where: { id: req.params.id },
      include: { contributions: { orderBy: { date: "asc" } } },
    });
    if (!goal) return res.status(404).json({ error: "Bolsa no encontrada" });
    res.json(withCurrent(goal));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, icon, color, targetAmount } = req.body;
    if (!name || !icon || !color || !targetAmount) return res.status(400).json({ error: "Faltan campos" });
    const goal = await prisma.savingsGoal.create({ data: { name, icon, color, targetAmount, accountId: req.accountId } });
    res.status(201).json({ ...goal, current: 0 });
  } catch (err) {
    next(err);
  }
}

// Aportación a una bolsa — el frontend usa esto para la barra/anillo de progreso
// y el historial de aportaciones del detalle.
async function contribute(req, res, next) {
  try {
    const { amount, date, note } = req.body;
    if (!amount || !date) return res.status(400).json({ error: "Faltan campos" });
    const contribution = await prisma.contribution.create({
      data: { amount, date: new Date(date), note, goalId: req.params.id, userId: req.userId },
    });
    res.status(201).json(contribution);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, contribute };
