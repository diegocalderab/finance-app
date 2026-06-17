const prisma = require("../config/db");

// Hoy cada usuario tiene una sola cuenta personal (su primera membresía).
// Cuando existan cuentas compartidas, aquí se elegirá la cuenta activa
// (por ejemplo vía header X-Account-Id) en lugar de tomar la primera.
async function resolveAccount(req, res, next) {
  try {
    const membership = await prisma.membership.findFirst({ where: { userId: req.userId } });
    if (!membership) return res.status(404).json({ error: "El usuario no tiene cuenta asociada" });
    req.accountId = membership.accountId;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { resolveAccount };
