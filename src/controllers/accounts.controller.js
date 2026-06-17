const prisma = require("../config/db");

async function listMine(req, res, next) {
  try {
    const memberships = await prisma.membership.findMany({
      where: { userId: req.userId },
      include: { account: true },
    });
    res.json(memberships.map((m) => ({ id: m.account.id, name: m.account.name, role: m.role })));
  } catch (err) {
    next(err);
  }
}

module.exports = { listMine };
