// api/test-webhook.js
// API de test pour vérifier le fonctionnement des webhooks

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Test webhook reçu:', {
      method: req.method,
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // Simuler un webhook de gift reçu
    const testData = {
      type: 'gift_received',
      data: {
        giftName: 'Test Gift',
        fromUsername: 'testuser',
        giftValue: 25,
        collectibleId: 'test-123'
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Test webhook traité avec succès');
    
    res.status(200).json({
      success: true,
      message: 'Test webhook réussi',
      testData: testData,
      serverTime: new Date().toISOString(),
      status: 'webhook_working'
    });

  } catch (error) {
    console.error('❌ Erreur test webhook:', error);
    res.status(500).json({
      error: 'Erreur test webhook',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
