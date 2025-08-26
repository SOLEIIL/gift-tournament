// api/inventory-webhook.js
// API webhook pour recevoir les notifications du détecteur de gifts

export default async function handler(req, res) {
  // Accepter toutes les méthodes pour éviter les erreurs CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📨 Webhook reçu:', {
      method: req.method,
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // Accepter tous les types de webhooks sans vérification stricte
    const { type, data, timestamp, ...otherData } = req.body;
    
    // Log détaillé pour debug
    console.log('🔍 Données webhook analysées:', {
      type: type || 'unknown',
      data: data || 'no_data',
      timestamp: timestamp || 'no_timestamp',
      otherData: Object.keys(otherData).length > 0 ? otherData : 'none'
    });

    // Traitement basé sur le type
    let responseMessage = 'Webhook traité';
    
    switch (type) {
      case 'gift_received':
        console.log(`🎁 Gift reçu: ${data?.giftName || 'unknown'} de ${data?.fromUsername || 'unknown'}`);
        responseMessage = 'Gift reçu traité';
        break;
        
      case 'gift_withdrawn':
        console.log(`🚫 Gift retiré: ${data?.giftName || 'unknown'} par ${data?.toUsername || 'unknown'}`);
        responseMessage = 'Gift retiré traité';
        break;
        
      case 'inventory_updated':
        console.log(`📦 Inventaire mis à jour pour ${data?.userId || 'unknown'}`);
        responseMessage = 'Inventaire mis à jour';
        break;
        
      default:
        console.log(`❓ Type de webhook inconnu ou manquant: ${type || 'undefined'}`);
        responseMessage = 'Webhook traité (type non reconnu)';
    }

    // Réponse de succès
    res.status(200).json({
      success: true,
      message: responseMessage,
      received: {
        type: type || 'unknown',
        timestamp: timestamp || new Date().toISOString(),
        processed: true
      },
      serverTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    
    // Réponse d'erreur détaillée pour debug
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
