// start-gift-system.cjs
// Démarrage du système complet de détection et synchronisation des gifts
require('dotenv').config();

const TelegramGiftDetector = require('./services/telegramGiftDetector.cjs');
const TelegramInventoryBot = require('./services/telegramInventoryBot.cjs');

// Configuration du système
const config = require('./config.cjs');
const SYSTEM_CONFIG = {
  // Configuration Telegram Gift Detector (@WxyzCrypto)
  telegramApiId: config.telegramApiId,
  telegramApiHash: config.telegramApiHash,
  telegramSessionString: config.telegramSessionString,
  depositAccountUsername: config.depositAccountUsername,
  
  // Configuration Webhook
  webhookUrl: config.webhookUrl,
  webhookSecret: config.webhookSecret,
  apiKey: config.apiKey,
  
  // Configuration Bot (@testnftbuybot)
  botToken: config.botToken
};

// Classe principale du système
class GiftSyncSystem {
  constructor() {
    this.giftDetector = null;
    this.inventoryBot = null;
    this.isRunning = false;
  }

  // Démarrer le système complet
  async start() {
    try {
      console.log('🚀 DÉMARRAGE DU SYSTÈME DE SYNCHRONISATION DES GIFTS');
      console.log('=====================================================');
      console.log('🎁 Détecteur de gifts (@WxyzCrypto)');
      console.log('🤖 Bot d\'inventaire (@testnftbuybot)');
      console.log('📱 Synchronisation en temps réel');
      console.log('=====================================================\n');

      // Validation de la configuration
      this.validateConfig();
      
      // Démarrer le détecteur de gifts
      console.log('🎁 DÉMARRAGE DU DÉTECTEUR DE GIFTS...');
      this.giftDetector = new TelegramGiftDetector(SYSTEM_CONFIG);
      await this.giftDetector.start();
      console.log('✅ Détecteur de gifts démarré avec succès !\n');

      // Démarrer le bot d'inventaire avec l'inventaire partagé
      console.log('🤖 DÉMARRAGE DU BOT D\'INVENTAIRE...');
      this.inventoryBot = new TelegramInventoryBot(
        SYSTEM_CONFIG, 
        this.giftDetector.virtualInventory
      );
      await this.inventoryBot.start();
      console.log('✅ Bot d\'inventaire démarré avec succès !\n');

      this.isRunning = true;
      
      console.log('🎉 SYSTÈME COMPLET DÉMARRÉ AVEC SUCCÈS !');
      console.log('=====================================================');
      console.log('🎁 Détecteur actif - Surveille les gifts de @WxyzCrypto');
      console.log('🤖 Bot actif - Gère les inventaires des utilisateurs');
      console.log('📱 Synchronisation - Mise à jour en temps réel');
      console.log('=====================================================');
      console.log('🚀 PRÊT POUR LA PRODUCTION !');
      console.log('=====================================================');
      console.log('📱 ENVOYEZ MAINTENANT VOTRE GIFT :');
      console.log('1. Ouvrez Telegram sur votre téléphone');
      console.log('2. Contactez @WxyzCrypto');
      console.log('3. Envoyez un VRAI gift Telegram (25+ stars)');
      console.log('4. Le gift sera détecté et synchronisé !');
      console.log('=====================================================');

      // Gestion de l'arrêt propre
      this.setupGracefulShutdown();
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage du système:', error);
      await this.stop();
      process.exit(1);
    }
  }

  // Arrêter le système
  async stop() {
    try {
      console.log('\n🛑 ARRÊT DU SYSTÈME...');
      
      if (this.giftDetector) {
        await this.giftDetector.stop();
        console.log('✅ Détecteur de gifts arrêté');
      }
      
      if (this.inventoryBot) {
        await this.inventoryBot.stop();
        console.log('✅ Bot d\'inventaire arrêté');
      }
      
      this.isRunning = false;
      console.log('🛑 Système arrêté proprement');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt:', error);
    }
  }

  // Validation de la configuration
  validateConfig() {
    console.log('🔍 VALIDATION DE LA CONFIGURATION...');
    
    const required = [
      'telegramApiId',
      'telegramApiHash', 
      'telegramSessionString',
      'botToken'
    ];
    
    for (const key of required) {
      if (!SYSTEM_CONFIG[key]) {
        throw new Error(`Configuration manquante: ${key}`);
      }
    }
    
    console.log('✅ Configuration validée avec succès');
  }

  // Configuration de l'arrêt propre
  setupGracefulShutdown() {
    process.on('SIGINT', async () => {
      console.log('\n🛑 Signal SIGINT reçu...');
      await this.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Signal SIGTERM reçu...');
      await this.stop();
      process.exit(0);
    });

    process.on('uncaughtException', async (error) => {
      console.error('💥 Exception non gérée:', error);
      await this.stop();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('💥 Promesse rejetée non gérée:', reason);
      await this.stop();
      process.exit(1);
    });
  }
}

// Démarrer le système
const system = new GiftSyncSystem();
system.start().catch(async (error) => {
  console.error('💥 Erreur fatale du système:', error);
  await system.stop();
  process.exit(1);
});
