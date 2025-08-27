// api/force-update-inventory.js
// API pour forcer la mise à jour de l'inventaire

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, giftId, userId } = req.body;
    console.log('🔄 API force-update-inventory:', { action, giftId, userId });
    
    let response;
    
    switch (action) {
      case 'withdraw':
        // Simuler le retrait d'un gift
        response = {
          success: true,
          message: 'Gift retiré avec succès',
          data: {
            action: 'withdrawn',
            giftId: giftId,
            userId: userId,
            timestamp: new Date().toISOString(),
            inventoryStatus: 'empty'
          }
        };
        console.log('🚫 Gift retiré simulé:', response);
        break;
        
      case 'deposit':
        // Simuler le dépôt d'un gift
        response = {
          success: true,
          message: 'Gift déposé avec succès',
          data: {
            action: 'deposited',
            giftId: giftId,
            userId: userId,
            timestamp: new Date().toISOString(),
            inventoryStatus: 'active'
          }
        };
        console.log('✅ Gift déposé simulé:', response);
        break;
        
      default:
        response = {
          success: false,
          message: 'Action non reconnue',
          error: 'Action doit être "withdraw" ou "deposit"'
        };
    }
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Erreur API force-update-inventory:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      details: error.message 
    });
  }
}
