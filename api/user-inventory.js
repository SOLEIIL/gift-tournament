// api/user-inventory.js
// Endpoint pour récupérer l'inventaire d'un utilisateur spécifique

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, username } = req.query;

    if (!userId && !username) {
      return res.status(400).json({ 
        error: 'userId ou username requis' 
      });
    }

    // Simulation d'un inventaire (en production, ceci viendrait du VirtualInventoryManager)
    let mockInventory = [];
    
    if (userId === '986778065' || username === 'drole') {
      mockInventory = [
        {
          giftId: 'LolPop-14559',
          giftName: 'Lol Pop',
          collectibleId: 'LolPop-14559',
          giftValue: 25,
          status: 'active',
          timestamp: '2025-08-26T22:54:14.441Z',
          messageId: '392677',
          fromUsername: 'drole',
          collectibleModel: 'Gold Star (10‰)',
          collectibleBackdrop: 'Copper (20‰)',
          collectibleSymbol: 'Genie Lamp (4‰)'
        }
      ];
    }

    const userInfo = {
      userId: userId || '986778065',
      username: username || 'drole',
      totalGifts: mockInventory.length,
      totalValue: mockInventory.reduce((sum, gift) => sum + (gift.giftValue || 0), 0),
      gifts: mockInventory
    };

    res.status(200).json({
      success: true,
      message: 'Inventaire utilisateur récupéré',
      data: userInfo
    });

  } catch (error) {
    console.error('❌ Erreur inventaire utilisateur:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
}
