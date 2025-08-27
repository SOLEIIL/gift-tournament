// start-app.cjs
// Script de démarrage complet : Application web + Détecteur de gifts

const { spawn } = require('child_process');
const path = require('path');

class AppLauncher {
  constructor() {
    this.webProcess = null;
    this.giftSystemProcess = null;
    this.isRunning = false;
  }

  // Démarrer l'application complète
  async start() {
    try {
      console.log('🚀 DÉMARRAGE DE L\'APPLICATION COMPLÈTE');
      console.log('========================================');
      console.log('🌐 Application web (Vite)');
      console.log('🎁 Système de détection de gifts');
      console.log('📱 Synchronisation Supabase en temps réel');
      console.log('========================================\n');

      // Démarrer l'application web
      await this.startWebApp();
      
      // Démarrer le système de gifts
      await this.startGiftSystem();
      
      this.isRunning = true;
      
      console.log('\n🎉 APPLICATION COMPLÈTE DÉMARRÉE !');
      console.log('====================================');
      console.log('✅ Application web accessible sur http://localhost:5173');
      console.log('✅ Détecteur de gifts actif');
      console.log('✅ Synchronisation Supabase active');
      console.log('====================================');
      
      // Configuration de l'arrêt propre
      this.setupGracefulShutdown();
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error);
      await this.stop();
      process.exit(1);
    }
  }

  // Démarrer l'application web
  async startWebApp() {
    console.log('🌐 DÉMARRAGE DE L\'APPLICATION WEB...');
    
    return new Promise((resolve, reject) => {
      // Démarrer Vite en mode dev
      this.webProcess = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        shell: true
      });

      this.webProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[WEB] ${output.trim()}`);
        
        // Détecter quand l'app est prête
        if (output.includes('Local:') || output.includes('ready in')) {
          console.log('✅ Application web démarrée avec succès !');
          resolve();
        }
      });

      this.webProcess.stderr.on('data', (data) => {
        console.error(`[WEB ERROR] ${data.toString().trim()}`);
      });

      this.webProcess.on('error', (error) => {
        console.error('❌ Erreur lors du démarrage de l\'app web:', error);
        reject(error);
      });

      this.webProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ Application web fermée avec le code ${code}`);
        }
      });

      // Timeout de sécurité
      setTimeout(() => {
        if (!this.isRunning) {
          console.log('✅ Application web considérée comme démarrée (timeout)');
          resolve();
        }
      }, 10000);
    });
  }

  // Démarrer le système de gifts
  async startGiftSystem() {
    console.log('\n🎁 DÉMARRAGE DU SYSTÈME DE GIFTS...');
    
    return new Promise((resolve, reject) => {
      // Démarrer le système de production
      this.giftSystemProcess = spawn('node', ['start-production.cjs'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        shell: true
      });

      this.giftSystemProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[GIFTS] ${output.trim()}`);
        
        // Détecter quand le système est prêt
        if (output.includes('SYSTÈME DE PRODUCTION DÉMARRÉ AVEC SUCCÈS')) {
          console.log('✅ Système de gifts démarré avec succès !');
          resolve();
        }
      });

      this.giftSystemProcess.stderr.on('data', (data) => {
        console.error(`[GIFTS ERROR] ${data.toString().trim()}`);
      });

      this.giftSystemProcess.on('error', (error) => {
        console.error('❌ Erreur lors du démarrage du système de gifts:', error);
        reject(error);
      });

      this.giftSystemProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ Système de gifts fermé avec le code ${code}`);
        }
      });

      // Timeout de sécurité
      setTimeout(() => {
        if (!this.isRunning) {
          console.log('✅ Système de gifts considéré comme démarré (timeout)');
          resolve();
        }
      }, 15000);
    });
  }

  // Arrêter l'application
  async stop() {
    try {
      console.log('\n🛑 ARRÊT DE L\'APPLICATION...');
      
      if (this.webProcess) {
        this.webProcess.kill('SIGTERM');
        console.log('✅ Application web arrêtée');
      }
      
      if (this.giftSystemProcess) {
        this.giftSystemProcess.kill('SIGTERM');
        console.log('✅ Système de gifts arrêté');
      }
      
      this.isRunning = false;
      console.log('🛑 Application arrêtée proprement');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt:', error);
    }
  }

  // Configuration de l'arrêt propre
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n🛑 Signal ${signal} reçu - Arrêt en cours...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}

// Démarrer l'application
const launcher = new AppLauncher();
launcher.start().catch(async (error) => {
  console.error('💥 Erreur fatale:', error);
  await launcher.stop();
  process.exit(1);
});
