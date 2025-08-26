#!/usr/bin/env node

// start-bot-service.js
require('dotenv').config();
const TelegramBotMonitor = require('./services/telegramBotMonitor');

// Configuration simple avec le bot
const BOT_CONFIG = {
  botToken: process.env.BOT_TOKEN || '8332843535:AAGGqSeCR0zO2hie_2G-nwCAdl6w0iGoqf4',
  depositAccountUsername: 'WxyzCrypto',
  webhookUrl: process.env.WEBHOOK_URL || 'https://gift-tournament-git-main-soleiils-projects.vercel.app/api/deposit-webhook',
  webhookSecret: process.env.WEBHOOK_SECRET || 'wxyz-webhook-secret-2024',
  apiKey: process.env.DEPOSIT_API_KEY || 'wxyz-crypto-secure-key-2024'
};

// Vérification de la configuration
function validateConfig() {
  if (!BOT_CONFIG.botToken) {
    console.error('❌ BOT_TOKEN manquant dans le fichier .env');
    process.exit(1);
  }
  
  console.log('✅ Configuration validée');
  console.log(`🤖 Bot Token: ${BOT_CONFIG.botToken.substring(0, 10)}...`);
}

// Fonction principale
async function startBotService() {
  try {
    console.log('🚀 Démarrage du service Bot Telegram @WxyzCrypto...');
    console.log('=' .repeat(50));
    
    // Valider la configuration
    validateConfig();
    
    // Démarrer le moniteur Bot
    console.log('\n🤖 Démarrage du moniteur Bot Telegram...');
    const monitor = new TelegramBotMonitor(BOT_CONFIG);
    await monitor.start();
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Service Bot démarré avec succès !');
    console.log('🎯 Surveillance active des gifts via Bot API');
    console.log('📱 Compte de dépôt: @WxyzCrypto');
    console.log('🌐 Webhook: ' + BOT_CONFIG.webhookUrl);
    console.log('=' .repeat(50));
    
    // Instructions de test
    console.log('\n🧪 POUR TESTER :');
    console.log('1. Ouvrez Telegram');
    console.log('2. Contactez votre bot');
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
startBotService();

