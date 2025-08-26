// test-connection-timeout.cjs
require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

async function testConnectionWithTimeout() {
  try {
    console.log('🔍 Test de connexion Telegram avec timeout...');
    console.log('==================================================');
    
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
      { 
        connectionRetries: 1,
        timeout: 10000, // 10 secondes
        useWSS: false
      }
    );
    
    console.log('📡 Connexion au client...');
    await client.start();
    
    console.log('🔗 Connexion au serveur Telegram (timeout 10s)...');
    
    // Test avec timeout
    const connectionPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout de connexion (10s)')), 10000);
    });
    
    await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log('✅ Connexion réussie !');
    
    if (await client.isUserAuthorized()) {
      const me = await client.getMe();
      console.log(`✅ Connecté en tant que: @${me.username || 'Unknown'} (${me.firstName || 'Unknown'})`);
    } else {
      throw new Error('Non autorisé sur Telegram');
    }
    
    await client.disconnect();
    console.log('✅ Déconnexion réussie');
    
  } catch (error) {
    if (error.message.includes('Timeout')) {
      console.error('⏰ TIMEOUT - La connexion prend trop de temps');
      console.error('   Cela peut indiquer :');
      console.error('   - Problème réseau');
      console.error('   - Rate limiting de Telegram');
      console.error('   - Serveur Telegram lent');
    } else {
      console.error('❌ Erreur lors du test de connexion:', error.message);
    }
  }
}

testConnectionWithTimeout();
