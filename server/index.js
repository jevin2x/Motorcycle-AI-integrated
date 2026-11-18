import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { motorcycles } from './data/motorcycles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.OPENROUTER_API_KEY?.trim() || '';
const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free';
const KILO_MODEL = process.env.KILO_MODEL || 'kilo-auto/free';
const KILO_URL = 'https://api.kilo.ai/api/openrouter/chat/completions';
const BLOCKRUN_MODEL = process.env.BLOCKRUN_MODEL || 'nvidia/gpt-oss-120b';
const BLOCKRUN_URL = 'https://blockrun.ai/api/v1/chat/completions';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

app.use(cors());
app.use(express.json({ limit: '64kb' }));

const money = (n) => '$' + n.toLocaleString('en-US');

function readOrders() {
  try {
    const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  fs.mkdirSync(path.dirname(ORDERS_FILE), { recursive: true });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

/* ------------------------------------------------------------------ */
/* Inventory API                                                       */
/* ------------------------------------------------------------------ */

app.get('/api/motorcycles', (req, res) => {
  const { search = '', category = 'All', maxPrice } = req.query;
  let results = [...motorcycles];

  if (search) {
    const term = String(search).toLowerCase();
    results = results.filter((b) =>
      [b.name, b.brand, b.category, b.engine].some((field) =>
        field.toLowerCase().includes(term)
      )
    );
  }
  if (category && category !== 'All') {
    results = results.filter((b) => b.category === category);
  }
  if (maxPrice) {
    const cap = Number(maxPrice);
    if (!Number.isNaN(cap)) results = results.filter((b) => b.price <= cap);
  }

  res.json({ count: results.length, motorcycles: results });
});

app.get('/api/motorcycles/:id', (req, res) => {
  const bike = motorcycles.find((b) => b.id === Number(req.params.id));
  if (!bike) return res.status(404).json({ error: 'Motorcycle not found' });
  res.json(bike);
});

app.get('/api/categories', (_req, res) => {
  res.json(['All', ...new Set(motorcycles.map((b) => b.category))]);
});

/* ------------------------------------------------------------------ */
/* Purchases                                                           */
/* ------------------------------------------------------------------ */

app.post('/api/orders', (req, res) => {
  const { items, customer } = req.body || {};

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }
  if (!customer?.name || !customer?.email || !customer?.address) {
    return res.status(400).json({ error: 'Name, email and delivery address are required.' });
  }

  const lines = [];
  for (const entry of items) {
    const bike = motorcycles.find((b) => b.id === Number(entry.id));
    if (!bike) return res.status(400).json({ error: `Unknown bike id: ${entry.id}` });
    const qty = Math.min(10, Math.max(1, Number(entry.qty) || 1));
    lines.push({
      id: bike.id,
      name: bike.name,
      brand: bike.brand,
      price: bike.price,
      qty,
      image: bike.image,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const delivery = subtotal >= 5000 ? 0 : 199;
  const total = subtotal + tax + delivery;

  const stamp = new Date();
  const order = {
    id: `MV-${stamp.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    createdAt: stamp.toISOString(),
    status: 'confirmed',
    items: lines,
    customer: {
      name: String(customer.name).slice(0, 120),
      email: String(customer.email).slice(0, 160),
      phone: String(customer.phone || '').slice(0, 40),
      address: String(customer.address).slice(0, 240),
      city: String(customer.city || '').slice(0, 80),
      zip: String(customer.zip || '').slice(0, 20),
    },
    subtotal,
    tax,
    delivery,
    total,
  };

  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);

  res.status(201).json(order);
});

app.get('/api/orders/:id', (req, res) => {
  const order = readOrders().find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

/* ------------------------------------------------------------------ */
/* Emergency local assistant (only if every AI provider is down)      */
/* ------------------------------------------------------------------ */

function localAssistant(question = '') {
  const q = question.toLowerCase();
  const list = (arr) =>
    arr
      .map((b) => `• ${b.name} (${b.brand}) — ${money(b.price)} · ${b.engine}`)
      .join('\n');

  if (/electric|ev\b|battery/.test(q)) return `Electric picks:\n${list(motorcycles.filter((b) => b.category === 'Electric'))}`;
  if (/sport|superbike|fast/.test(q)) return `Sport picks:\n${list(motorcycles.filter((b) => b.category === 'Sport'))}`;
  if (/cruiser|chopper|harley/.test(q)) return `Cruisers:\n${list(motorcycles.filter((b) => b.category === 'Cruiser'))}`;
  if (/adventure|touring|off.?road/.test(q)) return `Adventure bikes:\n${list(motorcycles.filter((b) => b.category === 'Adventure'))}`;
  if (/under|cheap|budget|price|cost/.test(q)) return `Our lineup:\n${list(motorcycles)}`;
  return `I'm having trouble reaching the AI service right now. Please try again shortly. In the meantime, our lineup includes:\n${list(motorcycles.slice(0, 4))}`;
}

/* ------------------------------------------------------------------ */
/* AI chatbot — OpenRouter (key) → Kilo Gateway (keyless, free)       */
/* ------------------------------------------------------------------ */

const inventorySummary = motorcycles.map(
  ({ id, name, brand, category, price, engine, power, topSpeed, stock, tag, colors }) => ({
    id, name, brand, category, price, engine, power, topSpeed, stock, tag, colors,
  })
);

const SYSTEM_PROMPT = `You are MotoBot, the enthusiastic and knowledgeable sales assistant for MotoVelocity, a premium motorcycle shop.

SHOP INVENTORY (JSON):
${JSON.stringify(inventorySummary)}

RULES:
- Recommend ONLY bikes from the inventory above. Never invent a model.
- Always show exact prices in USD using a $ sign.
- Keep replies short (max 120 words), friendly and conversational. Use an emoji occasionally.
- Never repeat the same phrasing twice in a row. Vary your wording, opening line and structure naturally like a real person.
- If asked about test rides, financing, ordering or delivery, say: call +1 (555) 010-MOTO or email ride@motovelocity.shop. Store hours Mon–Sat 9am–7pm.
- Customers can complete a purchase directly on the site using the cart and checkout buttons.
- Be honest if something isn't in stock. Offer the closest alternative.
- Help the visitor choose based on budget, experience and riding style.`;

const STYLE_NUDGES = [
  'Sound warm and welcoming, like a knowledgeable friend.',
  'Sound like an excited racing commentator who loves bikes.',
  'Sound calm, precise and expert — like a seasoned mechanic.',
  'Sound upbeat and playful, with a light joke if it fits.',
  'Sound like a calm concierge helping a VIP buyer.',
];

function systemForThisTurn() {
  const nudge = STYLE_NUDGES[Math.floor(Math.random() * STYLE_NUDGES.length)];
  return `${SYSTEM_PROMPT}\n\nTONE FOR THIS REPLY: ${nudge}`;
}

async function callOpenRouter(messages) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5173',
      'X-Title': 'MotoVelocity Shop',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: systemForThisTurn() }, ...messages],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 450,
    }),
    signal: AbortSignal.timeout(25000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `OpenRouter ${response.status}`);
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('Empty OpenRouter response');
  return { reply, model: data.model || MODEL };
}

async function callKilo(messages) {
  const response = await fetch(KILO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: KILO_MODEL,
      messages: [{ role: 'system', content: systemForThisTurn() }, ...messages],
      temperature: 1.1,
      top_p: 0.95,
      max_tokens: 450,
    }),
    signal: AbortSignal.timeout(30000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Kilo ${response.status}`);
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('Empty Kilo response');
  return { reply, model: data.model || KILO_MODEL };
}

async function callBlockRun(messages) {
  const response = await fetch(BLOCKRUN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: BLOCKRUN_MODEL,
      messages: [{ role: 'system', content: systemForThisTurn() }, ...messages],
      temperature: 1,
      max_tokens: 450,
    }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `BlockRun ${response.status}`);
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('Empty BlockRun response');
  return { reply, model: data.model || BLOCKRUN_MODEL };
}

app.get('/api/chat/status', (_req, res) => {
  res.json({
    available: true,
    provider: API_KEY ? 'openrouter' : 'kilo',
    model: API_KEY ? MODEL : KILO_MODEL,
    mode: 'ai',
  });
});

app.post('/api/chat', async (req, res) => {
  const raw = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = raw
    .filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (!messages.length) {
    return res.status(400).json({ error: 'A non-empty messages array is required.' });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const providers = [
    ...(API_KEY ? [{ name: 'openrouter', run: callOpenRouter }] : []),
    { name: 'kilo', run: callKilo },
    { name: 'blockrun', run: callBlockRun },
  ];

  for (const provider of providers) {
    try {
      const { reply, model } = await provider.run(messages);
      return res.json({ reply, mode: 'ai', provider: provider.name, model });
    } catch (error) {
      console.warn(`[chat] ${provider.name} failed:`, error.message);
    }
  }

  // Only if both real AI providers are unreachable.
  res.json({ reply: localAssistant(lastUser), mode: 'fallback', provider: 'local' });
});

/* ------------------------------------------------------------------ */
/* Serve the built React app in production                            */
/* ------------------------------------------------------------------ */

const distDir = path.resolve(__dirname, '..', 'client', 'dist');

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`\n🏍️  MotoVelocity API running at http://localhost:${PORT}`);
  console.log(`🤖  Chatbot: ${API_KEY ? `OpenRouter (${MODEL}) → Kilo fallback` : `Kilo Gateway (${KILO_MODEL}) — real AI, no key needed`}`);
  console.log(`🛒  Orders saved to ${ORDERS_FILE}\n`);
});
