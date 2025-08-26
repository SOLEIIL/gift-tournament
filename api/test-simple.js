// api/test-simple.js
// API ultra-simple pour tester Vercel

export default function handler(req, res) {
  try {
    console.log('🧪 API test-simple appelée');
    
    res.status(200).json({
      message: 'API test-simple fonctionne !',
      timestamp: new Date().toISOString(),
      method: req.method,
      headers: req.headers
    });
    
  } catch (error) {
    console.error('❌ Erreur dans test-simple:', error);
    res.status(500).json({
      error: 'Erreur interne',
      message: error.message
    });
  }
}
