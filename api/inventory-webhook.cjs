// api/inventory-webhook.js
// Webhook pour notifier le frontend des changements d'inventaire en temps réel

// Import du gestionnaire d'inventaire virtuel
const VirtualInventoryManager = require('../../services/virtualInventoryManager.cjs');

// Instance globale du gestionnaire
let virtualInventoryManager = null;

// Initialiser le gestionnaire d'inventaire
function initializeInventoryManager() {
  if (!virtualInventoryManager) {
    virtualInventoryManager = new VirtualInventoryManager();
    console.log('🎯 Gestionnaire d\'inventaire virtuel initialisé pour le webhook');
  }
  return virtualInventoryManager;
}

export default async function handler(req, res) {
  // Autoriser les requêtes POST et GET
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔔 Webhook inventory: Traitement de la requête...');
    
    // Initialiser le gestionnaire d'inventaire
    const inventoryManager = initializeInventoryManager();
    
    if (req.method === 'GET') {
      // GET: Retourner l'état actuel (pour les tests)
      const currentState = inventoryManager.saveState();
      
      return res.status(200).json({
        success: true,
        message: 'État actuel de l\'inventaire',
        data: currentState,
        timestamp: new Date().toISOString()
      });
    }
    
    // POST: Traiter les mises à jour d'inventaire
    const { action, giftData, timestamp } = req.body;
    
    if (!action || !giftData) {
      return res.status(400).json({ 
        error: 'Données manquantes', 
        required: ['action', 'giftData'] 
      });
    }
    
    console.log(`🎁 Webhook: Action ${action} reçue pour le gift ${giftData.giftName || giftData.giftId}`);
    
    let success = false;
    let message = '';
    
    switch (action) {
      case 'gift_received':
        // Un nouveau gift a été reçu
        success = inventoryManager.addGiftReceived(giftData);
        message = success ? 'Gift ajouté avec succès' : 'Erreur lors de l\'ajout du gift';
        break;
        
      case 'gift_withdrawn':
        // Un gift a été retiré
        success = inventoryManager.removeGiftWithdrawn(giftData);
        message = success ? 'Gift retiré avec succès' : 'Erreur lors du retrait du gift';
        break;
        
      case 'gift_updated':
        // Un gift a été mis à jour
        success = inventoryManager.updateGiftStatus(giftData);
        message = success ? 'Gift mis à jour avec succès' : 'Erreur lors de la mise à jour du gift';
        break;
        
      default:
        return res.status(400).json({ 
          error: 'Action non reconnue', 
          supported: ['gift_received', 'gift_withdrawn', 'gift_updated'] 
        });
    }
    
    if (success) {
      // Afficher l'état actuel de l'inventaire
      inventoryManager.displayAllInventories();
      
      // Préparer la réponse avec l'état mis à jour
      const updatedState = inventoryManager.saveState();
      
      return res.status(200).json({
        success: true,
        message: message,
        action: action,
        giftData: giftData,
        timestamp: timestamp || new Date().toISOString(),
        inventoryState: updatedState
      });
    } else {
      return res.status(500).json({
        success: false,
        error: message,
        action: action,
        giftData: giftData
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur webhook inventory:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      details: error.message 
    });
  }
}
