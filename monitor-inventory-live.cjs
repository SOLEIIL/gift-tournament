// monitor-inventory-live.cjs
// Surveillance en temps réel de l'inventaire pour voir la synchronisation live

const { SupabaseInventoryManager, supabase } = require('./lib/supabase.cjs');

class LiveInventoryMonitor {
  constructor(telegramId, username) {
    this.telegramId = telegramId;
    this.username = username;
    this.lastInventoryCount = 0;
    this.lastInventoryHash = '';
    this.isMonitoring = false;
  }

  // Générer un hash de l'inventaire pour détecter les changements
  generateInventoryHash(inventory) {
    return JSON.stringify(inventory.map(item => ({
      id: item.id,
      status: item.status,
      gift_name: item.gifts?.gift_name,
      received_at: item.received_at
    }))).hashCode();
  }

  // Démarrer la surveillance
  async startMonitoring() {
    console.log(`🔍 DÉMARRAGE DE LA SURVEILLANCE EN TEMPS RÉEL`);
    console.log(`👤 Utilisateur: @${this.username} (${this.telegramId})`);
    console.log(`⏰ Démarré à: ${new Date().toLocaleTimeString()}`);
    console.log('================================================');
    
    this.isMonitoring = true;
    
    // Première vérification
    await this.checkInventory();
    
    // Surveillance continue toutes les 3 secondes
    this.monitorInterval = setInterval(async () => {
      if (this.isMonitoring) {
        await this.checkInventory();
      }
    }, 3000);
  }

  // Arrêter la surveillance
  stopMonitoring() {
    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    console.log('\n🛑 Surveillance arrêtée');
  }

  // Vérifier l'inventaire
  async checkInventory() {
    try {
      const inventory = await SupabaseInventoryManager.getUserInventory(this.telegramId);
      const currentCount = inventory.length;
      const currentHash = this.generateInventoryHash(inventory);
      
      const timestamp = new Date().toLocaleTimeString();
      
      // Détecter les changements
      if (currentCount !== this.lastInventoryCount || currentHash !== this.lastInventoryHash) {
        console.log(`\n🔄 [${timestamp}] CHANGEMENT DÉTECTÉ !`);
        
        if (currentCount > this.lastInventoryCount) {
          console.log(`📥 NOUVEAU GIFT AJOUTÉ !`);
          const newGifts = inventory.filter(item => 
            !this.lastInventoryHash.includes(item.id.toString())
          );
          newGifts.forEach(gift => {
            console.log(`   🎁 ${gift.gifts.gift_name} - ${gift.gifts.gift_value} stars`);
          });
        } else if (currentCount < this.lastInventoryCount) {
          console.log(`📤 GIFT RETIRÉ !`);
          console.log(`   📊 Inventaire: ${this.lastInventoryCount} → ${currentCount} gifts`);
        } else {
          console.log(`🔄 MODIFICATION D'ÉTAT DÉTECTÉE`);
        }
        
        // Afficher l'inventaire actuel
        this.displayInventory(inventory, timestamp);
        
        // Mettre à jour les références
        this.lastInventoryCount = currentCount;
        this.lastInventoryHash = currentHash;
        
      } else {
        // Aucun changement
        process.stdout.write(`\r[${timestamp}] Surveillance active - ${currentCount} gifts actifs`);
      }
      
    } catch (error) {
      console.error(`\n❌ Erreur lors de la vérification:`, error.message);
    }
  }

  // Afficher l'inventaire
  displayInventory(inventory, timestamp) {
    console.log(`\n📦 INVENTAIRE ACTUEL [${timestamp}]:`);
    console.log('=====================================');
    
    if (inventory.length === 0) {
      console.log('   📭 Aucun gift actif');
    } else {
      inventory.forEach((item, index) => {
        const status = item.status === 'active' ? '🟢' : '🔴';
        const gift = item.gifts;
        console.log(`   ${index + 1}. ${status} ${gift.gift_name}`);
        console.log(`      💎 Valeur: ${gift.gift_value} stars`);
        console.log(`      📅 Reçu: ${new Date(item.received_at).toLocaleString()}`);
        if (item.withdrawn_at) {
          console.log(`      🚫 Retiré: ${new Date(item.withdrawn_at).toLocaleString()}`);
        }
        console.log('');
      });
    }
    
    console.log(`📊 Total: ${inventory.length} gifts actifs`);
    console.log('=====================================');
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 MONITEUR D\'INVENTAIRE EN TEMPS RÉEL');
    console.log('========================================');
    
    // Créer le moniteur pour l'utilisateur de test
    const monitor = new LiveInventoryMonitor('123456789', 'testuser');
    
    // Démarrer la surveillance
    await monitor.startMonitoring();
    
    console.log('\n💡 INSTRUCTIONS POUR LE TEST:');
    console.log('1. Ouvrez un autre terminal');
    console.log('2. Exécutez: node test-withdraw-sync.cjs');
    console.log('3. Regardez les changements en temps réel ici !');
    console.log('\n⏳ Surveillance en cours... (Ctrl+C pour arrêter)');
    
    // Gestion de l'arrêt propre
    process.on('SIGINT', () => {
      monitor.stopMonitoring();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

// Ajouter la méthode hashCode à String
String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

// Démarrer le moniteur
main();
