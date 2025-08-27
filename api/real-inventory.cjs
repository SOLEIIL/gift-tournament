// api/real-inventory.js
// API pour récupérer l'inventaire réel des gifts détectés en temps réel

// Import du gestionnaire d'inventaire virtuel
const VirtualInventoryManager = require('../../services/virtualInventoryManager.cjs');

// Instance globale du gestionnaire (sera partagée avec le service Telegram)
let virtualInventoryManager = null;

// Initialiser le gestionnaire d'inventaire
function initializeInventoryManager() {
  if (!virtualInventoryManager) {
    virtualInventoryManager = new VirtualInventoryManager();
    console.log('🎯 Gestionnaire d\'inventaire virtuel initialisé pour l\'API');
  }
  return virtualInventoryManager;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 API real-inventory: Récupération de l\'inventaire réel...');
    
    // Initialiser le gestionnaire d'inventaire
    const inventoryManager = initializeInventoryManager();
    
    // Récupérer l'état actuel de l'inventaire
    const currentState = inventoryManager.saveState();
    
    if (!currentState) {
      throw new Error('Impossible de récupérer l\'état de l\'inventaire');
    }

    // Convertir les données en format compatible avec le frontend
    const users = [];
    let totalGifts = 0;
    let totalValue = 0;

    // Parcourir les inventaires virtuels
    for (const [userId, inventory] of Object.entries(currentState.virtualInventories)) {
      if (inventory && inventory.length > 0) {
        const userGifts = [];
        let userTotalValue = 0;
        
        for (const gift of inventory) {
          // Calculer la valeur du gift (pour l'instant, on utilise une valeur par défaut)
          const giftValue = 25; // Valeur par défaut, à adapter selon la logique métier
          
          userGifts.push({
            id: gift.giftId || gift.collectibleId,
            name: gift.giftName,
            value: giftValue,
            type: 'star_gift_unique',
            collectibleId: gift.collectibleId,
            collectibleModel: 'Gold Star (10‰)',
            collectibleBackdrop: 'Copper (20‰)',
            collectibleSymbol: 'Genie Lamp (4‰)',
            receivedAt: gift.timestamp,
            status: gift.status || 'active',
            messageId: gift.messageId
          });
          
          userTotalValue += giftValue;
          totalGifts++;
          totalValue += giftValue;
        }

        // Récupérer le username du premier gift
        const username = inventory[0]?.fromUsername || 'Unknown';
        
        users.push({
          userId: userId,
          username: username,
          totalGifts: userGifts.length,
          totalValue: userTotalValue,
          gifts: userGifts
        });
      }
    }

    // Préparer la réponse
    const inventoryData = {
      success: true,
      message: 'Inventaire récupéré avec succès',
      data: {
        totalUsers: users.length,
        totalGifts: totalGifts,
        totalValue: totalValue,
        users: users,
        lastUpdate: new Date().toISOString(),
        status: totalGifts > 0 ? 'active' : 'empty',
        pendingGifts: currentState.pendingGifts ? Object.keys(currentState.pendingGifts).length : 0,
        totalTransactions: currentState.transactionHistory ? currentState.transactionHistory.length : 0
      }
    };
    
    console.log('✅ Inventaire retourné:', {
      totalUsers: inventoryData.data.totalUsers,
      totalGifts: inventoryData.data.totalGifts,
      totalValue: inventoryData.data.totalValue,
      status: inventoryData.data.status
    });
    
    res.status(200).json(inventoryData);
    
  } catch (error) {
    console.error('❌ Erreur API real-inventory:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      details: error.message 
    });
  }
}
