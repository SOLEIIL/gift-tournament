// services/inventoryManager.js
const fs = require('fs').promises;
const path = require('path');

class InventoryManager {
  constructor() {
    this.inventoryFile = path.join(__dirname, '../data/inventories.json');
    this.ensureDataDirectory();
  }

  // Créer le dossier de données s'il n'existe pas
  async ensureDataDirectory() {
    try {
      const dataDir = path.dirname(this.inventoryFile);
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      console.error('❌ Erreur lors de la création du dossier de données:', error);
    }
  }

  // Charger tous les inventaires
  async loadInventories() {
    try {
      const data = await fs.readFile(this.inventoryFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Fichier n'existe pas, créer un inventaire vide
        return {};
      }
      console.error('❌ Erreur lors du chargement des inventaires:', error);
      return {};
    }
  }

  // Sauvegarder tous les inventaires
  async saveInventories(inventories) {
    try {
      await fs.writeFile(this.inventoryFile, JSON.stringify(inventories, null, 2));
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des inventaires:', error);
      throw error;
    }
  }

  // Obtenir l'inventaire d'un utilisateur
  async getUserInventory(userId) {
    const inventories = await this.loadInventories();
    return inventories[userId] || [];
  }

  // Ajouter un gift à l'inventaire d'un utilisateur
  async addGiftToInventory(userId, username, giftData) {
    try {
      console.log(`📦 Ajout du gift ${giftData.giftName} à l'inventaire de @${username}`);
      
      const inventories = await this.loadInventories();
      
      // Créer l'inventaire de l'utilisateur s'il n'existe pas
      if (!inventories[userId]) {
        inventories[userId] = [];
      }

      // Créer l'objet gift pour l'inventaire
      const gift = {
        id: giftData.giftId,
        giftName: giftData.giftName,
        giftValue: giftData.giftValue || 25,
        giftType: giftData.giftType || 'star_gift_unique',
        collectibleId: giftData.collectibleId,
        collectibleModel: giftData.collectibleModel,
        collectibleBackdrop: giftData.collectibleBackdrop,
        collectibleSymbol: giftData.collectibleSymbol,
        addedAt: new Date().toISOString(),
        status: 'owned',
        telegramMessageId: giftData.telegramMessageId
      };

      // Vérifier si le gift n'existe pas déjà
      const existingGift = inventories[userId].find(g => g.id === gift.id);
      if (existingGift) {
        console.log(`⚠️ Gift ${giftData.giftName} déjà présent dans l'inventaire de @${username}`);
        return existingGift;
      }

      // Ajouter le gift à l'inventaire
      inventories[userId].push(gift);
      
      // Sauvegarder
      await this.saveInventories(inventories);
      
      console.log(`✅ Gift ${giftData.giftName} ajouté à l'inventaire de @${username}`);
      return gift;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du gift à l\'inventaire:', error);
      throw error;
    }
  }

  // Retirer un gift de l'inventaire d'un utilisateur
  async removeGiftFromInventory(userId, username, giftId) {
    try {
      console.log(`🗑️ Retrait du gift ${giftId} de l'inventaire de @${username}`);
      
      const inventories = await this.loadInventories();
      
      if (!inventories[userId]) {
        throw new Error('Inventaire utilisateur non trouvé');
      }

      // Trouver et retirer le gift
      const giftIndex = inventories[userId].findIndex(g => g.id === giftId);
      if (giftIndex === -1) {
        throw new Error('Gift non trouvé dans l\'inventaire');
      }

      const removedGift = inventories[userId].splice(giftIndex, 1)[0];
      
      // Sauvegarder
      await this.saveInventories(inventories);
      
      console.log(`✅ Gift ${removedGift.giftName} retiré de l'inventaire de @${username}`);
      return removedGift;
      
    } catch (error) {
      console.error('❌ Erreur lors du retrait du gift de l\'inventaire:', error);
      throw error;
    }
  }

  // Obtenir les statistiques d'un inventaire
  async getInventoryStats(userId) {
    try {
      const inventory = await this.getUserInventory(userId);
      
      const stats = {
        totalGifts: inventory.length,
        totalValue: inventory.reduce((sum, gift) => sum + (gift.giftValue || 0), 0),
        uniqueGifts: new Set(inventory.map(g => g.giftName)).size,
        rarestGift: null,
        mostCommonGift: null
      };

      // Trouver le gift le plus rare
      if (inventory.length > 0) {
        const giftCounts = {};
        inventory.forEach(gift => {
          giftCounts[gift.giftName] = (giftCounts[gift.giftName] || 0) + 1;
        });

        const sortedGifts = Object.entries(giftCounts).sort((a, b) => a[1] - b[1]);
        stats.rarestGift = sortedGifts[0] ? sortedGifts[0][0] : null;
        stats.mostCommonGift = sortedGifts[sortedGifts.length - 1] ? sortedGifts[sortedGifts.length - 1][0] : null;
      }

      return stats;
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      return {
        totalGifts: 0,
        totalValue: 0,
        uniqueGifts: 0,
        rarestGift: null,
        mostCommonGift: null
      };
    }
  }

  // Rechercher un gift dans l'inventaire
  async findGiftInInventory(userId, giftName) {
    try {
      const inventory = await this.getUserInventory(userId);
      return inventory.filter(gift => 
        gift.giftName.toLowerCase().includes(giftName.toLowerCase()) ||
        gift.collectibleId?.toLowerCase().includes(giftName.toLowerCase())
      );
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de gift:', error);
      return [];
    }
  }

  // Obtenir tous les inventaires (pour l'admin)
  async getAllInventories() {
    try {
      const inventories = await this.loadInventories();
      const result = {};
      
      for (const [userId, inventory] of Object.entries(inventories)) {
        const stats = await this.getInventoryStats(userId);
        result[userId] = {
          inventory,
          stats
        };
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de tous les inventaires:', error);
      return {};
    }
  }

  // Nettoyer les inventaires vides
  async cleanEmptyInventories() {
    try {
      const inventories = await this.loadInventories();
      const cleaned = {};
      
      for (const [userId, inventory] of Object.entries(inventories)) {
        if (inventory.length > 0) {
          cleaned[userId] = inventory;
        }
      }
      
      await this.saveInventories(cleaned);
      console.log(`🧹 Inventaires nettoyés: ${Object.keys(inventories).length - Object.keys(cleaned).length} inventaires vides supprimés`);
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des inventaires:', error);
    }
  }
}

module.exports = InventoryManager;
