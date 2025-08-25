import express from 'express';
import cors from 'cors';
import https from 'https';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration du bot
const BOT_TOKEN = '7516841125:AAH_jkU6wLOEoApkwu8afeXbZr58bBqiIrU';

// Base de données simulée (en mémoire pour le développement)
const giftsDB = new Map();
const usersDB = new Map();

// Initialiser avec quelques données de test
function initializeTestData() {
  // Utilisateur de test
  usersDB.set(123456789, {
    id: 123456789,
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User'
  });

  // Gifts de test
  const testGifts = [
    { id: "gift_001", name: "Gift Box #001", image: "🎁", value: 5, rarity: "common", owner_id: 123456789 },
    { id: "gift_002", name: "Gift Box #002", image: "🎁", value: 8, rarity: "common", owner_id: 123456789 },
    { id: "gift_003", name: "Gift Box #003", image: "🎁", value: 12, rarity: "rare", owner_id: 123456789 },
    { id: "gift_004", name: "Gift Box #004", image: "🎁", value: 15, rarity: "rare", owner_id: 123456789 },
    { id: "gift_005", name: "Gift Box #005", image: "🎁", value: 20, rarity: "epic", owner_id: 123456789 },
  ];

  testGifts.forEach(gift => {
    giftsDB.set(gift.id, gift);
  });

  console.log('✅ Données de test initialisées');
}

// Fonction pour faire une requête à l'API Telegram
function makeTelegramRequest(method, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/${method}`,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Endpoint 1: getUserGifts - Récupérer l'inventaire des gifts
app.post('/bot:token/getUserGifts', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        ok: false,
        error_code: 400,
        description: "user_id is required"
      });
    }

    // Récupérer les gifts de l'utilisateur
    const userGifts = Array.from(giftsDB.values()).filter(gift => gift.owner_id === user_id);
    
    console.log(`📦 Récupération des gifts pour l'utilisateur ${user_id}: ${userGifts.length} gifts trouvés`);
    
    res.json({
      ok: true,
      result: userGifts.map(gift => ({
        id: gift.id,
        name: gift.name,
        image: gift.image,
        value: gift.value,
        rarity: gift.rarity,
        owner_id: gift.owner_id,
        transfer_date: gift.transfer_date || new Date().toISOString()
      }))
    });
  } catch (error) {
    console.error('❌ Erreur getUserGifts:', error);
    res.status(500).json({
      ok: false,
      error_code: 500,
      description: "Internal server error"
    });
  }
});

// Endpoint 2: sendGift - Transférer un gift
app.post('/bot:token/sendGift', async (req, res) => {
  try {
    const { from_user_id, to_user_id, gift_id } = req.body;
    
    if (!from_user_id || !to_user_id || !gift_id) {
      return res.status(400).json({
        ok: false,
        error_code: 400,
        description: "from_user_id, to_user_id, and gift_id are required"
      });
    }

    // Vérifier que l'utilisateur possède le gift
    const gift = giftsDB.get(gift_id);
    if (!gift || gift.owner_id !== from_user_id) {
      return res.json({
        ok: false,
        error_code: 400,
        description: "Gift not found or not owned by user"
      });
    }

    // Effectuer le transfert
    gift.owner_id = to_user_id;
    gift.transfer_date = new Date().toISOString();
    giftsDB.set(gift_id, gift);

    console.log(`🎁 Transfert du gift ${gift_id} de ${from_user_id} vers ${to_user_id}`);

    // Notifier les utilisateurs via Telegram (optionnel)
    try {
      await makeTelegramRequest('sendMessage', {
        chat_id: from_user_id,
        text: `Vous avez envoyé ${gift.name} (${gift.value} TON) à l'utilisateur ${to_user_id}`
      });
      
      await makeTelegramRequest('sendMessage', {
        chat_id: to_user_id,
        text: `Vous avez reçu ${gift.name} (${gift.value} TON) de l'utilisateur ${from_user_id}`
      });
    } catch (telegramError) {
      console.warn('⚠️ Impossible d\'envoyer les notifications Telegram:', telegramError.message);
    }

    res.json({
      ok: true,
      result: {
        success: true,
        gift_id,
        from_user_id,
        to_user_id,
        transfer_date: gift.transfer_date
      }
    });
  } catch (error) {
    console.error('❌ Erreur sendGift:', error);
    res.status(500).json({
      ok: false,
      error_code: 500,
      description: "Internal server error"
    });
  }
});

// Endpoint 3: canTransferGift - Vérifier si un gift peut être transféré
app.post('/bot:token/canTransferGift', async (req, res) => {
  try {
    const { user_id, gift_id } = req.body;
    
    if (!user_id || !gift_id) {
      return res.status(400).json({
        ok: false,
        error_code: 400,
        description: "user_id and gift_id are required"
      });
    }

    // Vérifier la propriété
    const gift = giftsDB.get(gift_id);
    if (!gift || gift.owner_id !== user_id) {
      return res.json({
        ok: true,
        result: {
          can_transfer: false,
          reason: "Gift not owned by user",
          cooldown_remaining: 0
        }
      });
    }

    // Vérifier le délai de transfert (simulation)
    const transferCooldown = 24 * 60 * 60 * 1000; // 24 heures
    const lastTransfer = gift.transfer_date ? new Date(gift.transfer_date).getTime() : 0;
    const now = Date.now();
    const cooldownRemaining = Math.max(0, transferCooldown - (now - lastTransfer));

    if (cooldownRemaining > 0) {
      return res.json({
        ok: true,
        result: {
          can_transfer: false,
          reason: "Transfer cooldown active",
          cooldown_remaining: Math.ceil(cooldownRemaining / 1000) // en secondes
        }
      });
    }

    res.json({
      ok: true,
      result: {
        can_transfer: true,
        reason: null,
        cooldown_remaining: 0
      }
    });
  } catch (error) {
    console.error('❌ Erreur canTransferGift:', error);
    res.status(500).json({
      ok: false,
      error_code: 500,
      description: "Internal server error"
    });
  }
});

// Endpoint de test pour ajouter des gifts
app.post('/api/addGift', (req, res) => {
  try {
    const { user_id, gift } = req.body;
    
    if (!user_id || !gift) {
      return res.status(400).json({ error: "user_id and gift are required" });
    }

    const giftId = `gift_${Date.now()}`;
    const newGift = {
      id: giftId,
      name: gift.name || `Gift Box #${giftId}`,
      image: gift.image || "🎁",
      value: gift.value || 5,
      rarity: gift.rarity || "common",
      owner_id: user_id,
      transfer_date: new Date().toISOString()
    };

    giftsDB.set(giftId, newGift);
    
    console.log(`➕ Nouveau gift ajouté: ${giftId} pour l'utilisateur ${user_id}`);
    
    res.json({ success: true, gift: newGift });
  } catch (error) {
    console.error('❌ Erreur addGift:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint pour lister tous les gifts (debug)
app.get('/api/gifts', (req, res) => {
  const gifts = Array.from(giftsDB.values());
  res.json({ gifts });
});

// Endpoint pour lister tous les utilisateurs (debug)
app.get('/api/users', (req, res) => {
  const users = Array.from(usersDB.values());
  res.json({ users });
});

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🤖 Serveur Gift Tournament Bot API',
    version: '1.0.0',
    endpoints: {
      'getUserGifts': 'POST /bot:token/getUserGifts',
      'sendGift': 'POST /bot:token/sendGift',
      'canTransferGift': 'POST /bot:token/canTransferGift',
      'addGift': 'POST /api/addGift',
      'listGifts': 'GET /api/gifts',
      'listUsers': 'GET /api/users'
    }
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}`);
  console.log(`🤖 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
  
  // Initialiser les données de test
  initializeTestData();
  
  console.log('\n📋 Endpoints disponibles:');
  console.log(`   GET  http://localhost:${PORT}/ - Informations de l'API`);
  console.log(`   POST http://localhost:${PORT}/bot:token/getUserGifts - Récupérer les gifts`);
  console.log(`   POST http://localhost:${PORT}/bot:token/sendGift - Transférer un gift`);
  console.log(`   POST http://localhost:${PORT}/bot:token/canTransferGift - Vérifier le transfert`);
  console.log(`   POST http://localhost:${PORT}/api/addGift - Ajouter un gift (test)`);
  console.log(`   GET  http://localhost:${PORT}/api/gifts - Lister tous les gifts`);
  console.log(`   GET  http://localhost:${PORT}/api/users - Lister tous les utilisateurs`);
  
  console.log('\n✅ Serveur prêt pour l\'intégration avec l\'application frontend!');
});
