#!/usr/bin/env node

// start-deposit-service.js
require('dotenv').config();
const TelegramMonitor = require('./services/telegramMonitor');
const DepositService = require('./src/services/depositService');

// Configuration du service de dépôt
const DEPOSIT_CONFIG = {
  // Compte de dépôt
  depositAccountUsername: 'WxyzCrypto',
  depositAccountPhone: process.env.DEPOSIT_ACCOUNT_PHONE || '+1234567890',
  
  // API Telegram
  apiId: process.env.TELEGRAM_API_ID,
  apiHash: process.env.TELEGRAM_API_HASH,
  sessionString: process.env.TELEGRAM_SESSION_STRING,
  
  // Webhook
  webhookUrl: process.env.WEBHOOK_URL || 'https://gift-tournament-git-main-soleiils-projects.vercel.app/api/deposit-webhook',
  webhookSecret: process.env.WEBHOOK_SECRET || 'wxyz-webhook-secret-2024',
  apiKey: process.env.DEPOSIT_API_KEY || 'wxyz-crypto-secure-key-2024',
  
  // Limites
  minTransferValue: parseInt(process.env.MIN_TRANSFER_VALUE) || 1,
  maxTransferValue: parseInt(process.env.MAX_TRANSFER_VALUE) || 10000,
  autoConfirm: process.env.AUTO_CONFIRM === 'true',
  confirmationDelay: parseInt(process.env.CONFIRMATION_DELAY) || 30
};

// Vérification de la configuration
function validateConfig() {
  const required = ['TELEGRAM_API_ID', 'TELEGRAM_API_HASH', 'TELEGRAM_SESSION_STRING'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nVeuillez créer un fichier .env avec ces variables.');
    process.exit(1);
  }
  
  console.log('✅ Configuration validée');
}

// Fonction principale
async function startDepositService() {
  try {
    console.log('🚀 Démarrage du service de dépôt @WxyzCrypto...');
    console.log('=' .repeat(50));
    
    // Valider la configuration
    validateConfig();
    
    // Démarrer le moniteur Telegram
    console.log('\n📱 Démarrage du moniteur Telegram...');
    const monitor = new TelegramMonitor(DEPOSIT_CONFIG);
    await monitor.start();
    
    // Initialiser le service de dépôt
    console.log('\n🎁 Initialisation du service de dépôt...');
    const depositService = new DepositService(DEPOSIT_CONFIG);
    await depositService.initialize();
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Service de dépôt démarré avec succès !');
    console.log('🎯 Surveillance active des transferts de gifts');
    console.log('📱 Compte de dépôt: @WxyzCrypto');
    console.log('🌐 Webhook: ' + DEPOSIT_CONFIG.webhookUrl);
    console.log('=' .repeat(50));
    
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
