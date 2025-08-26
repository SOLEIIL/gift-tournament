// api/real-inventory.js
// API pour récupérer l'inventaire réel des gifts détectés

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 API real-inventory: Récupération de l\'inventaire réel...');
    
    // Pour l'instant, retourner des données mock basées sur ce que le détecteur a trouvé
    // Plus tard, nous pourrons connecter une base de données ou un webhook
    const mockInventory = {
      success: true,
      message: 'Inventaire réel récupéré avec succès',
      data: {
        totalUsers: 1,
        totalGifts: 1,
        totalValue: 25,
        users: [
          {
            userId: '986778065',
            username: 'drole',
            totalGifts: 1,
            totalValue: 25,
            gifts: [
              {
                id: 'LolPop-14559',
                name: 'Lol Pop',
                value: 25,
                type: 'star_gift_unique',
                collectibleId: 'LolPop-14559',
                collectibleModel: 'Gold Star (10‰)',
                collectibleBackdrop: 'Copper (20‰)',
                collectibleSymbol: 'Genie Lamp (4‰)',
                receivedAt: new Date().toISOString(),
                status: 'pending'
              }
            ]
          }
        ]
      }
    };
    
    console.log('✅ Inventaire mock retourné:', mockInventory);
    
    res.status(200).json(mockInventory);
    
  } catch (error) {
    console.error('❌ Erreur API real-inventory:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      details: error.message 
    });
  }
}
