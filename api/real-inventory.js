// api/real-inventory.js
// API pour récupérer l'inventaire réel des gifts détectés

const VirtualInventoryManager = require('../../services/virtualInventoryManager.cjs');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 API real-inventory: Récupération de l\'inventaire réel...');
    
    // Créer une instance temporaire pour lire l'inventaire
    const inventoryManager = new VirtualInventoryManager();
    
    // Récupérer l'inventaire complet
    const allInventories = inventoryManager.getAllInventories();
    console.log('📊 Inventaires récupérés:', allInventories);
    
    // Formater les données pour l'app web
    const formattedInventories = Object.entries(allInventories).map(([userId, userData]) => ({
      userId: userId,
      username: userData.username || 'unknown',
      totalGifts: userData.gifts.length,
      totalValue: userData.gifts.reduce((sum, gift) => sum + (gift.giftValue || 0), 0),
      gifts: userData.gifts.map(gift => ({
        id: gift.giftId || gift.collectibleId,
        name: gift.giftName,
        value: gift.giftValue,
        type: gift.giftType,
        collectibleId: gift.collectibleId,
        collectibleModel: gift.collectibleModel,
        collectibleBackdrop: gift.collectibleBackdrop,
        collectibleSymbol: gift.collectibleSymbol,
        receivedAt: gift.timestamp,
        status: 'pending'
      }))
    }));
    
    console.log('✅ Inventaires formatés:', formattedInventories);
    
    res.status(200).json({
      success: true,
      message: 'Inventaire réel récupéré avec succès',
      data: {
        totalUsers: formattedInventories.length,
        totalGifts: formattedInventories.reduce((sum, user) => sum + user.totalGifts, 0),
        totalValue: formattedInventories.reduce((sum, user) => sum + user.totalValue, 0),
        users: formattedInventories
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur API real-inventory:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      details: error.message 
    });
  }
}
