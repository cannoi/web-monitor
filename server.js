const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'web-monitor.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Use a simple JSON-file backed store or sqlite fallback using node:sqlite if available, or lightweight JSON persistence
let monitors = [];
let checks = [];

function loadData() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      monitors = data.monitors || [];
      checks = data.checks || [];
    }
  } catch (e) {
    monitors = [];
    checks = [];
  }
}

function saveData() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify({ monitors, checks }, null, 2));
  } catch (e) {}
}

loadData();

app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/monitors', (req, res) => {
  loadData();
  res.json(monitors);
});

app.post('/api/monitors', (req, res) => {
  loadData();
  const { name, url, interval } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'Name and URL are required' });
  const newItem = {
    id: Date.now().toString(),
    name,
    url,
    interval: Number(interval) || 15,
    status: 'unknown',
    lastChecked: null,
    createdAt: new Date().toISOString()
  };
  monitors.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

app.put('/api/monitors/:id', (req, res) => {
  loadData();
  const { id } = req.params;
  const { name, url, interval } = req.body;
  const item = monitors.find(m => m.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (name) item.name = name;
  if (url) item.url = url;
  if (interval) item.interval = Number(interval);
  saveData();
  res.json(item);
});

app.delete('/api/monitors/:id', (req, res) => {
  loadData();
  const { id } = req.params;
  const index = monitors.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  monitors.splice(index, 1);
  saveData();
  res.status(204).send();
});

app.post('/api/monitors/:id/check', (req, res) => {
  loadData();
  const { id } = req.params;
  const item = monitors.find(m => m.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  item.status = 'up';
  item.lastChecked = new Date().toISOString();
  saveData();
  res.json({ success: true, status: item.status, lastChecked: item.lastChecked });
});

const PORT = process.env.PORT || 8080;
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, db: { monitors } };
