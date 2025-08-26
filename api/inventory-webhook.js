// api/inventory-webhook.js
// Version ultra-simplifiée sans aucune dépendance

export default function handler(req, res) {
  try {
    console.log('🎁 INVENTORY-WEBHOOK V2 - Version ultra-simplifiée');
    console.log('📊 Méthode:', req.method);
    console.log('📋 Headers reçus:', Object.keys(req.headers));
    console.log('📄 Body présent:', !!req.body);
    
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Méthode non autorisée',
        version: 'V2-ultra-simple',
        timestamp: new Date().toISOString()
      });
    }

    // Vérification basique des headers
    const signature = req.headers['x-telegram-signature'];
    const timestamp = req.headers['x-telegram-timestamp'];
    
    if (!signature || !timestamp) {
      console.log('❌ Headers manquants - signature ou timestamp');
      return res.status(401).json({ 
        error: 'Headers manquants',
        version: 'V2-ultra-simple',
        required: ['x-telegram-signature', 'x-telegram-timestamp']
      });
    }

    console.log('✅ Headers validés');
    console.log('📊 Données reçues:', JSON.stringify(req.body, null, 2));

    // Traitement des événements
    const { event, data } = req.body;
    
    if (event === 'transfer_received') {
      console.log('🎁 DÉPÔT DÉTECTÉ:', data.giftName);
      console.log('👤 Utilisateur:', data.fromUsername);
      
      // Simulation de traitement d'inventaire
      const inventoryUpdate = {
        action: 'add_to_inventory',
        user: data.fromUsername,
        gift: data.giftName,
        collectibleId: data.collectibleId,
        giftValue: data.giftValue,
        timestamp: new Date().toISOString(),
        status: 'success',
        version: 'V2-ultra-simple'
      };
      
      console.log('📊 Mise à jour inventaire:', inventoryUpdate);
      
      return res.status(200).json({
        success: true,
        message: 'Gift ajouté à l\'inventaire - V2',
        inventoryUpdate,
        version: 'V2-ultra-simple'
      });
      
    } else if (event === 'gift_withdrawn') {
      console.log('🚫 WITHDRAW DÉTECTÉ:', data.giftName);
      console.log('👤 Utilisateur:', data.toUsername);
      
      // Simulation de traitement d'inventaire
      const inventoryUpdate = {
        action: 'remove_from_inventory',
        user: data.toUsername,
        gift: data.giftName,
        collectibleId: data.collectibleId,
        giftValue: data.giftValue,
        timestamp: new Date().toISOString(),
        status: 'success',
        version: 'V2-ultra-simple'
      };
      
      console.log('📊 Mise à jour inventaire:', inventoryUpdate);
      
      return res.status(200).json({
        success: true,
        message: 'Gift retiré de l\'inventaire - V2',
        inventoryUpdate,
        version: 'V2-ultra-simple'
      });
      
    } else {
      console.log('❌ Événement non reconnu:', event);
      return res.status(400).json({ 
        error: 'Événement non reconnu',
        version: 'V2-ultra-simple',
        receivedEvent: event,
        supportedEvents: ['transfer_received', 'gift_withdrawn']
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur dans inventory-webhook V2:', error);
    res.status(500).json({
      error: 'Erreur interne V2',
      message: error.message,
      version: 'V2-ultra-simple',
      timestamp: new Date().toISOString()
    });
  }
}
