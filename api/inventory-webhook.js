// api/inventory-webhook.js
import { InventoryManager } from '../../lib/supabase.js';

// Configuration sécurisée
const INVENTORY_CONFIG = {
  apiKey: process.env.INVENTORY_API_KEY || 'inventory-secure-key-2024',
  webhookSecret: process.env.WEBHOOK_SECRET || 'wxyz-webhook-secret-2024'
};

// Middleware de vérification de signature
const verifyWebhookSignature = (req, res, next) => {
  try {
    const signature = req.headers['x-telegram-signature'];
    const timestamp = req.headers['x-telegram-timestamp'];
    const body = JSON.stringify(req.body);
    
    if (!signature || !timestamp) {
      return res.status(401).json({ 
        error: 'Signature ou timestamp manquant',
        code: 'MISSING_HEADERS'
      });
    }

    // Vérifier que le timestamp n'est pas trop ancien (5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      return res.status(401).json({ 
        error: 'Timestamp expiré',
        code: 'EXPIRED_TIMESTAMP'
      });
    }

    // Générer la signature attendue
    const expectedSignature = generateSignature(body, timestamp);
    
    if (signature !== expectedSignature) {
      console.error('❌ Signature webhook invalide:', {
        received: signature,
        expected: expectedSignature,
        body: body.substring(0, 100) + '...',
        timestamp
      });
      
      return res.status(401).json({ 
        error: 'Signature invalide',
        code: 'INVALID_SIGNATURE'
      });
    }
    
    // Signature valide, continuer
    next();
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de signature:', error);
    return res.status(500).json({ 
      error: 'Erreur de vérification',
      code: 'VERIFICATION_ERROR'
    });
  }
};

// Générer une signature sécurisée
const generateSignature = (body, timestamp) => {
  const crypto = require('crypto');
  const payload = body + timestamp + INVENTORY_CONFIG.webhookSecret;
  return crypto.createHmac('sha256', INVENTORY_CONFIG.webhookSecret)
    .update(payload)
    .digest('hex');
};

// Gérer un gift reçu (dépôt)
const handleGiftReceived = async (giftData) => {
  try {
    console.log(`🎁 Gift reçu: ${giftData.giftName} de @${giftData.fromUsername}`);
    
    // Extraire les données nécessaires
    const {
      fromUserId,
      fromUsername,
      fromFirstName,
      fromLastName,
      giftId,
      giftName,
      collectibleId,
      collectibleModel,
      collectibleBackdrop,
      collectibleSymbol,
      giftValue,
      telegramMessageId
    } = giftData;
    
    // 1. Créer ou récupérer l'utilisateur
    const user = await InventoryManager.getOrCreateUser({
      telegram_id: fromUserId,
      telegram_username: fromUsername,
      telegram_first_name: fromFirstName,
      telegram_last_name: fromLastName
    });
    
    console.log(`✅ Utilisateur géré: ${user.telegram_username} (ID: ${user.id})`);
    
    // 2. Créer ou récupérer le gift
    const gift = await InventoryManager.getOrCreateGift({
      giftId,
      giftName,
      collectibleId,
      collectibleModel,
      collectibleBackdrop,
      collectibleSymbol,
      giftValue
    });
    
    console.log(`✅ Gift géré: ${gift.gift_name} (ID: ${gift.id})`);
    
    // 3. Ajouter à l'inventaire de l'utilisateur
    const inventoryItem = await InventoryManager.addToInventory(
      user.id, 
      gift.id, 
      telegramMessageId
    );
    
    console.log(`✅ Gift ajouté à l'inventaire de @${user.telegram_username}`);
    
    return {
      success: true,
      userId: user.id,
      giftId: gift.id,
      inventoryId: inventoryItem.id,
      message: `Gift ${giftName} ajouté à l'inventaire de @${user.telegram_username}`
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du traitement du gift reçu:', error);
    throw error;
  }
};

// Gérer un gift retiré (withdraw)
const handleGiftWithdrawn = async (giftData) => {
  try {
    console.log(`🚫 Gift retiré: ${giftData.giftName} vers @${giftData.toUsername}`);
    
    // Extraire les données nécessaires
    const {
      toUserId,
      toUsername,
      toFirstName,
      toLastName,
      giftId,
      giftName,
      collectibleId,
      collectibleModel,
      collectibleBackdrop,
      collectibleSymbol,
      giftValue,
      telegramMessageId
    } = giftData;
    
    // 1. Créer ou récupérer l'utilisateur
    const user = await InventoryManager.getOrCreateUser({
      telegram_id: toUserId,
      telegram_username: toUsername,
      telegram_first_name: toFirstName,
      telegram_last_name: toLastName
    });
    
    console.log(`✅ Utilisateur géré: ${user.telegram_username} (ID: ${user.id})`);
    
    // 2. Créer ou récupérer le gift
    const gift = await InventoryManager.getOrCreateGift({
      giftId,
      giftName,
      collectibleId,
      collectibleModel,
      collectibleBackdrop,
      collectibleSymbol,
      giftValue
    });
    
    console.log(`✅ Gift géré: ${gift.gift_name} (ID: ${gift.id})`);
    
    // 3. Retirer de l'inventaire de l'utilisateur
    const inventoryItem = await InventoryManager.removeFromInventory(
      user.id, 
      gift.id, 
      telegramMessageId
    );
    
    console.log(`✅ Gift retiré de l'inventaire de @${user.telegram_username}`);
    
    return {
      success: true,
      userId: user.id,
      giftId: gift.id,
      inventoryId: inventoryItem.id,
      message: `Gift ${giftName} retiré de l'inventaire de @${user.telegram_username}`
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du traitement du gift retiré:', error);
    throw error;
  }
};

// API endpoint principal
export default async function handler(req, res) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  
  try {
    // Vérifier la signature du webhook
    verifyWebhookSignature(req, res, async () => {
      const { event, data } = req.body;
      
      console.log(`📨 Webhook reçu: ${event}`);
      
      let result;
      
      switch (event) {
        case 'transfer_received':
          result = await handleGiftReceived(data);
          break;
          
        case 'gift_withdrawn':
          result = await handleGiftWithdrawn(data);
          break;
          
        default:
          return res.status(400).json({ 
            error: 'Événement non reconnu',
            code: 'UNKNOWN_EVENT',
            event 
          });
      }
      
      console.log(`✅ Événement traité avec succès: ${event}`);
      
      return res.status(200).json({
        success: true,
        event,
        result,
        timestamp: new Date().toISOString()
      });
      
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);
    
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
}
