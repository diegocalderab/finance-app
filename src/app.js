require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("./config/passport");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const accountsRoutes = require("./routes/accounts.routes");
const categoriesRoutes = require("./routes/categories.routes");
const transactionsRoutes = require("./routes/transactions.routes");
const goalsRoutes = require("./routes/goals.routes");
const investmentsRoutes = require("./routes/investments.routes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/investments", investmentsRoutes);

app.use(errorHandler);

module.exports = app;
