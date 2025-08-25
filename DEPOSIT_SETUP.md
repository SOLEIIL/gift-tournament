# 🎁 Guide de Configuration du Système de Dépôt de Gifts

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer un compte Telegram dédié comme "compte de dépôt" pour gérer automatiquement les transferts de gifts de vos utilisateurs.

## 🎯 Fonctionnement

1. **Compte de dépôt** : Un compte Telegram dédié qui reçoit les gifts
2. **Webhooks** : Détection automatique des transferts reçus
3. **Inventaire automatique** : Ajout automatique des gifts à l'inventaire de l'utilisateur
4. **Notifications** : Confirmation automatique aux utilisateurs

## 🔧 Configuration du Compte de Dépôt

### Étape 1 : Créer le Compte Telegram

1. **Créer un nouveau compte Telegram**
   - Utilisez un numéro de téléphone dédié
   - Choisissez un nom d'utilisateur clair (ex: `gifts_deposit_bot`)
   - Configurez une photo de profil appropriée

2. **Sécuriser le compte**
   - Activez l'authentification à deux facteurs
   - Utilisez un mot de passe fort
   - Sauvegardez les codes de récupération

### Étape 2 : Configuration de l'API Telegram

1. **Obtenir les clés API**
   ```bash
   # Contactez @BotFather pour obtenir les clés
   # Vous aurez besoin de :
   # - API_ID
   # - API_HASH
   # - BOT_TOKEN (si vous utilisez un bot)
   ```

2. **Configurer les webhooks**
   ```javascript
   // Dans votre configuration
   const DEPOSIT_CONFIG = {
     depositAccountUsername: 'votre_username_deposit',
     depositAccountPhone: '+votre_numero_telephone',
     webhookUrl: 'https://votre-domaine.com/api/deposit-webhook',
     apiKey: 'votre-cle-secrete',
     minTransferValue: 1,
     maxTransferValue: 10000,
     autoConfirm: true,
     confirmationDelay: 30
   };
   ```

## 🚀 Mise en Place Technique

### 1. Backend API (Node.js/Express)

```javascript
// api/deposit-webhook.js
const express = require('express');
const router = express.Router();

// Middleware de vérification de signature
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-telegram-signature'];
  const expectedSignature = generateSignature(req.body, req.headers['x-telegram-timestamp']);
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Signature invalide' });
  }
  
  next();
};

// Endpoint webhook pour recevoir les transferts
router.post('/deposit-webhook', verifyWebhookSignature, async (req, res) => {
  try {
    const { type, data } = req.body;
    
    switch (type) {
      case 'transfer_received':
        await handleTransferReceived(data);
        break;
      case 'transfer_confirmed':
        await handleTransferConfirmed(data);
        break;
      case 'transfer_failed':
        await handleTransferFailed(data);
        break;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

module.exports = router;
```

### 2. Service de Détection des Transferts

```javascript
// services/telegramMonitor.js
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

class TelegramMonitor {
  constructor(config) {
    this.client = new TelegramClient(
      new StringSession(config.sessionString),
      config.apiId,
      config.apiHash
    );
  }

  async start() {
    await this.client.start();
    console.log('✅ Moniteur Telegram démarré');
    
    // Écouter les nouveaux messages
    this.client.addEventHandler(this.handleNewMessage.bind(this));
  }

  async handleNewMessage(event) {
    const message = event.message;
    
    // Vérifier si c'est un transfert de gift
    if (this.isGiftTransfer(message)) {
      await this.processGiftTransfer(message);
    }
  }

  isGiftTransfer(message) {
    // Logique pour détecter un transfert de gift
    return message.media && message.media.className === 'MessageMediaDocument';
  }

  async processGiftTransfer(message) {
    const transfer = {
      id: generateTransferId(),
      fromUserId: message.senderId.toString(),
      fromUsername: message.sender.username,
      toDepositAccount: this.config.depositAccountUsername,
      giftId: message.media.document.id.toString(),
      giftName: this.extractGiftName(message.media.document),
      giftValue: this.extractGiftValue(message.media.document),
      timestamp: new Date(message.date * 1000),
      status: 'pending',
      telegramMessageId: message.id
    };

    // Envoyer au webhook
    await this.sendWebhook('transfer_received', transfer);
  }
}
```

### 3. Base de Données

```sql
-- Table des transferts
CREATE TABLE deposit_transfers (
  id VARCHAR(255) PRIMARY KEY,
  from_user_id VARCHAR(255) NOT NULL,
  from_username VARCHAR(255) NOT NULL,
  to_deposit_account VARCHAR(255) NOT NULL,
  gift_id VARCHAR(255) NOT NULL,
  gift_name VARCHAR(255) NOT NULL,
  gift_value DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  status ENUM('pending', 'confirmed', 'failed', 'processed') NOT NULL,
  transaction_hash VARCHAR(255),
  telegram_message_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des inventaires utilisateurs
CREATE TABLE user_inventories (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  total_value DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des gifts
CREATE TABLE user_gifts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  gift_name VARCHAR(255) NOT NULL,
  gift_value DECIMAL(10,2) NOT NULL,
  rarity ENUM('common', 'rare', 'epic', 'legendary') NOT NULL,
  deposit_date TIMESTAMP NOT NULL,
  transfer_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_inventories(user_id),
  FOREIGN KEY (transfer_id) REFERENCES deposit_transfers(id)
);
```

## 🔒 Sécurité

### 1. Vérification des Transferts

```javascript
// Vérifier l'authenticité d'un transfert
const verifyTransfer = async (transfer) => {
  // Vérifier que le message vient bien du bon utilisateur
  const message = await client.getMessages(transfer.telegramMessageId);
  
  if (!message || message.senderId.toString() !== transfer.fromUserId) {
    throw new Error('Transfert invalide');
  }
  
  // Vérifier que le gift n'a pas déjà été traité
  const existingTransfer = await db.depositTransfers.findByGiftId(transfer.giftId);
  if (existingTransfer) {
    throw new Error('Gift déjà traité');
  }
  
  return true;
};
```

### 2. Protection contre les Doublons

```javascript
// Empêcher les doublons
const preventDuplicateTransfers = async (transfer) => {
  const existing = await db.depositTransfers.findOne({
    where: {
      gift_id: transfer.giftId,
      from_user_id: transfer.fromUserId,
      status: ['pending', 'confirmed', 'processed']
    }
  });
  
  if (existing) {
    throw new Error('Transfert en double détecté');
  }
};
```

## 📱 Interface Utilisateur

### 1. Instructions de Dépôt

Le composant `DepositInstructions` guide l'utilisateur :
- Ouvrir Telegram
- Contacter le compte de dépôt
- Envoyer le gift
- Attendre la confirmation

### 2. Notifications

```javascript
// Notifier l'utilisateur
const notifyUser = async (userId, event, transfer) => {
  const messages = {
    transfer_received: `📥 Votre transfert de ${transfer.giftName} a été reçu et est en cours de traitement...`,
    transfer_confirmed: `✅ Votre ${transfer.giftName} a été ajouté à votre inventaire !`,
    transfer_failed: `❌ Le transfert de ${transfer.giftName} a échoué. Veuillez réessayer.`
  };

  // Envoyer via Telegram Bot API ou Mini App
  await sendTelegramMessage(userId, messages[event]);
};
```

## 🚀 Déploiement

### 1. Variables d'Environnement

```bash
# .env
TELEGRAM_API_ID=votre_api_id
TELEGRAM_API_HASH=votre_api_hash
TELEGRAM_SESSION_STRING=votre_session_string
DEPOSIT_ACCOUNT_USERNAME=votre_username_deposit
DEPOSIT_ACCOUNT_PHONE=votre_numero_telephone
WEBHOOK_SECRET=votre_secret_webhook
DATABASE_URL=votre_url_base_de_donnees
```

### 2. Script de Démarrage

```javascript
// start-deposit-service.js
const TelegramMonitor = require('./services/telegramMonitor');
const DepositService = require('./services/depositService');

async function startDepositService() {
  try {
    // Démarrer le moniteur Telegram
    const monitor = new TelegramMonitor(config);
    await monitor.start();
    
    // Initialiser le service de dépôt
    const depositService = new DepositService(config);
    await depositService.initialize();
    
    console.log('🚀 Service de dépôt démarré avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error);
    process.exit(1);
  }
}

startDepositService();
```

## 🔍 Monitoring et Logs

### 1. Logs de Transferts

```javascript
// Logger les transferts
const logTransfer = (transfer, action) => {
  console.log(`[${new Date().toISOString()}] ${action}:`, {
    transferId: transfer.id,
    fromUser: transfer.fromUsername,
    giftName: transfer.giftName,
    giftValue: transfer.giftValue,
    status: transfer.status
  });
};
```

### 2. Métriques

```javascript
// Statistiques du compte de dépôt
const getDepositStats = async () => {
  const stats = await db.depositTransfers.aggregate([
    {
      $group: {
        _id: null,
        totalTransfers: { $sum: 1 },
        totalValue: { $sum: '$gift_value' },
        pendingTransfers: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0];
};
```

## 🎯 Prochaines Étapes

1. **Configurer le compte de dépôt** avec vos vraies informations
2. **Déployer le backend** sur votre serveur
3. **Tester avec de petits transferts** avant la production
4. **Configurer les alertes** pour les transferts échoués
5. **Mettre en place le monitoring** en temps réel

## 📞 Support

Pour toute question ou problème :
- Vérifiez les logs du service
- Testez avec des transferts de faible valeur
- Contactez l'équipe technique

---

**⚠️ Important** : Ce système gère de l'argent réel. Testez exhaustivement avant la mise en production !
