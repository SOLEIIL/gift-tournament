// api/inventory-webhook-simple.js
// Version simplifiée de l'API d'inventaire

export default function handler(req, res) {
  try {
    console.log('🎁 inventory-webhook-simple appelée');
    console.log('📊 Méthode:', req.method);
    console.log('📋 Headers:', Object.keys(req.headers));
    console.log('📄 Body:', req.body ? 'Présent' : 'Absent');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Vérification simple de la signature
    const signature = req.headers['x-telegram-signature'];
    const timestamp = req.headers['x-telegram-timestamp'];
    
    if (!signature || !timestamp) {
      console.log('❌ Headers manquants');
      return res.status(401).json({ error: 'Headers manquants' });
    }

    console.log('✅ Headers reçus');
    console.log('📊 Données reçues:', req.body);

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
        status: 'success'
      };
      
      console.log('📊 Mise à jour inventaire:', inventoryUpdate);
      
      return res.status(200).json({
        success: true,
        message: 'Gift ajouté à l\'inventaire',
        inventoryUpdate
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
        status: 'success'
      };
      
      console.log('📊 Mise à jour inventaire:', inventoryUpdate);
      
      return res.status(200).json({
        success: true,
        message: 'Gift retiré de l\'inventaire',
        inventoryUpdate
      });
      
    } else {
      console.log('❌ Événement non reconnu:', event);
      return res.status(400).json({ error: 'Événement non reconnu' });
    }
    
  } catch (error) {
    console.error('❌ Erreur dans inventory-webhook-simple:', error);
    res.status(500).json({
      error: 'Erreur interne',
      message: error.message
    });
  }
}
