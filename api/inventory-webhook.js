// api/inventory-webhook.js
// Webhook pour recevoir les mises à jour d'inventaire du détecteur

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data, timestamp } = req.body;
    console.log(`📨 Webhook reçu: ${type} à ${timestamp}`);
    
    // Validation basique
    if (!type || !data) {
      return res.status(400).json({ error: 'Type et données requis' });
    }

    let response;
    
    switch (type) {
      case 'gift_received':
        console.log(`🎁 Gift reçu: ${data.giftName} de ${data.fromUsername}`);
        response = {
          success: true,
          message: 'Gift reçu traité',
          action: 'gift_received',
          giftId: data.collectibleId,
          userId: data.fromUserId,
          username: data.fromUsername,
          timestamp: new Date().toISOString()
        };
        break;
        
      case 'gift_withdrawn':
        console.log(`🚫 Gift retiré: ${data.giftName} par ${data.toUsername}`);
        response = {
          success: true,
          message: 'Gift retiré traité',
          action: 'gift_withdrawn',
          giftId: data.collectibleId,
          userId: data.toUserId,
          username: data.toUsername,
          timestamp: new Date().toISOString()
        };
        break;
        
      case 'inventory_updated':
        console.log(`📦 Inventaire mis à jour pour ${data.userId}`);
        response = {
          success: true,
          message: 'Inventaire mis à jour',
          action: 'inventory_updated',
          userId: data.userId,
          timestamp: new Date().toISOString()
        };
        break;
        
      default:
        console.log(`❓ Type de webhook inconnu: ${type}`);
        response = {
          success: false,
          message: 'Type de webhook non reconnu',
          receivedType: type
        };
    }
    
    console.log('✅ Webhook traité avec succès:', response);
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      details: error.message 
    });
  }
}
