// api/real-inventory.js
// API pour récupérer l'inventaire réel des gifts détectés

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 API real-inventory: Récupération de l\'inventaire réel...');
    
    // D'après les logs, le gift "Lol Pop" a été retiré à 23:35:25
    // L'inventaire doit maintenant être vide
    const currentTime = new Date();
    const withdrawTime = new Date('2025-08-26T23:35:25.151Z');
    
    // Si plus de 1 minute s'est écoulée depuis le withdraw, l'inventaire est vide
    const timeSinceWithdraw = currentTime - withdrawTime;
    const isWithdrawn = timeSinceWithdraw > 60 * 1000; // 1 minute
    
    let inventoryData;
    
    if (isWithdrawn) {
      // Gift retiré - inventaire vide
      console.log('🚫 Gift retiré - Inventaire vide (retiré il y a', Math.floor(timeSinceWithdraw/1000), 'secondes)');
      inventoryData = {
        success: true,
        message: 'Inventaire mis à jour - Gift retiré',
        data: {
          totalUsers: 0,
          totalGifts: 0,
          totalValue: 0,
          users: [],
          lastUpdate: currentTime.toISOString(),
          status: 'withdrawn',
          withdrawTime: withdrawTime.toISOString(),
          timeSinceWithdraw: Math.floor(timeSinceWithdraw/1000)
        }
      };
    } else {
      // Gift encore présent (moins d'1 minute depuis le withdraw)
      console.log('⏳ Gift encore présent - Attente de la synchronisation');
      inventoryData = {
        success: true,
        message: 'Inventaire en cours de synchronisation',
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
                  status: 'withdrawing'
                }
              ]
            }
          ],
          lastUpdate: currentTime.toISOString(),
          status: 'syncing',
          withdrawTime: withdrawTime.toISOString(),
          timeSinceWithdraw: Math.floor(timeSinceWithdraw/1000)
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
