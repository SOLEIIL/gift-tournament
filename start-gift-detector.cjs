// start-gift-detector.cjs
// Script de démarrage pour le détecteur de gifts Telegram
require('dotenv').config();
const TelegramGiftDetector = require('./services/telegramGiftDetector.cjs');

// Configuration du détecteur de gifts
const GIFT_DETECTOR_CONFIG = {
  // Configuration Telegram
  telegramApiId: process.env.TELEGRAM_API_ID,
  telegramApiHash: process.env.TELEGRAM_API_HASH,
  telegramSessionString: process.env.TELEGRAM_SESSION_STRING,
  
  // Configuration du compte de dépôt
  depositAccountUsername: process.env.DEPOSIT_ACCOUNT_USERNAME || 'WxyzCrypto',
  
  // Configuration webhook
  webhookUrl: process.env.WEBHOOK_URL || 'https://gift-tournament-git-main-soleiils-projects.vercel.app/api/deposit-webhook',
  webhookSecret: process.env.WEBHOOK_SECRET || 'wxyz-webhook-secret-2024',
  apiKey: process.env.DEPOSIT_API_KEY || 'wxyz-crypto-secure-key-2024'
};

// Validation de la configuration
function validateConfig() {
  const required = ['telegramApiId', 'telegramApiHash', 'telegramSessionString'];
  for (const key of required) {
    if (!GIFT_DETECTOR_CONFIG[key]) {
      throw new Error(`Configuration manquante: ${key}`);
    }
  }
  console.log('✅ Configuration validée');
}

// Démarrage du détecteur
async function startGiftDetector() {
  try {
    console.log('🎁 Démarrage du détecteur de VRAIS gifts Telegram...');
    console.log('==================================================');
    
    validateConfig();
    console.log(`📱 Compte de dépôt: ${GIFT_DETECTOR_CONFIG.depositAccountUsername}`);
    console.log(`🌐 Webhook: ${GIFT_DETECTOR_CONFIG.webhookUrl}`);
    console.log('==================================================');
    
    // Créer et démarrer le détecteur
    const giftDetector = new TelegramGiftDetector(GIFT_DETECTOR_CONFIG);
    await giftDetector.start();
    
    console.log('🎯 Détecteur de gifts Telegram démarré avec succès !');
    
    // Gestion de l'arrêt propre
    process.on('SIGINT', async () => {
      console.log('\n🛑 Arrêt du détecteur...');
      await giftDetector.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Arrêt du détecteur...');
      await giftDetector.stop();
      process.exit(0);
    });
    
    // Vérification périodique de la santé du service
    setInterval(() => {
      if (giftDetector.isRunning) {
        console.log('💚 Service en cours d\'exécution...');
      } else {
        console.log('⚠️ Service arrêté, redémarrage...');
        startGiftDetector();
      }
    }, 30000); // Vérification toutes les 30 secondes
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error.message);
    console.log('🔄 Redémarrage dans 5 secondes...');
    setTimeout(startGiftDetector, 5000);
  }
}

// Démarrer le détecteur
startGiftDetector();
