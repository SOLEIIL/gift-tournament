#!/usr/bin/env node

// start-deposit-service.cjs
require('dotenv').config();
const TelegramMonitor = require('./services/telegramMonitor.cjs');

// Configuration du service de dépôt
const DEPOSIT_CONFIG = {
  telegramApiId: process.env.TELEGRAM_API_ID,
  telegramApiHash: process.env.TELEGRAM_API_HASH,
  telegramSessionString: process.env.TELEGRAM_SESSION_STRING,
  depositAccountUsername: process.env.DEPOSIT_ACCOUNT_USERNAME,
  webhookUrl: process.env.WEBHOOK_URL,
  webhookSecret: process.env.WEBHOOK_SECRET,
  apiKey: process.env.DEPOSIT_API_KEY,
  minTransferValue: parseInt(process.env.MIN_TRANSFER_VALUE) || 1,
  maxTransferValue: parseInt(process.env.MAX_TRANSFER_VALUE) || 10000,
  autoConfirm: process.env.AUTO_CONFIRM === 'true',
  confirmationDelay: parseInt(process.env.CONFIRMATION_DELAY) || 30
};

// Vérification de la configuration
function validateConfig() {
  const required = ['telegramApiId', 'telegramApiHash', 'telegramSessionString', 'depositAccountUsername'];
  const missing = required.filter(key => !DEPOSIT_CONFIG[key]);
  
  if (missing.length > 0) {
    console.error('❌ Configuration manquante:', missing.join(', '));
    process.exit(1);
  }
  
  console.log('✅ Configuration validée');
  console.log(`📱 Compte de dépôt: @${DEPOSIT_CONFIG.depositAccountUsername}`);
  console.log(`🌐 Webhook: ${DEPOSIT_CONFIG.webhookUrl}`);
}

// Fonction principale
async function startDepositService() {
  try {
    console.log('🚀 Démarrage du service de dépôt @WxyzCrypto...');
    console.log('=' .repeat(50));
    
    // Valider la configuration
    validateConfig();
    
    // Démarrer le moniteur Telegram
    console.log('\n🤖 Démarrage du moniteur Telegram...');
    const monitor = new TelegramMonitor(DEPOSIT_CONFIG);
    await monitor.start();
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Service de dépôt démarré avec succès !');
    console.log('🎯 Surveillance active des gifts sur @WxyzCrypto');
    console.log('📱 Compte de dépôt: @' + DEPOSIT_CONFIG.depositAccountUsername);
    console.log('🌐 Webhook: ' + DEPOSIT_CONFIG.webhookUrl);
    console.log('=' .repeat(50));
    
    // Instructions de test
    console.log('\n🧪 POUR TESTER :');
    console.log('1. Ouvrez Telegram');
    console.log('2. Contactez @WxyzCrypto');
    console.log('3. Envoyez "gift 5" ou 🎁');
    console.log('4. Regardez les logs ci-dessus');
    
    // Gérer l'arrêt gracieux
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Arrêt du service...');
      await monitor.stop();
      console.log('✅ Service arrêté proprement');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Arrêt du service...');
      await monitor.stop();
      console.log('✅ Service arrêté proprement');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n❌ Erreur lors du démarrage:', error);
    console.error('\n🔧 Vérifiez votre configuration et redémarrez.');
    process.exit(1);
  }
}

// Démarrer le service
startDepositService();
