const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const { sign } = require("../utils/jwt");

// Categorías por defecto al crear una cuenta nueva — mismos iconos/colores
// que usa el frontend, para que el primer arranque ya tenga sentido visual.
const DEFAULT_CATEGORIES = [
  { name: "Salario", type: "INCOME", icon: "Briefcase", color: "#34C759" },
  { name: "Extra", type: "INCOME", icon: "Gift", color: "#5AC8FA" },
  { name: "Vivienda", type: "EXPENSE", icon: "Home", color: "#0071E3" },
  { name: "Alimentación", type: "EXPENSE", icon: "ShoppingCart", color: "#34C759" },
  { name: "Transporte", type: "EXPENSE", icon: "Car", color: "#FF9500" },
  { name: "Ocio", type: "EXPENSE", icon: "Gamepad2", color: "#AF52DE" },
  { name: "Salud", type: "EXPENSE", icon: "HeartPulse", color: "#FF2D55" },
  { name: "Suscripciones", type: "EXPENSE", icon: "Repeat", color: "#5AC8FA" },
];

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "Faltan campos" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Ese email ya está registrado" });

    const passwordHash = await bcrypt.hash(password, 10);

    // Todo o nada: si falla la creación de la cuenta, el usuario tampoco
    // queda creado. Antes podía quedar un usuario huérfano sin cuenta.
    const { user, account } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email, passwordHash, name } });
      const account = await tx.account.create({
        data: {
          name: `Cuenta de ${name}`,
          memberships: { create: { userId: user.id, role: "OWNER" } },
          categories: { create: DEFAULT_CATEGORIES },
        },
      });
      return { user, account };
    });

    const token = sign({ sub: user.id });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name }, accountId: account.id });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return res.status(401).json({ error: "Credenciales incorrectas" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Credenciales incorrectas" });

    const token = sign({ sub: user.id });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
}

// Tras un login social exitoso, passport deja al usuario en req.user.
// Se emite el mismo JWT que en email/password y se redirige al frontend.
function oauthCallback(req, res) {
  const token = sign({ sub: req.user.id });
  res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
}

module.exports = { register, login, oauthCallback };
