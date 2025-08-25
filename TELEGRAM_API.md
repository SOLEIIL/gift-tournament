# Telegram Bot API Integration

Ce document explique comment implémenter les endpoints de l'API Telegram nécessaires pour l'application Gift Tournament.

## 🔧 Configuration du Bot

### 1. Créer un Bot Telegram

1. Contactez [@BotFather](https://t.me/botfather) sur Telegram
2. Utilisez la commande `/newbot`
3. Suivez les instructions pour créer votre bot
4. Sauvegardez le token du bot fourni

### 2. Configurer les Webhooks (optionnel)

Pour recevoir des mises à jour en temps réel, configurez un webhook :

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook"}'
```

## 📡 Endpoints Requis

L'application s'attend à ce que votre bot implémente les endpoints suivants :

### 1. `getUserGifts` - Récupérer l'inventaire des gifts

**Endpoint:** `POST /bot<token>/getUserGifts`

**Payload:**
```json
{
  "user_id": 123456789
}
```

**Réponse attendue:**
```json
{
  "ok": true,
  "result": [
    {
      "id": "gift_001",
      "name": "Gift Box #001",
      "image": "🎁",
      "value": 5,
      "rarity": "common",
      "owner_id": 123456789,
      "transfer_date": "2024-01-15T10:30:00Z"
    },
    {
      "id": "gift_002",
      "name": "Gift Box #002",
      "image": "🎁",
      "value": 12,
      "rarity": "rare",
      "owner_id": 123456789,
      "transfer_date": "2024-01-15T11:45:00Z"
    }
  ]
}
```

**Implémentation côté serveur (Node.js/Express):**

```javascript
app.post('/bot:token/getUserGifts', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    // Récupérer les gifts de l'utilisateur depuis votre base de données
    const userGifts = await GiftModel.find({ owner_id: user_id });
    
    res.json({
      ok: true,
      result: userGifts.map(gift => ({
        id: gift.id,
        name: gift.name,
        image: gift.image,
        value: gift.value,
        rarity: gift.rarity,
        owner_id: gift.owner_id,
        transfer_date: gift.transfer_date
      }))
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error_code: 500,
      description: "Internal server error"
    });
  }
});
```

### 2. `sendGift` - Transférer un gift

**Endpoint:** `POST /bot<token>/sendGift`

**Payload:**
```json
{
  "from_user_id": 123456789,
  "to_user_id": 987654321,
  "gift_id": "gift_001"
}
```

**Réponse attendue:**
```json
{
  "ok": true,
  "result": {
    "success": true,
    "gift_id": "gift_001",
    "from_user_id": 123456789,
    "to_user_id": 987654321,
    "transfer_date": "2024-01-15T12:00:00Z"
  }
}
```

**Implémentation côté serveur:**

```javascript
app.post('/bot:token/sendGift', async (req, res) => {
  try {
    const { from_user_id, to_user_id, gift_id } = req.body;
    
    // Vérifier que l'utilisateur possède le gift
    const gift = await GiftModel.findOne({ 
      id: gift_id, 
      owner_id: from_user_id 
    });
    
    if (!gift) {
      return res.json({
        ok: false,
        error_code: 400,
        description: "Gift not found or not owned by user"
      });
    }
    
    // Vérifier les règles de transfert
    const canTransfer = await checkTransferRules(from_user_id, gift_id);
    if (!canTransfer) {
      return res.json({
        ok: false,
        error_code: 400,
        description: "Transfer not allowed"
      });
    }
    
    // Effectuer le transfert
    await GiftModel.updateOne(
      { id: gift_id },
      { 
        owner_id: to_user_id,
        transfer_date: new Date()
      }
    );
    
    // Notifier les utilisateurs
    await notifyUsers(from_user_id, to_user_id, gift);
    
    res.json({
      ok: true,
      result: {
        success: true,
        gift_id,
        from_user_id,
        to_user_id,
        transfer_date: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error_code: 500,
      description: "Internal server error"
    });
  }
});
```

### 3. `canTransferGift` - Vérifier si un gift peut être transféré

**Endpoint:** `POST /bot<token>/canTransferGift`

**Payload:**
```json
{
  "user_id": 123456789,
  "gift_id": "gift_001"
}
```

**Réponse attendue:**
```json
{
  "ok": true,
  "result": {
    "can_transfer": true,
    "reason": null,
    "cooldown_remaining": 0
  }
}
```

**Implémentation côté serveur:**

```javascript
app.post('/bot:token/canTransferGift', async (req, res) => {
  try {
    const { user_id, gift_id } = req.body;
    
    // Vérifier la propriété
    const gift = await GiftModel.findOne({ 
      id: gift_id, 
      owner_id: user_id 
    });
    
    if (!gift) {
      return res.json({
        ok: true,
        result: {
          can_transfer: false,
          reason: "Gift not owned by user",
          cooldown_remaining: 0
        }
      });
    }
    
    // Vérifier le délai de transfert
    const cooldownRemaining = await checkTransferCooldown(user_id, gift_id);
    
    if (cooldownRemaining > 0) {
      return res.json({
        ok: true,
        result: {
          can_transfer: false,
          reason: "Transfer cooldown active",
          cooldown_remaining: cooldownRemaining
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
    res.status(500).json({
      ok: false,
      error_code: 500,
      description: "Internal server error"
    });
  }
});
```

## 🗄️ Structure de Base de Données

### Table `gifts`

```sql
CREATE TABLE gifts (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(50) NOT NULL,
  value INTEGER NOT NULL,
  rarity ENUM('common', 'rare', 'epic', 'legendary') NOT NULL,
  owner_id BIGINT NOT NULL,
  transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_owner_id (owner_id),
  INDEX idx_rarity (rarity),
  INDEX idx_value (value)
);
```

### Table `users`

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(255),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  language_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table `transfers`

```sql
CREATE TABLE transfers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  gift_id VARCHAR(255) NOT NULL,
  from_user_id BIGINT NOT NULL,
  to_user_id BIGINT NOT NULL,
  transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (gift_id) REFERENCES gifts(id),
  INDEX idx_gift_id (gift_id),
  INDEX idx_from_user (from_user_id),
  INDEX idx_to_user (to_user_id)
);
```

## 🔒 Sécurité

### Validation des Données

1. **Authentification:** Vérifiez que les requêtes proviennent de votre application
2. **Autorisation:** Vérifiez que l'utilisateur possède les gifts qu'il tente de transférer
3. **Rate Limiting:** Limitez le nombre de requêtes par utilisateur
4. **Validation:** Validez tous les paramètres d'entrée

### Exemple de Middleware de Sécurité

```javascript
const validateRequest = (req, res, next) => {
  const { user_id, gift_id } = req.body;
  
  // Validation des paramètres
  if (!user_id || !gift_id) {
    return res.status(400).json({
      ok: false,
      error_code: 400,
      description: "Missing required parameters"
    });
  }
  
  // Validation du format
  if (typeof user_id !== 'number' || typeof gift_id !== 'string') {
    return res.status(400).json({
      ok: false,
      error_code: 400,
      description: "Invalid parameter types"
    });
  }
  
  next();
};

// Utilisation
app.post('/bot:token/sendGift', validateRequest, async (req, res) => {
  // Logique du endpoint
});
```

## 🚀 Déploiement

### Variables d'Environnement

```bash
# Configuration du bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gift_tournament
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Sécurité
JWT_SECRET=your_jwt_secret
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuration Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /bot {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📝 Tests

### Tests d'Intégration

```javascript
describe('Telegram Bot API', () => {
  test('should get user gifts', async () => {
    const response = await request(app)
      .post('/bot/test-token/getUserGifts')
      .send({ user_id: 123456789 })
      .expect(200);
    
    expect(response.body.ok).toBe(true);
    expect(Array.isArray(response.body.result)).toBe(true);
  });
  
  test('should send gift', async () => {
    const response = await request(app)
      .post('/bot/test-token/sendGift')
      .send({
        from_user_id: 123456789,
        to_user_id: 987654321,
        gift_id: 'gift_001'
      })
      .expect(200);
    
    expect(response.body.ok).toBe(true);
    expect(response.body.result.success).toBe(true);
  });
});
```

## 🔍 Monitoring

### Logs Recommandés

```javascript
const logger = require('winston');

// Log des transferts
logger.info('Gift transfer', {
  gift_id: giftId,
  from_user: fromUserId,
  to_user: toUserId,
  timestamp: new Date()
});

// Log des erreurs
logger.error('Transfer failed', {
  error: error.message,
  gift_id: giftId,
  user_id: userId,
  timestamp: new Date()
});
```

### Métriques

- Nombre de gifts transférés par jour
- Temps de réponse des endpoints
- Taux d'erreur par endpoint
- Utilisateurs actifs par jour

Cette documentation vous fournit tous les éléments nécessaires pour implémenter l'API Telegram côté serveur et intégrer votre application Gift Tournament avec Telegram.
