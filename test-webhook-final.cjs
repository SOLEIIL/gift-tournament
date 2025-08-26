// test-webhook-final.cjs
// Test final du webhook maintenant que l'API est déployée
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
    giftName: 'Lol Pop Test Final',
    giftValue: 14559,
    giftType: 'star_gift_unique',
    mediaType: 'star_gift_unique',
    collectibleId: 'LolPop-Test-Final-123',
    collectibleModel: 'Test Model Final',
    collectibleBackdrop: 'Test Backdrop Final',
    collectibleSymbol: 'Test Symbol Final',
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

// Test du webhook
async function testWebhook() {
  try {
    console.log('🧪 TEST FINAL DU WEBHOOK - API DÉPLOYÉE !');
    console.log('==============================================');
    console.log('📡 URL:', TEST_CONFIG.webhookUrl);
    console.log('🔑 Secret:', TEST_CONFIG.webhookSecret.substring(0, 20) + '...');
    console.log('🔓 Token Bypass:', TEST_CONFIG.vercelBypassToken.substring(0, 20) + '...');
    console.log('📊 Données de test:', JSON.stringify(testGiftData, null, 2));
    console.log('==============================================\n');

    // Générer la signature
    const signature = generateSignature(testGiftData);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    console.log('🔐 Signature générée:', signature);
    console.log('⏰ Timestamp:', timestamp);
    console.log('==============================================\n');

    // Envoyer la requête avec le token de bypass
    console.log('📤 Envoi de la requête avec token de bypass...');
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
      console.log('✅ SUCCÈS ! Réponse:', result);
      console.log('\n🎉 Le webhook fonctionne parfaitement !');
      console.log('🚀 Votre bot @testnftbuybot recevra les données !');
      console.log('📊 L\'inventaire sera mis à jour automatiquement !');
      console.log('\n🎯 MAINTENANT, TESTONS LE DÉTECTEUR COMPLET !');
    } else {
      const errorText = await response.text();
      console.log('❌ ERREUR ! Détails:', errorText);
      console.log('\n🔧 Problème à résoudre avant de tester le détecteur');
    }

  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    console.log('\n🔍 Vérifiez :');
    console.log('   - L\'URL du webhook est-elle correcte ?');
    console.log('   - Le secret correspond-il ?');
    console.log('   - Le token de bypass est-il valide ?');
  }
}

// Lancer le test
console.log('🚀 Démarrage du test final webhook - API déployée !\n');
testWebhook();
