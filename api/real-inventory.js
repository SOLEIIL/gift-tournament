// api/real-inventory.js
// API pour récupérer l'inventaire réel des gifts détectés

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 API real-inventory: Récupération de l\'inventaire réel...');
    
    // Simulation de l'inventaire en temps réel
    // En production, cela sera connecté à une base de données ou webhook
    const currentTime = new Date();
    const lastWithdrawTime = new Date('2025-08-26T23:35:25.151Z'); // Heure du dernier withdraw détecté
    
    // Si le withdraw a été détecté récemment (< 5 minutes), l'inventaire est vide
    const timeSinceWithdraw = currentTime - lastWithdrawTime;
    const isRecentlyWithdrawn = timeSinceWithdraw < 5 * 60 * 1000; // 5 minutes
    
    let inventoryData;
    
    if (isRecentlyWithdrawn) {
      // Gift récemment retiré - inventaire vide
      console.log('🚫 Gift récemment retiré - Inventaire vide');
      inventoryData = {
        success: true,
        message: 'Inventaire mis à jour - Gift retiré',
        data: {
          totalUsers: 0,
          totalGifts: 0,
          totalValue: 0,
          users: [],
          lastUpdate: currentTime.toISOString(),
          status: 'withdrawn'
        }
      };
    } else {
      // Gift encore présent - inventaire avec le gift
      console.log('✅ Gift encore présent - Inventaire avec gift');
      inventoryData = {
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
                  receivedAt: new Date('2025-08-26T23:34:54.019Z').toISOString(),
                  status: 'pending'
                }
              ]
            }
          ],
          lastUpdate: currentTime.toISOString(),
          status: 'active'
        }
      };
    }
    
    console.log('✅ Inventaire retourné:', inventoryData);
    
    res.status(200).json(inventoryData);
    
  } catch (error) {
    console.error('❌ Erreur API real-inventory:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      details: error.message 
    });
  }
}
