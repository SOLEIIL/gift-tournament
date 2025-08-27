// deploy-vercel.cjs
// Script de déploiement automatique vers Vercel

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class VercelDeployer {
  constructor() {
    this.projectName = 'gift-tournament';
    this.vercelUrl = 'https://vercel.com/soleiils-projects/gift-tournament/';
  }

  // Déployer vers Vercel
  async deploy() {
    try {
      console.log('🚀 DÉPLOIEMENT VERS VERCEL');
      console.log('============================');
      console.log(`📱 Projet: ${this.projectName}`);
      console.log(`🌐 URL: ${this.vercelUrl}`);
      console.log('============================\n');

      // Vérifier que Vercel CLI est installé
      await this.checkVercelCLI();
      
      // Construire l'application
      await this.buildApp();
      
      // Déployer
      await this.deployToVercel();
      
      console.log('\n🎉 DÉPLOIEMENT RÉUSSI !');
      console.log('============================');
      console.log(`✅ Application déployée sur Vercel`);
      console.log(`🌐 URL: ${this.vercelUrl}`);
      console.log('============================');
      
    } catch (error) {
      console.error('❌ Erreur lors du déploiement:', error.message);
      process.exit(1);
    }
  }

  // Vérifier Vercel CLI
  async checkVercelCLI() {
    console.log('🔍 Vérification de Vercel CLI...');
    
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI détecté');
    } catch (error) {
      console.log('📦 Installation de Vercel CLI...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI installé');
    }
  }

  // Construire l'application
  async buildApp() {
    console.log('\n🔨 Construction de l\'application...');
    
    try {
      // Installer les dépendances
      console.log('📦 Installation des dépendances...');
      execSync('npm install', { stdio: 'inherit' });
      
      // Construire l'application
      console.log('🏗️ Construction de l\'application...');
      execSync('npm run build', { stdio: 'inherit' });
      
      console.log('✅ Application construite avec succès');
      
    } catch (error) {
      throw new Error(`Erreur lors de la construction: ${error.message}`);
    }
  }

  // Déployer vers Vercel
  async deployToVercel() {
    console.log('\n🚀 Déploiement vers Vercel...');
    
    try {
      // Déployer en production
      execSync('vercel --prod --yes', { stdio: 'inherit' });
      
      console.log('✅ Déploiement terminé');
      
    } catch (error) {
      throw new Error(`Erreur lors du déploiement: ${error.message}`);
    }
  }

  // Obtenir le statut du déploiement
  async getStatus() {
    try {
      const status = execSync('vercel ls', { encoding: 'utf8' });
      console.log('📊 Statut des déploiements:');
      console.log(status);
    } catch (error) {
      console.log('❌ Impossible de récupérer le statut');
    }
  }
}

// Fonction principale
async function main() {
  const deployer = new VercelDeployer();
  
  // Vérifier les arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--status')) {
    await deployer.getStatus();
  } else {
    await deployer.deploy();
  }
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('💥 Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesse rejetée non gérée:', reason);
  process.exit(1);
});

// Démarrer le déploiement
main();
