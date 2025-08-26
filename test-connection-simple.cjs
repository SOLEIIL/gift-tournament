// test-connection-simple.cjs
require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

async function testSimpleConnection() {
  try {
    console.log('🔍 Test de connexion simple...');
    console.log('==================================================');
    
    const apiId = parseInt(process.env.TELEGRAM_API_ID);
    const apiHash = process.env.TELEGRAM_API_HASH;
    
    console.log('📱 Configuration:');
    console.log(`   API_ID: ${apiId}`);
    console.log(`   API_HASH: ${apiHash ? '✅ Présent' : '❌ Manquant'}`);
    
    // Test 1: Client sans session
    console.log('\n🚀 Test 1: Client sans session...');
    const client1 = new TelegramClient(
      new StringSession(''),
      apiId,
      apiHash,
      { 
        connectionRetries: 1,
        useWSS: false,
        timeout: 5000
      }
    );
    
    try {
      console.log('📡 Démarrage client 1...');
      await client1.start();
      console.log('✅ Client 1 démarré !');
      await client1.disconnect();
    } catch (error) {
      console.log('❌ Client 1 échoué:', error.message);
    }
    
    // Test 2: Client avec session existante
    console.log('\n🚀 Test 2: Client avec session existante...');
    const sessionString = process.env.TELEGRAM_SESSION_STRING;
    const client2 = new TelegramClient(
      new StringSession(sessionString),
      apiId,
      apiHash,
      { 
        connectionRetries: 1,
        useWSS: false,
        timeout: 5000
      }
    );
    
    try {
      console.log('📡 Démarrage client 2...');
      await client2.start();
      console.log('✅ Client 2 démarré !');
      
      if (await client2.isUserAuthorized()) {
        const me = await client2.getMe();
        console.log(`✅ Connecté en tant que: @${me.username || 'Unknown'}`);
      } else {
        console.log('⚠️  Non autorisé');
      }
      
      await client2.disconnect();
    } catch (error) {
      console.log('❌ Client 2 échoué:', error.message);
    }
    
    // Test 3: Connexion directe
    console.log('\n🚀 Test 3: Connexion directe...');
    const client3 = new TelegramClient(
      new StringSession(sessionString),
      apiId,
      apiHash,
      { 
        connectionRetries: 1,
        useWSS: false,
        timeout: 5000
      }
    );
    
    try {
      console.log('📡 Démarrage client 3...');
      await client3.start();
      console.log('🔗 Tentative de connexion...');
      await client3.connect();
      console.log('✅ Connexion réussie !');
      await client3.disconnect();
    } catch (error) {
      console.log('❌ Client 3 échoué:', error.message);
      console.log('   Type d\'erreur:', error.constructor.name);
      if (error.code) console.log('   Code:', error.code);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testSimpleConnection();
