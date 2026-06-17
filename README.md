# Finance Backend

API en Node.js + Express + PostgreSQL (Prisma) para la app de finanzas personales.

## Arranque

```
npm install
cp .env.example .env   # rellena DATABASE_URL, JWT_SECRET, claves de Google/Apple
npx prisma migrate dev --name init
npm run dev
```

Servidor en `http://localhost:4000`.

## Endpoints

- `POST /api/auth/register` `{ email, password, name }`
- `POST /api/auth/login` `{ email, password }`
- `GET  /api/auth/google` → redirige a Google, vuelve con `?token=` en `CLIENT_URL/oauth-callback`
- `GET  /api/auth/apple` → equivalente con Apple
- `GET  /api/accounts/me` — cuentas del usuario (hoy 1, lista para compartidas)
- `GET  /api/categories`
- `POST /api/categories` `{ name, type, icon, color }`
- `GET  /api/transactions?month=6&year=2026`
- `GET  /api/transactions/summary?month=6&year=2026` — ingresos/gastos/balance + desglose por categoría
- `GET  /api/transactions/trend?months=6` — serie para la gráfica de evolución
- `POST /api/transactions` `{ type, amount, date, note, categoryId }`
- `GET  /api/goals` — bolsas con `current` calculado
- `GET  /api/goals/:id` — detalle + historial de aportaciones
- `POST /api/goals` `{ name, icon, color, targetAmount }`
- `POST /api/goals/:id/contributions` `{ amount, date, note }`
- `GET  /api/investments`
- `POST /api/investments` `{ name, ticker, quantity, avgPrice, currentPrice }`
- `PATCH /api/investments/:id/price` `{ currentPrice }` — para cuando se conecte la API de cotizaciones real

Todas las rutas salvo `/auth/*` y `/health` requieren `Authorization: Bearer <token>`.

## Modelo de datos

`User` ↔ `Membership` ↔ `Account` ya es muchos-a-muchos: cada usuario tiene hoy
una sola cuenta personal, pero la tabla soporta añadir más miembros a una
cuenta sin cambiar el esquema — ahí enganchan más adelante gastos, ingresos y
bolsas compartidas.
