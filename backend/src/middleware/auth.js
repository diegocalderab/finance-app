const { verify } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autenticado" });
  }
  try {
    const payload = verify(header.split(" ")[1]);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o caducado" });
  }
}

module.exports = { requireAuth };
