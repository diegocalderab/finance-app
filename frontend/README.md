# Finance Frontend

App React (Vite) conectada a la API real (Express + Postgres en Render/Neon).

## Arranque

```
npm install
cp .env.example .env   # ya trae tu URL de Render puesta
npm run dev
```

Abre `http://localhost:5173`. Regístrate con un email nuevo — desde ahí ya
trabaja contra tu base de datos real (categorías por defecto, movimientos,
bolsas de ahorro, inversiones).

## Aviso sobre el plan gratuito de Render

El servicio se duerme tras 15 min sin uso. La primera petición tras dormirse
tarda 30-60s en responder — la pantalla de login ya avisa de esto, no es un
error.

## Estructura

```
src/
  lib/api.js        cliente HTTP + token
  lib/theme.js       colores, fuentes, iconos, utilidades de fecha
  components/ui.jsx  Card, Delta, CategoryIcon, AnimatedNumber, etc.
  components/sheets.jsx  modales (nuevo movimiento, aportar, nueva inversión...)
  screens/           Auth, Dashboard, Movements, Savings, Investments, Compare, Settings, Shell
```

## Pendiente / mejoras naturales

- Login social (Google/Apple) — el botón no existe todavía en esta pantalla,
  el backend ya lo soporta si se configura.
- Subir esto a Vercel o Netlify para tener una URL pública (hoy solo corre
  en local con `npm run dev`).
