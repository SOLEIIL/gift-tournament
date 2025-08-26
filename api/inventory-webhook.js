// api/inventory-webhook.js
// Webhook pour recevoir les mises à jour d'inventaire du détecteur de gifts

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data, timestamp } = req.body;

    console.log(`📨 Webhook reçu: ${type} à ${timestamp}`);

    switch (type) {
      case 'gift_received':
        console.log(`🎁 Gift reçu: ${data.giftName} de ${data.fromUsername}`);
        // Ici vous pourriez sauvegarder en base de données
        break;

      case 'gift_withdrawn':
        console.log(`🚫 Gift retiré: ${data.giftName} par ${data.toUsername}`);
        // Ici vous pourriez mettre à jour la base de données
        break;

      case 'inventory_updated':
        console.log(`📦 Inventaire mis à jour pour ${data.userId}`);
        // Ici vous pourriez notifier le bot
        break;

      default:
        console.log(`❓ Type de webhook inconnu: ${type}`);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Webhook traité avec succès',
      received: { type, timestamp }
    });

  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
}
