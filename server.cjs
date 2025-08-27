// server.js
// Serveur Express simple pour tester les APIs d'inventaire

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import des APIs
const realInventoryHandler = require('./api/real-inventory.js');
const inventoryWebhookHandler = require('./api/inventory-webhook.js');

// Routes API
app.get('/api/real-inventory', async (req, res) => {
  try {
    await realInventoryHandler(req, res);
  } catch (error) {
    console.error('❌ Erreur API real-inventory:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.post('/api/inventory-webhook', async (req, res) => {
  try {
    await inventoryWebhookHandler(req, res);
  } catch (error) {
    console.error('❌ Erreur API inventory-webhook:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.get('/api/inventory-webhook', async (req, res) => {
  try {
    await inventoryWebhookHandler(req, res);
  } catch (error) {
    console.error('❌ Erreur API inventory-webhook GET:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API Server is running!', 
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/real-inventory',
      'POST /api/inventory-webhook',
      'GET /api/inventory-webhook'
    ]
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
  console.log(`📡 Endpoints disponibles:`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/real-inventory`);
  console.log(`   POST /api/inventory-webhook`);
  console.log(`   GET  /api/inventory-webhook`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
});
