// start-production.cjs
// Script de démarrage optimisé pour la production

const TelegramGiftDetector = require('./services/telegramGiftDetector.cjs');
const TelegramInventoryBot = require('./services/telegramInventoryBot.cjs');
const VirtualInventoryManager = require('./services/virtualInventoryManager.cjs');
const config = require('./config.cjs');

class ProductionSystem {
  constructor() {
    this.giftDetector = null;
    this.inventoryBot = null;
    this.virtualInventory = new VirtualInventoryManager();
    this.isRunning = false;
    this.startTime = null;
    this.healthCheckInterval = null;
  }

  // Démarrer le système complet
  async start() {
    try {
      console.log('🚀 DÉMARRAGE DU SYSTÈME DE PRODUCTION');
      console.log('========================================');
      console.log('🎁 Détecteur de gifts (@WxyzCrypto)');
      console.log('🤖 Bot d\'inventaire (@testnftbuybot)');
      console.log('📱 Synchronisation Supabase en temps réel');
      console.log('========================================\n');

      // Validation de la configuration
      await this.validateConfiguration();
      
      // Initialisation des composants
      await this.initializeComponents();
      
      // Démarrage des services
      await this.startServices();
      
      // Configuration du monitoring
      this.setupMonitoring();
      
      // Gestion de l'arrêt propre
      this.setupGracefulShutdown();
      
      console.log('\n🎉 SYSTÈME DE PRODUCTION DÉMARRÉ AVEC SUCCÈS !');
      console.log('==================================================');
      console.log('✅ Détecteur de gifts actif');
      console.log('✅ Bot d\'inventaire actif');
      console.log('✅ Synchronisation Supabase active');
      console.log('✅ Monitoring et health checks actifs');
      console.log('==================================================');
      
      this.isRunning = true;
      this.startTime = new Date();
      
    } catch (error) {
      console.error('💥 Erreur lors du démarrage:', error);
      process.exit(1);
    }
  }

  // Valider la configuration
  async validateConfiguration() {
    console.log('🔍 VALIDATION DE LA CONFIGURATION...');
    
    const requiredFields = [
      'telegramApiId', 'telegramApiHash', 'telegramSessionString',
      'botToken', 'webhookUrl', 'depositAccountUsername'
    ];
    
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Configuration manquante: ${field}`);
      }
    }
    
    console.log('✅ Configuration validée avec succès');
  }

  // Initialiser les composants
  async initializeComponents() {
    console.log('\n🔧 INITIALISATION DES COMPOSANTS...');
    
    // Initialiser le détecteur de gifts
    this.giftDetector = new TelegramGiftDetector(config, this.virtualInventory);
    
    // Initialiser le bot d'inventaire SANS virtualInventory pour éviter les conflits
    this.inventoryBot = new TelegramInventoryBot(config, null);
    
    console.log('✅ Composants initialisés');
  }

  // Démarrer les services
  async startServices() {
    console.log('\n🚀 DÉMARRAGE DES SERVICES...');
    
    // Démarrer le détecteur de gifts
    console.log('🎁 Démarrage du détecteur de gifts...');
    await this.giftDetector.start();
    console.log('✅ Détecteur de gifts démarré');
    
    // Démarrer le bot d'inventaire
    console.log('🤖 Démarrage du bot d\'inventaire...');
    await this.inventoryBot.start();
    console.log('✅ Bot d\'inventaire démarré');
  }

  // Configuration du monitoring
  setupMonitoring() {
    console.log('\n📊 CONFIGURATION DU MONITORING...');
    
    // Health check toutes les 30 secondes
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);
    
    console.log('✅ Monitoring configuré (health checks toutes les 30s)');
  }

  // Effectuer un health check
  async performHealthCheck() {
    try {
      const now = new Date();
      const uptime = Math.floor((now - this.startTime) / 1000);
      
      console.log(`\n💚 HEALTH CHECK [${now.toLocaleTimeString()}]`);
      console.log(`   ⏱️  Uptime: ${uptime}s`);
      console.log(`   🎁 Détecteur: ${this.giftDetector?.isRunning ? '✅' : '❌'}`);
      console.log(`   🤖 Bot: ${this.inventoryBot?.isRunning ? '✅' : '❌'}`);
      
      // Vérifier la connexion Supabase et compter les gifts
      try {
        const { SupabaseInventoryManager } = require('./lib/supabase.cjs');
        // Compter tous les gifts actifs dans la base au lieu d'un utilisateur test
        const totalGifts = await SupabaseInventoryManager.getTotalActiveGifts();
        console.log(`   🗄️  Supabase: ✅ (${totalGifts} gifts actifs au total)`);
      } catch (error) {
        console.log(`   🗄️  Supabase: ❌ (${error.message})`);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du health check:', error.message);
    }
  }

  // Configuration de l'arrêt propre
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n🛑 Signal ${signal} reçu - Arrêt en cours...`);
      
      this.isRunning = false;
      
      // Arrêter le monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      // Arrêter les services
      if (this.giftDetector) {
        await this.giftDetector.stop();
      }
      
      if (this.inventoryBot) {
        await this.inventoryBot.stop();
      }
      
      console.log('✅ Arrêt propre terminé');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  // Obtenir le statut du système
  async getStatus() {
    let totalGifts = 0;
    
    try {
      const { SupabaseInventoryManager } = require('./lib/supabase.cjs');
      // Compter tous les gifts actifs dans la base au lieu d'un utilisateur test
      totalGifts = await SupabaseInventoryManager.getTotalActiveGifts();
    } catch (error) {
      console.log(`   🗄️  Erreur Supabase dans getStatus: ${error.message}`);
    }
    
    return {
      isRunning: this.isRunning,
      startTime: this.startTime,
      uptime: this.startTime ? Math.floor((new Date() - this.startTime) / 1000) : 0,
      giftDetector: this.giftDetector?.isRunning || false,
      inventoryBot: this.inventoryBot?.isRunning || false,
      totalGifts: totalGifts
    };
  }
}

// Démarrer le système de production
async function main() {
  const system = new ProductionSystem();
  await system.start();
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('💥 Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesse rejetée non gérée:', reason);
  process.exit(1);
});

// Démarrer le système
main();
