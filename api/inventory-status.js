// api/inventory-status.js
// Endpoint pour vérifier le statut de l'inventaire

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simulation d'un inventaire (en production, ceci viendrait d'une base de données)
    const mockInventory = {
      status: 'active',
      lastUpdated: new Date().toISOString(),
      totalUsers: 1,
      totalGifts: 1,
      users: [
        {
          userId: '986778065',
          username: 'drole',
          gifts: [
            {
              giftName: 'Lol Pop',
              collectibleId: 'LolPop-14559',
              giftValue: 25,
              status: 'active',
              receivedAt: '2025-08-26T22:35:31.893Z'
            }
          ]
        }
      ]
    };

    res.status(200).json({
      success: true,
      message: 'Statut de l\'inventaire récupéré',
      data: mockInventory
    });

  } catch (error) {
    console.error('❌ Erreur statut inventaire:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
}
