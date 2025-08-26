// test-connection.cjs
require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

async function testConnection() {
  try {
    console.log('🔍 Test de connexion Telegram...');
    console.log('==================================================');
    
    // Vérifier la configuration
    const apiId = parseInt(process.env.TELEGRAM_API_ID);
    const apiHash = process.env.TELEGRAM_API_HASH;
    const sessionString = process.env.TELEGRAM_SESSION_STRING;
    
    console.log('📱 Configuration:');
    console.log(`   API_ID: ${apiId}`);
    console.log(`   API_HASH: ${apiHash ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`   SESSION: ${sessionString ? '✅ Présent' : '❌ Manquant'}`);
    
    if (!apiId || !apiHash || !sessionString) {
      throw new Error('Configuration incomplète');
    }
    
    console.log('\n🚀 Création du client Telegram...');
    const client = new TelegramClient(
      new StringSession(sessionString),
      apiId,
      apiHash,
      { connectionRetries: 3 }
    );
    
    console.log('📡 Connexion au client...');
    await client.start();
    
    console.log('🔗 Connexion au serveur Telegram...');
    await client.connect();
    
    if (await client.isUserAuthorized()) {
      const me = await client.getMe();
      console.log(`✅ Connecté en tant que: @${me.username || 'Unknown'} (${me.firstName || 'Unknown'})`);
      console.log('✅ Test de connexion RÉUSSI !');
    } else {
      throw new Error('Non autorisé sur Telegram');
    }
    
    await client.disconnect();
    console.log('✅ Déconnexion réussie');
    
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error.message);
    console.error('Stack:', error.stack);
  }
}

testConnection();
