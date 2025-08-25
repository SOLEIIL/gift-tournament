// api/deposit-webhook.js
import crypto from 'crypto';

// Configuration sécurisée
const DEPOSIT_CONFIG = {
  depositAccountUsername: 'WxyzCrypto',
  apiKey: process.env.DEPOSIT_API_KEY || 'wxyz-crypto-secure-key-2024',
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
  const payload = body + timestamp + DEPOSIT_CONFIG.webhookSecret;
  return crypto.createHmac('sha256', DEPOSIT_CONFIG.apiKey)
    .update(payload)
    .digest('hex');
};

// Gérer un transfert reçu
const handleTransferReceived = async (transfer) => {
  try {
    console.log(`📥 Transfert reçu: ${transfer.giftName} de @${transfer.fromUsername}`);
    
    // Vérifier que le transfert est valide
    if (!transfer.giftId || !transfer.fromUserId || !transfer.giftValue) {
      throw new Error('Données de transfert incomplètes');
    }
    
    // Vérifier les limites de valeur
    if (transfer.giftValue < DEPOSIT_CONFIG.minTransferValue || 
        transfer.giftValue > DEPOSIT_CONFIG.maxTransferValue) {
      throw new Error(`Valeur du gift hors limites: ${transfer.giftValue} TON`);
    }
    
    // TODO: Sauvegarder en base de données
    // TODO: Notifier l'utilisateur
    
    return { success: true, transferId: transfer.id };
  } catch (error) {
    console.error('❌ Erreur lors du traitement du transfert reçu:', error);
    throw error;
  }
};

// Gérer un transfert confirmé
const handleTransferConfirmed = async (transfer) => {
  try {
    console.log(`✅ Transfert confirmé: ${transfer.giftName} de @${transfer.fromUsername}`);
    
    // TODO: Mettre à jour le statut en base
    // TODO: Ajouter le gift à l'inventaire
    // TODO: Notifier l'utilisateur
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur lors de la confirmation du transfert:', error);
    throw error;
  }
};

// Gérer un transfert échoué
const handleTransferFailed = async (transfer) => {
  try {
    console.log(`❌ Transfert échoué: ${transfer.giftName} de @${transfer.fromUsername}`);
    
    // TODO: Mettre à jour le statut en base
    // TODO: Notifier l'utilisateur
    // TODO: Logger l'erreur pour investigation
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur lors du traitement de l\'échec:', error);
    throw error;
  }
};

// Endpoint principal du webhook
export default async function handler(req, res) {
  // Seulement accepter les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Méthode non autorisée',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    // Vérifier la signature du webhook
    verifyWebhookSignature(req, res, async () => {
      const { type, data } = req.body;
      
      console.log(`📨 Webhook reçu: ${type}`, {
        fromUser: data?.fromUsername,
        giftName: data?.giftName,
        giftValue: data?.giftValue,
        timestamp: new Date().toISOString()
      });
      
      let result;
      
      switch (type) {
        case 'transfer_received':
          result = await handleTransferReceived(data);
          break;
        case 'transfer_confirmed':
          result = await handleTransferConfirmed(data);
          break;
        case 'transfer_failed':
          result = await handleTransferFailed(data);
          break;
        default:
          return res.status(400).json({ 
            error: 'Type de webhook non reconnu',
            code: 'UNKNOWN_WEBHOOK_TYPE',
            receivedType: type
          });
      }
      
      res.status(200).json({ 
        success: true, 
        message: `Webhook ${type} traité avec succès`,
        result 
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
}
