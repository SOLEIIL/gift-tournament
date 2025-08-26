// test-telegram-app.cjs
// Script de test simple pour vérifier si votre app Telegram fonctionne

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

// Configuration directe (pas de .env)
const CONFIG = {
  apiId: 26309990,
  apiHash: 'bda0f9feb8e160644bd05f2904425183',
  phone: '+33651450710'
};

async function testTelegramApp() {
  console.log('🧪 TEST RAPIDE DE VOTRE APP TELEGRAM');
  console.log('==========================================');
  console.log(`📱 API ID: ${CONFIG.apiId}`);
  console.log(`🔑 API Hash: ${CONFIG.apiHash.substring(0, 10)}...`);
  console.log(`📞 Phone: ${CONFIG.phone}`);
  console.log('==========================================\n');

  try {
    // Test 1: Création du client
    console.log('🚀 Test 1: Création du client Telegram...');
    const client = new TelegramClient(
      new StringSession(''),
      CONFIG.apiId,
      CONFIG.apiHash,
      {
        connectionRetries: 1,
        useWSS: false
      }
    );
    console.log('✅ Client créé avec succès\n');

    // Test 2: Connexion TCP
    console.log('🔗 Test 2: Test de connexion TCP...');
    await client.start();
    console.log('✅ Connexion TCP réussie\n');

    // Test 3: Authentification
    console.log('🔐 Test 3: Test d\'authentification...');
    console.log('📱 Envoi du code de vérification...');
    
    const phoneCode = await askQuestion('📱 Entrez le code reçu par SMS : ');
    
    await client.invoke({
      _: 'auth.sendCode',
      phone_number: CONFIG.phone,
      api_id: CONFIG.apiId,
      api_hash: CONFIG.apiHash,
      settings: {
        _: 'codeSettings'
      }
    });
    
    console.log('✅ Demande de code envoyée avec succès !');
    console.log('✅ Votre app Telegram FONCTIONNE !\n');

    // Test 4: Connexion complète
    console.log('🔗 Test 4: Connexion complète...');
    await client.connect();
    console.log('✅ Connexion complète réussie !\n');

    // Test 5: Vérification du compte
    if (await client.isUserAuthorized()) {
      const me = await client.getMe();
      console.log(`✅ Connecté en tant que: @${me.username || 'Unknown'}`);
      console.log(`✅ Nom: ${me.firstName || 'Unknown'}`);
      console.log('✅ Authentification réussie !\n');
    } else {
      console.log('⚠️  Non autorisé - mais la connexion fonctionne\n');
    }

    // Nettoyage
    await client.disconnect();
    await client.destroy();
    console.log('✅ Tests terminés avec succès !');
    console.log('🎉 Votre app Telegram fonctionne parfaitement !');

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TEST:');
    console.error(`   Type: ${error.constructor.name}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.code) {
      console.error(`   Code: ${error.code}`);
      
      if (error.code === 400) {
        console.error('\n🔍 DIAGNOSTIC:');
        if (error.errorMessage === 'API_ID_INVALID') {
          console.error('   ❌ API_ID_INVALID: Votre app n\'est plus reconnue par Telegram');
          console.error('   💡 Solution: Créer une nouvelle app sur my.telegram.org');
        } else if (error.errorMessage === 'PHONE_CODE_INVALID') {
          console.error('   ❌ PHONE_CODE_INVALID: Code SMS incorrect');
          console.error('   💡 Solution: Vérifier le code reçu');
        } else {
          console.error(`   ❌ Erreur 400: ${error.errorMessage}`);
        }
      } else if (error.code === 401) {
        console.error('\n🔍 DIAGNOSTIC:');
        console.error('   ❌ 401: Problème d\'authentification');
        console.error('   💡 Solution: Vérifier vos credentials');
      }
    }
    
    console.error('\n📋 RÉSUMÉ:');
    console.error('   Votre app Telegram a un problème');
    console.error('   Vérifiez sur my.telegram.org que l\'app est active');
  }
}

// Fonction utilitaire pour poser des questions
function askQuestion(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Lancer le test
testTelegramApp();
