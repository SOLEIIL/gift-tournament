// api/inventory-webhook-simple.js
// Version simplifiée pour identifier le problème

export default function handler(req, res) {
  try {
    console.log('🧪 inventory-webhook-simple appelée');
    console.log('📊 Méthode:', req.method);
    console.log('📋 Headers:', req.headers);
    console.log('📄 Body:', req.body);
    
    // Test simple sans dépendances
    res.status(200).json({
      message: 'inventory-webhook-simple fonctionne !',
      timestamp: new Date().toISOString(),
      method: req.method,
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      headers: Object.keys(req.headers)
    });
    
  } catch (error) {
    console.error('❌ Erreur dans inventory-webhook-simple:', error);
    res.status(500).json({
      error: 'Erreur interne',
      message: error.message,
      stack: error.stack
    });
  }
}
