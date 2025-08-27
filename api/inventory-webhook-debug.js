// api/inventory-webhook-debug.js
// Version ultra-simple pour identifier le problème

export default function handler(req, res) {
  try {
    console.log('🧪 inventory-webhook-debug appelée');
    console.log('📊 Méthode:', req.method);
    console.log('📋 Headers:', Object.keys(req.headers));
    console.log('📄 Body:', req.body ? 'Présent' : 'Absent');
    
    // Test simple sans dépendances
    res.status(200).json({
      message: 'inventory-webhook-debug fonctionne !',
      timestamp: new Date().toISOString(),
      method: req.method,
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      headers: Object.keys(req.headers),
      test: 'API simple sans dépendances'
    });
    
  } catch (error) {
    console.error('❌ Erreur dans inventory-webhook-debug:', error);
    res.status(500).json({
      error: 'Erreur interne',
      message: error.message,
      stack: error.stack
    });
  }
}
