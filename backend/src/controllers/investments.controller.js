const prisma = require("../config/db");

async function list(req, res, next) {
  try {
    const investments = await prisma.investment.findMany({ where: { accountId: req.accountId } });
    const total = investments.reduce((a, i) => a + Number(i.quantity) * Number(i.currentPrice), 0);
    res.json({ investments, total });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, ticker, quantity, avgPrice, currentPrice } = req.body;
    if (!name || !ticker || !quantity || !avgPrice) return res.status(400).json({ error: "Faltan campos" });
    const investment = await prisma.investment.create({
      data: { name, ticker, quantity, avgPrice, currentPrice: currentPrice ?? avgPrice, accountId: req.accountId },
    });
    res.status(201).json(investment);
  } catch (err) {
    next(err);
  }
}

// Llamado por un job/cron futuro que consulte una API de cotizaciones real
// y actualice currentPrice de cada posición.
async function updatePrice(req, res, next) {
  try {
    const { currentPrice } = req.body;
    const investment = await prisma.investment.update({
      where: { id: req.params.id },
      data: { currentPrice },
    });
    res.json(investment);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, updatePrice };
