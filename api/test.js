// api/test.js
// API de test simple pour diagnostiquer Vercel

export default async function handler(req, res) {
  try {
    console.log('🧪 API Test - Démarrage');
    
    // Test simple sans Supabase
    const testData = {
      success: true,
      message: 'API de test fonctionne !',
      timestamp: new Date().toISOString(),
      method: req.method,
      query: req.query,
      headers: Object.keys(req.headers)
    };
    
    console.log('✅ API Test - Succès');
    
    res.status(200).json(testData);
    
  } catch (error) {
    console.error('❌ API Test - Erreur:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erreur API Test',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

