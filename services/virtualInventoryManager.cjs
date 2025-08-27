// services/virtualInventoryManager.cjs
// Gestionnaire d'inventaire virtuel pour @WxyzCrypto

class VirtualInventoryManager {
  constructor() {
    // Inventaire virtuel : userId -> [gifts]
    this.virtualInventories = new Map();
    
    // Gifts reçus mais pas encore retirés
    this.pendingGifts = new Map();
    
    // Historique des transactions
    this.transactionHistory = [];
    
    console.log('🎯 Gestionnaire d\'inventaire virtuel initialisé');
  }

  // 🎁 AJOUTER UN GIFT REÇU (dépôt)
  addGiftReceived(giftData) {
    try {
      const { fromUserId, fromUsername, giftId, giftName, collectibleId, timestamp } = giftData;
      
      if (!fromUserId || fromUserId === 'unknown') {
        console.error('❌ Impossible d\'ajouter un gift sans ID utilisateur valide');
        return false;
      }

      // Créer l'entrée du gift
      const giftEntry = {
        giftId,
        giftName,
        collectibleId,
        timestamp,
        status: 'received',
        messageId: giftData.telegramMessageId,
        fromUsername
      };

      // Ajouter à l'inventaire virtuel de l'utilisateur
      if (!this.virtualInventories.has(fromUserId)) {
        this.virtualInventories.set(fromUserId, []);
      }
      
      this.virtualInventories.get(fromUserId).push(giftEntry);
      
      // Ajouter aux gifts en attente avec le messageId comme clé
      this.pendingGifts.set(giftData.telegramMessageId, {
        ...giftEntry,
        ownerUserId: fromUserId,
        ownerUsername: fromUsername
      });

      // Ajouter à l'historique
      this.transactionHistory.push({
        type: 'deposit',
        timestamp,
        giftId,
        fromUserId,
        fromUsername,
        giftName
      });

      console.log(`✅ Gift ajouté à l'inventaire virtuel de ${fromUsername} (${fromUserId})`);
      console.log(`   📦 ${giftName} (${collectibleId})`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du gift reçu:', error.message);
      return false;
    }
  }

  // 🚫 RETIRER UN GIFT (withdraw)
  removeGiftWithdrawn(giftData) {
    try {
      const { toUserId, toUsername, giftId, giftName, telegramMessageId } = giftData;
      
      if (!toUserId || toUserId === 'unknown') {
        console.error('❌ Impossible de retirer un gift sans ID utilisateur valide');
        return false;
      }

      // 🔍 CHERCHER LE GIFT PAR MESSAGEID (plus fiable)
      let pendingGift = null;
      let giftKey = null;
      
      // Essayer d'abord par telegramMessageId
      if (telegramMessageId) {
        pendingGift = this.pendingGifts.get(telegramMessageId.toString());
        if (pendingGift) {
          giftKey = telegramMessageId.toString();
          console.log(`✅ Gift trouvé par telegramMessageId: ${telegramMessageId}`);
        }
      }
      
      // Fallback: essayer par giftId
      if (!pendingGift && giftId) {
        pendingGift = this.pendingGifts.get(giftId);
        if (pendingGift) {
          giftKey = giftId;
          console.log(`✅ Gift trouvé par giftId: ${giftId}`);
        }
      }
      
      // Fallback: chercher par collectibleId et giftName
      if (!pendingGift) {
        for (const [key, gift] of this.pendingGifts) {
          if (gift.collectibleId === giftData.collectibleId && gift.giftName === giftName) {
            pendingGift = gift;
            giftKey = key;
            console.log(`✅ Gift trouvé par collectibleId: ${giftData.collectibleId}`);
            break;
          }
        }
      }
      
      if (!pendingGift) {
        console.warn(`⚠️ Gift ${giftName} (${giftData.collectibleId}) non trouvé dans les gifts en attente`);
        return false;
      }

      // Retirer de l'inventaire virtuel de l'utilisateur
      if (this.virtualInventories.has(toUserId)) {
        const userInventory = this.virtualInventories.get(toUserId);
        const giftIndex = userInventory.findIndex(gift => 
          gift.giftId === giftId || 
          gift.collectibleId === giftData.collectibleId ||
          gift.messageId === telegramMessageId
        );
        
        if (giftIndex !== -1) {
          userInventory.splice(giftIndex, 1);
          console.log(`✅ Gift retiré de l'inventaire virtuel de ${toUsername} (${toUserId})`);
        }
      }

      // Retirer des gifts en attente avec la bonne clé
      this.pendingGifts.delete(giftKey);

      // Ajouter à l'historique
      this.transactionHistory.push({
        type: 'withdraw',
        timestamp: new Date().toISOString(),
        giftId,
        toUserId,
        toUsername,
        giftName
      });

      console.log(`🚫 Gift retiré: ${giftName} de ${toUsername} (${toUserId})`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors du retrait du gift:', error.message);
      return false;
    }
  }

  // 📊 AFFICHER L'INVENTAIRE VIRTUEL D'UN UTILISATEUR
  getUserInventory(userId) {
    try {
      if (!this.virtualInventories.has(userId)) {
        return [];
      }
      
      return this.virtualInventories.get(userId);
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'inventaire:', error.message);
      return [];
    }
  }

  // 🔍 TROUVER UN UTILISATEUR PAR USERNAME
  findUserByUsername(username) {
    try {
      for (const [userId, inventory] of this.virtualInventories) {
        if (inventory.length > 0 && inventory[0].fromUsername === username) {
          return { userId, inventory };
        }
      }
      return null;
      
    } catch (error) {
      console.error('❌ Erreur lors de la recherche par username:', error.message);
      return null;
    }
  }

  // 📋 AFFICHER TOUS LES INVENTAIRES
  displayAllInventories() {
    try {
      console.log('\n🎯 INVENTAIRES VIRTUELS ACTUELS:');
      console.log('=====================================');
      
      if (this.virtualInventories.size === 0) {
        console.log('📭 Aucun inventaire virtuel trouvé');
        return;
      }

      for (const [userId, inventory] of this.virtualInventories) {
        if (inventory.length > 0) {
          const username = inventory[0].fromUsername || 'Unknown';
          console.log(`\n👤 ${username} (${userId}):`);
          console.log(`   📦 ${inventory.length} gift(s) en attente`);
          
          for (const gift of inventory) {
            console.log(`      • ${gift.giftName} (${gift.collectibleId}) - ${gift.timestamp}`);
          }
        }
      }

      console.log('\n📊 STATISTIQUES:');
      console.log(`   👥 Utilisateurs avec inventaire: ${this.virtualInventories.size}`);
      console.log(`   🎁 Gifts en attente: ${this.pendingGifts.size}`);
      console.log(`   📝 Transactions totales: ${this.transactionHistory.length}`);
      console.log('=====================================\n');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage des inventaires:', error.message);
    }
  }

  // 🔢 COMPTER LE TOTAL DES GIFTS
  getTotalGifts() {
    try {
      console.log(`🔍 DEBUG getTotalGifts: virtualInventories.size = ${this.virtualInventories.size}`);
      
      let total = 0;
      for (const [userId, inventory] of this.virtualInventories) {
        console.log(`🔍 DEBUG: userId ${userId} a ${inventory.length} gift(s)`);
        total += inventory.length;
      }
      
      console.log(`🔍 DEBUG getTotalGifts: total = ${total}`);
      return total;
    } catch (error) {
      console.error('❌ Erreur lors du comptage des gifts:', error.message);
      return 0;
    }
  }
  
  // 🔍 AFFICHER LES GIFTS EN ATTENTE
  displayPendingGifts() {
    try {
      console.log('\n⏳ GIFTS EN ATTENTE DE RETRAIT:');
      console.log('=====================================');
      
      if (this.pendingGifts.size === 0) {
        console.log('✅ Aucun gift en attente - tous les inventaires sont à jour !');
        return;
      }

      for (const [giftId, gift] of this.pendingGifts) {
        console.log(`\n🎁 ${gift.giftName} (${gift.collectibleId}):`);
        console.log(`   👤 Propriétaire: ${gift.ownerUsername} (${gift.ownerUserId})`);
        console.log(`   📅 Reçu le: ${gift.timestamp}`);
        console.log(`   📱 Message ID: ${gift.messageId}`);
      }

      console.log(`\n📊 Total: ${this.pendingGifts.size} gift(s) en attente de retrait`);
      console.log('=====================================\n');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage des gifts en attente:', error.message);
    }
  }

  // 💾 SAUVEGARDER L'ÉTAT (pour persistance)
  saveState() {
    try {
      const state = {
        virtualInventories: Object.fromEntries(this.virtualInventories),
        pendingGifts: Object.fromEntries(this.pendingGifts),
        transactionHistory: this.transactionHistory,
        lastUpdated: new Date().toISOString()
      };
      
      // Ici vous pourriez sauvegarder dans un fichier ou base de données
      console.log('💾 État sauvegardé');
      return state;
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error.message);
      return null;
    }
  }

  // 🔄 RESTAURER L'ÉTAT (pour persistance)
  restoreState(state) {
    try {
      if (state.virtualInventories) {
        this.virtualInventories = new Map(Object.entries(state.virtualInventories));
      }
      if (state.pendingGifts) {
        this.pendingGifts = new Map(Object.entries(state.pendingGifts));
      }
      if (state.transactionHistory) {
        this.transactionHistory = state.transactionHistory;
      }
      
      console.log('🔄 État restauré');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error.message);
      return false;
    }
  }
}

module.exports = VirtualInventoryManager;
