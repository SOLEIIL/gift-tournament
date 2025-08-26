// test-webhook-complete.cjs
// Test complet du webhook maintenant que l'API simple fonctionne
const crypto = require('crypto');
const fetch = require('node-fetch').default;

// Configuration de test
const TEST_CONFIG = {
  webhookUrl: 'https://gift-tournament-git-main-soleiils-projects.vercel.app/api/inventory-webhook',
  webhookSecret: 'wxyz-webhook-secret-2024',
  vercelBypassToken: 'J7ycuRhEZVd72UKna9XRx64n2eQ2Cz27'
};

// Données de test (simulation d'un gift reçu)
const testGiftData = {
  event: 'transfer_received',
  timestamp: new Date().toISOString(),
  data: {
    fromUserId: '986778065',
    fromUsername: 'drole',
    fromFirstName: 'Drole',
    fromLastName: 'Test',
    toDepositAccount: 'WxyzCrypto',
    giftName: 'Lol Pop Test Complet',
    giftValue: 14559,
    giftType: 'star_gift_unique',
    mediaType: 'star_gift_unique',
    collectibleId: 'LolPop-Test-Complet-123',
    collectibleModel: 'Test Model Complet',
    collectibleBackdrop: 'Test Backdrop Complet',
    collectibleSymbol: 'Test Symbol Complet',
    isFromHistory: false
  }
};

// Générer la signature (même méthode que le détecteur)
const generateSignature = (payload) => {
  const data = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payloadWithTimestamp = data + timestamp + TEST_CONFIG.webhookSecret;
  
  return crypto.createHmac('sha256', TEST_CONFIG.webhookSecret)
    .update(payloadWithTimestamp)
    .digest('hex');
};

// Test du webhook complet
async function testWebhookComplete() {
  try {
    console.log('🧪 TEST WEBHOOK COMPLET - API simple fonctionne !');
    console.log('==================================================');
    console.log('📡 URL:', TEST_CONFIG.webhookUrl);
    console.log('🔑 Secret:', TEST_CONFIG.webhookSecret.substring(0, 20) + '...');
    console.log('🔓 Token Bypass:', TEST_CONFIG.vercelBypassToken.substring(0, 20) + '...');
    console.log('📊 Données de test:', JSON.stringify(testGiftData, null, 2));
    console.log('==================================================\n');

    // Générer la signature
    const signature = generateSignature(testGiftData);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    console.log('🔐 Signature générée:', signature);
    console.log('⏰ Timestamp:', timestamp);
    console.log('==================================================\n');

    // Envoyer la requête avec le token de bypass
    console.log('📤 Envoi de la requête avec signature et token de bypass...');
    const response = await fetch(TEST_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Signature': signature,
        'X-Telegram-Timestamp': timestamp,
        'x-vercel-protection-bypass': TEST_CONFIG.vercelBypassToken
      },
      body: JSON.stringify(testGiftData)
    });

    console.log('📥 Réponse reçue:');
    console.log('   Status:', response.status, response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCÈS ! Webhook complet fonctionne !');
      console.log('📊 Réponse:', result);
      console.log('\n🎉 VOTRE SYSTÈME EST 100% FONCTIONNEL !');
      console.log('🚀 Le détecteur peut maintenant synchroniser l\'inventaire !');
    } else {
      const errorText = await response.text();
      console.log('❌ ERREUR ! Détails:', errorText);
      console.log('\n🔍 PROBLÈME DANS inventory-webhook.js :');
      console.log('   - Dépendance manquante ?');
      console.log('   - Variables d\'environnement ?');
      console.log('   - Erreur de logique ?');
      console.log('\n📋 Vérifiez les logs Vercel pour inventory-webhook.js');
    }

  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
  }
}

// Lancer le test
console.log('🚀 Test du webhook complet maintenant que l\'API simple fonctionne !\n');
testWebhookComplete();
