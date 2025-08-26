// test-gift-sync.cjs
// Test de synchronisation des gifts entre le détecteur et le bot
const crypto = require('crypto');
const fetch = require('node-fetch').default;

// Configuration de test
const TEST_CONFIG = {
  webhookUrl: 'https://gift-tournament-git-main-soleiils-projects.vercel.app/api/inventory-webhook',
  webhookSecret: 'wxyz-webhook-secret-2024',
  vercelBypassToken: 'J7ycuRhEZVd72UKna9XRx64n2eQ2Cz27'
};

// Test 1: Dépôt d'un gift (ajout à l'inventaire)
const testDeposit = {
  event: 'transfer_received',
  timestamp: new Date().toISOString(),
  data: {
    fromUserId: '986778065',
    fromUsername: 'drole',
    fromFirstName: 'Drole',
    fromLastName: 'Test',
    toDepositAccount: 'WxyzCrypto',
    giftName: 'Lol Pop Test Sync',
    giftValue: 14559,
    giftType: 'star_gift_unique',
    mediaType: 'star_gift_unique',
    collectibleId: 'LolPop-Test-Sync-123',
    collectibleModel: 'Test Model Sync',
    collectibleBackdrop: 'Test Backdrop Sync',
    collectibleSymbol: 'Test Symbol Sync',
    isFromHistory: false
  }
};

// Test 2: Withdraw d'un gift (retrait de l'inventaire)
const testWithdraw = {
  event: 'gift_withdrawn',
  timestamp: new Date().toISOString(),
  data: {
    toUserId: '986778065',
    toUsername: 'drole',
    toFirstName: 'Drole',
    toLastName: 'Test',
    fromDepositAccount: 'WxyzCrypto',
    giftName: 'Lol Pop Test Sync',
    giftValue: 14559,
    giftType: 'star_gift_unique',
    mediaType: 'star_gift_unique',
    collectibleId: 'LolPop-Test-Sync-123',
    collectibleModel: 'Test Model Sync',
    collectibleBackdrop: 'Test Backdrop Sync',
    collectibleSymbol: 'Test Symbol Sync',
    isFromHistory: false
  }
};

// Générer la signature (même méthode que le détecteur)
const generateSignature = (payload) => {
  const data = JSON.stringify(payload);
  return crypto.createHmac('sha256', TEST_CONFIG.webhookSecret)
    .update(data)
    .digest('hex');
};

// Test de l'API d'inventaire
async function testGiftSync() {
  try {
    console.log('🧪 TEST DE SYNCHRONISATION DES GIFTS');
    console.log('=====================================');
    console.log('📡 URL:', TEST_CONFIG.webhookUrl);
    console.log('🔑 Secret:', TEST_CONFIG.webhookSecret.substring(0, 20) + '...');
    console.log('🔓 Token Bypass:', TEST_CONFIG.vercelBypassToken.substring(0, 20) + '...');
    console.log('=====================================\n');

    // 🎁 TEST 1: DÉPÔT (ajout à l'inventaire)
    console.log('🎁 TEST 1: DÉPÔT - Ajout à l\'inventaire');
    console.log('==========================================');
    
    const depositSignature = generateSignature(testDeposit);
    
    console.log('📤 Envoi du webhook DÉPÔT...');
    const depositResponse = await fetch(TEST_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Signature': depositSignature,
        'X-Telegram-Timestamp': Math.floor(Date.now() / 1000).toString(),
        'x-vercel-protection-bypass': TEST_CONFIG.vercelBypassToken
      },
      body: JSON.stringify(testDeposit)
    });

    console.log('📥 Réponse DÉPÔT:');
    console.log('   Status:', depositResponse.status, depositResponse.statusText);
    
    if (depositResponse.ok) {
      const depositResult = await depositResponse.json();
      console.log('✅ SUCCÈS DÉPÔT ! Réponse:', depositResult);
      console.log('🎯 L\'inventaire de @drole devrait être mis à jour !');
    } else {
      const depositError = await depositResponse.text();
      console.log('❌ ERREUR DÉPÔT ! Détails:', depositError);
    }

    console.log('\n⏳ Attente de 3 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 🚫 TEST 2: WITHDRAW (retrait de l'inventaire)
    console.log('🚫 TEST 2: WITHDRAW - Retrait de l\'inventaire');
    console.log('==============================================');
    
    const withdrawSignature = generateSignature(testWithdraw);
    
    console.log('📤 Envoi du webhook WITHDRAW...');
    const withdrawResponse = await fetch(TEST_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Signature': withdrawSignature,
        'X-Telegram-Timestamp': Math.floor(Date.now() / 1000).toString(),
        'x-vercel-protection-bypass': TEST_CONFIG.vercelBypassToken
      },
      body: JSON.stringify(testWithdraw)
    });

    console.log('📥 Réponse WITHDRAW:');
    console.log('   Status:', withdrawResponse.status, withdrawResponse.statusText);
    
    if (withdrawResponse.ok) {
      const withdrawResult = await withdrawResponse.json();
      console.log('✅ SUCCÈS WITHDRAW ! Réponse:', withdrawResult);
      console.log('🎯 L\'inventaire de @drole devrait être retiré !');
    } else {
      const withdrawError = await withdrawResponse.text();
      console.log('❌ ERREUR WITHDRAW ! Détails:', withdrawError);
    }

    // 📊 RÉSUMÉ DES TESTS
    console.log('\n📊 RÉSUMÉ DES TESTS');
    console.log('=====================');
    
    if (depositResponse.ok && withdrawResponse.ok) {
      console.log('🎉 TOUS LES TESTS RÉUSSIS !');
      console.log('✅ Dépôt traité → Inventaire mis à jour');
      console.log('✅ Withdraw traité → Inventaire retiré');
      console.log('\n🚀 Votre bot @testnftbuybot recevra les données !');
      console.log('📱 L\'onglet inventory sera synchronisé en temps réel !');
    } else {
      console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
      console.log('🔧 Vérifiez les logs Vercel pour identifier le problème');
    }

  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
  }
}

// Lancer les tests
console.log('🚀 Test de synchronisation des gifts entre détecteur et bot !\n');
testGiftSync();
