const BASE = "https://query1.finance.yahoo.com";
const UA = "Mozilla/5.0 (compatible; finance-app/1.0)";

async function yahooGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Yahoo Finance ${res.status}`);
  return res.json();
}

// Búsqueda de acciones, ETFs, criptos por nombre o ticker.
async function search(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);
    const data = await yahooGet(
      `/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false`
    );
    const results = (data.quotes || [])
      .filter((r) => r.symbol && r.quoteType !== "OPTION" && r.quoteType !== "FUTURE")
      .map((r) => ({
        symbol: r.symbol,
        name: r.longname || r.shortname || r.symbol,
        type: r.quoteType,
        exchange: r.exchDisp || r.exchange || "",
      }));
    res.json(results);
  } catch (err) {
    next(err);
  }
}

// Cotización actual + cambio 1D y ~1M.
async function quote(req, res, next) {
  try {
    const { symbol } = req.params;
    const data = await yahooGet(
      `/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1mo`
    );
    const r = data.chart?.result?.[0];
    if (!r) return res.status(404).json({ error: "Símbolo no encontrado" });

    const meta = r.meta;
    const price = meta.regularMarketPrice ?? 0;
    const prev1d = meta.previousClose ?? meta.chartPreviousClose ?? price;
    const closes = r.indicators?.quote?.[0]?.close?.filter(Boolean) ?? [];
    const first = closes[0] ?? price;

    res.json({
      symbol: meta.symbol,
      name: meta.shortName || meta.longName || symbol,
      price,
      currency: meta.currency || "USD",
      change1d: prev1d ? ((price - prev1d) / prev1d) * 100 : 0,
      change1mo: first ? ((price - first) / first) * 100 : 0,
    });
  } catch (err) {
    next(err);
  }
}

// Histórico de precios para la gráfica.
async function history(req, res, next) {
  try {
    const { symbol } = req.params;
    const range = req.query.range || "1y";
    const intervalMap = { "1d": "5m", "5d": "30m", "1mo": "1d", "6mo": "1d", "1y": "1d", "5y": "1wk" };
    const interval = intervalMap[range] || "1d";

    const data = await yahooGet(
      `/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`
    );
    const r = data.chart?.result?.[0];
    if (!r) return res.status(404).json({ error: "Símbolo no encontrado" });

    const timestamps = r.timestamp || [];
    const closes = r.indicators?.quote?.[0]?.close || [];

    const isIntraday = range === "1d";
    const points = timestamps
      .map((ts, i) => ({ ts, price: closes[i] }))
      .filter((p) => p.price != null)
      .map((p) => ({
        date: isIntraday
          ? new Date(p.ts * 1000).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
          : new Date(p.ts * 1000).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
        price: Math.round(p.price * 100) / 100,
      }));

    res.json({ points, currency: r.meta.currency || "USD" });
  } catch (err) {
    next(err);
  }
}

module.exports = { search, quote, history };
