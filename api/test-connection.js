// api/test-connection.js
// API de test simple pour vérifier la connexion

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 API test-connection: Test de connexion...');
    
    res.status(200).json({
      success: true,
      message: 'Connexion API réussie !',
      timestamp: new Date().toISOString(),
      status: 'OK',
      environment: process.env.NODE_ENV || 'development'
    });
    
  } catch (error) {
    console.error('❌ Erreur API test-connection:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      details: error.message 
    });
  }
}
