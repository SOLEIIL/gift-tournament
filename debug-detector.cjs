// debug-detector.cjs
// Script de debug pour identifier le problème du détecteur
require('dotenv').config();
const TelegramGiftDetector = require('./services/telegramGiftDetector.cjs');

async function debugDetector() {
  try {
    console.log('🔍 DEBUG DU DÉTECTEUR TELEGRAM');
    console.log('================================');
    
    const config = {
      telegramApiId: process.env.TELEGRAM_API_ID,
      telegramApiHash: process.env.TELEGRAM_API_HASH,
      telegramSessionString: process.env.TELEGRAM_SESSION_STRING,
      depositAccountUsername: 'WxyzCrypto',
      webhookUrl: 'https://gift-tournament-git-main-soleiils-projects.vercel.app/api/deposit-webhook',
      webhookSecret: 'wxyz-webhook-secret-2024',
      apiKey: 'wxyz-crypto-secure-key-2024'
    };
    
    console.log('✅ Configuration chargée');
    
    const detector = new TelegramGiftDetector(config);
    console.log('✅ Instance créée');
    
    console.log('🚀 Démarrage du détecteur...');
    await detector.start();
    
    console.log('✅ Détecteur démarré avec succès !');
    console.log('⏳ Attente de 10 secondes pour vérifier la stabilité...');
    
    setTimeout(async () => {
      console.log('🔍 Vérification du statut...');
      console.log('isRunning:', detector.isRunning);
      console.log('Client connecté:', !!detector.client);
      
      await detector.stop();
      console.log('✅ Test terminé avec succès');
      process.exit(0);
    }, 10000);
    
  } catch (error) {
    console.error('❌ ERREUR FATALE:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

debugDetector();

