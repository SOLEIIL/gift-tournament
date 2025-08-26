#!/usr/bin/env node

// start-integrated-system.js
require('dotenv').config();
const TelegramGiftDetector = require('./services/telegramGiftDetector.cjs');
const TelegramInventoryBot = require('./services/telegramInventoryBot');

// Configuration intégrée
const INTEGRATED_CONFIG = {
  // Configuration Telegram API
  telegramApiId: process.env.TELEGRAM_API_ID,
  telegramApiHash: process.env.TELEGRAM_API_HASH,
  telegramSessionString: process.env.TELEGRAM_SESSION_STRING,
  
  // Configuration du compte de dépôt
  depositAccountUsername: process.env.DEPOSIT_ACCOUNT_USERNAME || 'WxyzCrypto',
  
  // Configuration du bot
  botToken: process.env.BOT_TOKEN || '8332843535:AAGGqSeCR0zO2hie_2G-nwCAdl6w0iGoqf4',
  
  // Configuration webhook
  webhookUrl: process.env.WEBHOOK_URL || 'https://gift-tournament-git-main-soleiils-projects.vercel.app/api/deposit-webhook',
  webhookSecret: process.env.WEBHOOK_SECRET || 'wxyz-webhook-secret-2024',
  apiKey: process.env.DEPOSIT_API_KEY || 'wxyz-crypto-secure-key-2024'
};

// Vérification de la configuration
function validateConfig() {
  const requiredVars = [
    'TELEGRAM_API_ID',
    'TELEGRAM_API_HASH',
    'TELEGRAM_SESSION_STRING',
    'BOT_TOKEN'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:', missing.join(', '));
    console.error('💡 Vérifiez votre fichier .env');
    process.exit(1);
  }
  
  console.log('✅ Configuration validée');
  console.log(`🤖 Bot Token: ${INTEGRATED_CONFIG.botToken.substring(0, 10)}...`);
  console.log(`📱 Compte de dépôt: @${INTEGRATED_CONFIG.depositAccountUsername}`);
}

// Fonction principale
async function startIntegratedSystem() {
  try {
    console.log('🚀 Démarrage du Système Intégré de Gestion des Gifts...');
    console.log('=' .repeat(60));
    
    // Valider la configuration
    validateConfig();
    
    // Créer les instances
    console.log('\n🔧 Initialisation des services...');
    
    // 1. Détecteur de gifts
    console.log('📡 Initialisation du détecteur de gifts...');
    const giftDetector = new TelegramGiftDetector({
      telegramApiId: INTEGRATED_CONFIG.telegramApiId,
      telegramApiHash: INTEGRATED_CONFIG.telegramApiHash,
      telegramSessionString: INTEGRATED_CONFIG.telegramSessionString,
      depositAccountUsername: INTEGRATED_CONFIG.depositAccountUsername,
      webhookUrl: INTEGRATED_CONFIG.webhookUrl,
      webhookSecret: INTEGRATED_CONFIG.webhookSecret,
      apiKey: INTEGRATED_CONFIG.apiKey
    });
    
    // 2. Bot d'inventaire
    console.log('🤖 Initialisation du bot d\'inventaire...');
    const inventoryBot = new TelegramInventoryBot({
      botToken: INTEGRATED_CONFIG.botToken,
      depositAccountUsername: INTEGRATED_CONFIG.depositAccountUsername
    });
    
    // Démarrer les services
    console.log('\n🚀 Démarrage des services...');
    
    // Démarrer le détecteur
    console.log('📡 Démarrage du détecteur de gifts...');
    await giftDetector.start();
    
    // Démarrer le bot
    console.log('🤖 Démarrage du bot d\'inventaire...');
    await inventoryBot.start();
    
    // Intégrer les services
    console.log('\n🔗 Intégration des services...');
    
    // Modifier le détecteur pour qu'il communique avec le bot
    const originalProcessGiftMessage = giftDetector.processGiftMessage.bind(giftDetector);
    const originalProcessWithdrawMessage = giftDetector.processWithdrawMessage.bind(giftDetector);
    
    // Override pour intégrer avec le bot
    giftDetector.processGiftMessage = async function(message) {
      try {
        // Appeler la méthode originale
        await originalProcessGiftMessage(message);
        
        // Extraire les données du gift
        const giftInfo = this.extractGiftInfo(message);
        const senderId = this.extractSenderId(message);
        const senderUsername = this.extractSenderUsername(message);
        
        // Créer l'objet de données pour le bot
        const giftData = {
          giftId: message.id.toString(),
          giftName: giftInfo.giftName,
          giftValue: giftInfo.giftValue || 25,
          giftType: giftInfo.giftType || 'star_gift_unique',
          collectibleId: giftInfo.collectibleId,
          collectibleModel: giftInfo.collectibleModel,
          collectibleBackdrop: giftInfo.collectibleBackdrop,
          collectibleSymbol: giftInfo.collectibleSymbol,
          fromUserId: senderId,
          fromUsername: senderUsername,
          telegramMessageId: message.id
        };
        
        // Ajouter à l'inventaire via le bot
        await inventoryBot.processGiftFromDetector(giftData);
        
        console.log(`✅ Gift ${giftInfo.giftName} intégré avec le bot pour @${senderUsername}`);
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'intégration du gift avec le bot:', error);
      }
    };
    
    giftDetector.processWithdrawMessage = async function(message) {
      try {
        // Appeler la méthode originale
        await originalProcessWithdrawMessage(message);
        
        // Extraire les données du gift
        const giftInfo = this.extractGiftInfo(message);
        const recipientId = this.extractRecipientId(message);
        const recipientUsername = this.extractRecipientUsername(message);
        
        // Créer l'objet de données pour le bot
        const giftData = {
          giftId: message.id.toString(),
          giftName: giftInfo.giftName,
          giftValue: giftInfo.giftValue || 25,
          giftType: giftInfo.giftType || 'star_gift_unique',
          collectibleId: giftInfo.collectibleId,
          collectibleModel: giftInfo.collectibleModel,
          collectibleBackdrop: giftInfo.collectibleBackdrop,
          collectibleSymbol: giftInfo.collectibleSymbol,
          toUserId: recipientId,
          toUsername: recipientUsername,
          telegramMessageId: message.id
        };
        
        // Retirer de l'inventaire via le bot
        await inventoryBot.processWithdrawFromDetector(giftData);
        
        console.log(`✅ Withdraw ${giftInfo.giftName} intégré avec le bot pour @${recipientUsername}`);
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'intégration du withdraw avec le bot:', error);
      }
    };
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Système Intégré démarré avec succès !');
    console.log('🎯 Détection automatique des gifts en cours...');
    console.log('🤖 Bot d\'inventaire actif');
    console.log('📱 Compte de dépôt: @' + INTEGRATED_CONFIG.depositAccountUsername);
    console.log('🌐 Webhook: ' + INTEGRATED_CONFIG.webhookUrl);
    console.log('=' .repeat(60));
    
    // Instructions de test
    console.log('\n🧪 **POUR TESTER LE SYSTÈME :**');
    console.log('1. 📱 Ouvrez Telegram');
    console.log('2. 🎁 Envoyez un gift à @' + INTEGRATED_CONFIG.depositAccountUsername);
    console.log('3. 🤖 Contactez votre bot @testnftbuybot');
    console.log('4. 📦 Utilisez /inventory pour voir votre inventaire');
    console.log('5. 🗑️ Utilisez /withdraw pour retirer un gift');
    console.log('6. 📊 Utilisez /stats pour voir vos statistiques');
    
    // Gérer l'arrêt gracieux
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Arrêt du système intégré...');
      
      try {
        await giftDetector.stop();
        await inventoryBot.stop();
        console.log('✅ Système arrêté proprement');
      } catch (error) {
        console.error('❌ Erreur lors de l\'arrêt:', error);
      }
      
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Arrêt du système intégré...');
      
      try {
        await giftDetector.stop();
        await inventoryBot.stop();
        console.log('✅ Système arrêté proprement');
      } catch (error) {
        console.error('❌ Erreur lors de l\'arrêt:', error);
      }
      
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n❌ Erreur lors du démarrage du système intégré:', error);
    console.error('\n🔧 Vérifiez votre configuration et redémarrez.');
    process.exit(1);
  }
}

// Démarrer le système
startIntegratedSystem();
