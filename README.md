# 🏍️ MotoVelocity

A motorcycle storefront built with **React + Vite** and **Express**, with a real AI chatbot and a
working purchase flow. The chat is live out of the box — no canned demo replies.

## Features

- Sleek dark racing-ui: hero, stats, inventory grid, search, category filters and sorting
- Bike cards with specs, prices, stock, **Add to cart** and **Ask AI** actions
- **Cart drawer** with quantity controls, saved to localStorage, and free delivery over $5,000
- **Checkout** form → Express saves orders to `server/data/orders.json` and returns a confirmation number
- **MotoBot** chat widget with typing indicator, quick prompts and conversation memory
- AI providers, tried in order:
  1. **OpenRouter** using a free model (when `OPENROUTER_API_KEY` is set)
  2. **Kilo Gateway** (`kilo-auto/free`) — genuinely free and keyless, so real AI works with zero setup
  3. **BlockRun** free models as a second keyless backup
  4. Local emergency answer only if every AI service is unreachable
- Every reply is generated fresh: high temperature, rotating tone instructions, no fixed script
- Express serves the built React app in production

## Quick start

Requirements: **Node.js 20.19+**.

```bash
cd motorcycle-shop
npm run install:all
npm run dev
```

Open **http://localhost:5173**. The API runs on http://localhost:5000. The chatbot works immediately
through the free keyless gateway.

## Optional: use your own OpenRouter key

Free keys: https://openrouter.ai/keys · Free models: https://openrouter.ai/models?free=true

```bash
copy server\.env.example server\.env
```

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

Restart `npm run dev`. The chat header will say **"AI online · OpenRouter"**. Free model availability
changes often — if one fails, the server automatically falls back to the keyless gateway.

## Production build

```bash
npm run build
npm start
```

Then open **http://localhost:5000**.

## API

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/motorcycles` | List bikes (`?search=&category=&maxPrice=`) |
| GET | `/api/motorcycles/:id` | Single bike |
| GET | `/api/categories` | Category list |
| GET | `/api/chat/status` | Active AI provider / model |
| POST | `/api/chat` | `{ "messages": [{ "role": "user", "content": "..." }] }` |
| POST | `/api/orders` | `{ "items": [{ "id": 1, "qty": 2 }], "customer": { ... } }` |
| GET | `/api/orders/:id` | Look up an order |

## Project structure

```
motorcycle-shop/
├── server/
│   ├── data/
│   │   ├── motorcycles.js   # Inventory seed data
│   │   └── orders.json      # Created when the first order is placed
│   ├── index.js             # Express API, AI proxy, orders
│   └── .env.example
└── client/
    ├── src/components/      # Navbar, Hero, Inventory, BikeCard, Chatbot, Cart, Checkout, Footer
    ├── src/context/         # Cart state (localStorage)
    ├── src/styles.css
    └── vite.config.js
```

## Notes

- Orders are stored locally for demo purposes — no real payment is taken.
- Keyless free AI gateways are rate-limited and community-run; if one is down, another is tried.
- `npm audit` reports a dev-only advisory in Vite's transitive `picomatch`; it does not affect the production bundle.
