const prisma = require("../config/db");

function monthRange(month, year) {
  const start = new Date(Number(year), Number(month) - 1, 1);
  const end = new Date(Number(year), Number(month), 1);
  return { start, end };
}

async function list(req, res, next) {
  try {
    const { month, year } = req.query;
    const where = { accountId: req.accountId };
    if (month && year) where.date = { gte: monthRange(month, year).start, lt: monthRange(month, year).end };

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { type, amount, date, note, categoryId } = req.body;
    if (!type || !amount || !date || !categoryId) return res.status(400).json({ error: "Faltan campos" });
    const tx = await prisma.transaction.create({
      data: { type, amount, date: new Date(date), note, categoryId, accountId: req.accountId, userId: req.userId },
      include: { category: true },
    });
    res.status(201).json(tx);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Totales + desglose por categoría de un mes — alimenta el dashboard.
async function summary(req, res, next) {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ error: "month y year son obligatorios" });
    const { start, end } = monthRange(month, year);

    const transactions = await prisma.transaction.findMany({
      where: { accountId: req.accountId, date: { gte: start, lt: end } },
      include: { category: true },
    });

    const income = transactions.filter((t) => t.type === "INCOME").reduce((a, t) => a + Number(t.amount), 0);
    const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((a, t) => a + Number(t.amount), 0);

    const byCategory = {};
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        byCategory[t.category.name] = (byCategory[t.category.name] || 0) + Number(t.amount);
      });

    res.json({ income, expense, balance: income - expense, byCategory });
  } catch (err) {
    next(err);
  }
}

// Serie de los últimos N meses (ingresos/gastos) — alimenta la gráfica de evolución.
async function trend(req, res, next) {
  try {
    const months = Number(req.query.months) || 6;
    const now = new Date();
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      const txs = await prisma.transaction.findMany({ where: { accountId: req.accountId, date: { gte: start, lt: end } } });
      const income = txs.filter((t) => t.type === "INCOME").reduce((a, t) => a + Number(t.amount), 0);
      const expense = txs.filter((t) => t.type === "EXPENSE").reduce((a, t) => a + Number(t.amount), 0);
      results.push({ month: start.toLocaleDateString("es-ES", { month: "short" }), income, expense });
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
}

// Saldo disponible para repartir: lo que ha entrado menos lo que ha
// salido, menos lo que ya está apartado en bolsas o invertido. Evita que
// el mismo euro se pueda asignar dos veces.
async function availableBalance(req, res, next) {
  try {
    const [transactions, goals, investments] = await Promise.all([
      prisma.transaction.findMany({ where: { accountId: req.accountId } }),
      prisma.savingsGoal.findMany({ where: { accountId: req.accountId }, include: { contributions: true } }),
      prisma.investment.findMany({ where: { accountId: req.accountId } }),
    ]);

    const income = transactions.filter((t) => t.type === "INCOME").reduce((a, t) => a + Number(t.amount), 0);
    const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((a, t) => a + Number(t.amount), 0);
    const allocated = goals.reduce((sum, g) => sum + g.contributions.reduce((a, c) => a + Number(c.amount), 0), 0);
    const invested = investments.reduce((a, i) => a + Number(i.quantity) * Number(i.avgPrice), 0);

    const available = income - expense - allocated - invested;
    res.json({ income, expense, allocated, invested, available });
  } catch (err) {
    next(err);
  }
}

// Meses distintos que tienen al menos una transacción, ordenados desc.
async function months(req, res, next) {
  try {
    const txs = await prisma.transaction.findMany({
      where: { accountId: req.accountId },
      select: { date: true },
      orderBy: { date: "desc" },
    });

    const seen = new Set();
    const result = [];
    for (const t of txs) {
      const year = t.date.getFullYear();
      const month = t.date.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;
      if (!seen.has(key)) {
        seen.add(key);
        const d = new Date(year, month - 1, 1);
        result.push({
          year,
          month,
          label: d.toLocaleDateString("es-ES", { month: "long" }),
          short: d.toLocaleDateString("es-ES", { month: "short" }),
        });
      }
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, remove, summary, trend, availableBalance, months };
