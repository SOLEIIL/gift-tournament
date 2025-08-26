// test-simple-connection.cjs
// Test très simple pour vérifier la connectivité Telegram

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

async function testSimpleConnection() {
  console.log('🧪 TEST SIMPLE DE CONNEXION TELEGRAM');
  console.log('=====================================');
  console.log('📱 API ID: 26309990');
  console.log('🔑 API Hash: bda0f9feb8...');
  console.log('=====================================\n');

  try {
    // Test 1: Création du client
    console.log('🚀 Test 1: Création du client...');
    const client = new TelegramClient(
      new StringSession(''),
      26309990,
      'bda0f9feb8e160644bd05f2904425183',
      { connectionRetries: 1, useWSS: false }
    );
    console.log('✅ Client créé\n');

    // Test 2: Connexion directe (sans start())
    console.log('🔗 Test 2: Connexion directe...');
    await client.connect();
    console.log('✅ Connexion réussie !\n');

    // Test 3: Test d'autorisation
    console.log('🔐 Test 3: Test d\'autorisation...');
    const isAuthorized = await client.isUserAuthorized();
    console.log(`✅ Autorisation: ${isAuthorized ? 'OUI' : 'NON'}\n`);

    if (isAuthorized) {
      console.log('🎉 VOTRE APP TELEGRAM FONCTIONNE PARFAITEMENT !');
      console.log('✅ Le problème vient d\'ailleurs (probablement la session)');
    } else {
      console.log('⚠️  Non autorisé - mais la connexion fonctionne');
      console.log('✅ Votre app est valide, il faut juste une session');
    }

    // Nettoyage
    await client.disconnect();
    await client.destroy();
    console.log('\n✅ Test terminé avec succès !');

  } catch (error) {
    console.error('\n❌ ERREUR:');
    console.error(`   Type: ${error.constructor.name}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.code) {
      console.error(`   Code: ${error.code}`);
      
      if (error.code === 400) {
        if (error.errorMessage === 'API_ID_INVALID') {
          console.error('\n🔍 DIAGNOSTIC:');
          console.error('   ❌ API_ID_INVALID: Votre app n\'est plus reconnue');
          console.error('   💡 Solution: Créer une nouvelle app sur my.telegram.org');
        }
      }
    }
  }
}

testSimpleConnection();
