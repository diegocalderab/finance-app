// Borra todos los datos financieros (transacciones, bolsas, aportaciones,
// inversiones) pero conserva el usuario, la cuenta y las categorías.
// Uso: node scripts/reset-account.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const [contributions, investments, goals, transactions] = await Promise.all([
    prisma.contribution.deleteMany({}),
    prisma.investment.deleteMany({}),
    prisma.savingsGoal.deleteMany({}),
    prisma.transaction.deleteMany({}),
  ]);

  console.log("Datos eliminados:");
  console.log(`  Aportaciones:  ${contributions.count}`);
  console.log(`  Inversiones:   ${investments.count}`);
  console.log(`  Bolsas:        ${goals.count}`);
  console.log(`  Transacciones: ${transactions.count}`);
  console.log("Usuario, cuenta y categorías conservados. ✓");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
