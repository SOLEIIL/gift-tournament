// services/telegramInventoryBot.js
const crypto = require('crypto');

class TelegramInventoryBot {
  constructor(config, virtualInventoryManager = null) {
    this.config = config;
    this.botToken = config.botToken;
    this.depositAccountUsername = config.depositAccountUsername;
    
    // Ne plus utiliser l'inventaire virtuel - tout passe par Supabase
    this.virtualInventory = null;
    
    this.isRunning = false;
    this.updateId = 0;
    
    // Système de déduplication pour éviter les messages multiples
    this.processedUpdates = new Set();
    this.lastProcessedTime = new Map();
    this.duplicateThreshold = 5000; // 5 secondes
    
    console.log('🤖 Bot d\'inventaire initialisé avec Supabase uniquement');
  }

  // Démarrer le bot
  async start() {
    try {
      console.log('🚀 Démarrage du Bot d\'Inventaire Telegram...');
      
      // Vérifier que le bot est actif
      const botInfo = await this.getBotInfo();
      if (!botInfo.ok) {
        throw new Error('Impossible de récupérer les infos du bot');
      }
      
      console.log(`✅ Bot connecté: @${botInfo.result.username}`);
      
      // Démarrer la surveillance des messages
      this.isRunning = true;
      this.startPolling();
      
      console.log('🎯 Bot d\'Inventaire actif - Gestion des gifts et inventaires');
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage du bot:', error);
      throw error;
    }
  }

  // Arrêter le bot
  async stop() {
    this.isRunning = false;
    console.log('🛑 Bot d\'Inventaire arrêté');
  }

  // Obtenir les informations du bot
  async getBotInfo() {
    const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
    return await response.json();
  }

  // Démarrer la surveillance par polling
  startPolling() {
    const pollUpdates = async () => {
      if (!this.isRunning) return;

      try {
        const updates = await this.getUpdates();
        
        // Traiter les mises à jour dans l'ordre avec déduplication
        for (const update of updates) {
          try {
            // Vérifier si cette mise à jour a déjà été traitée
            if (this.isUpdateAlreadyProcessed(update)) {
              console.log(`🔄 Mise à jour ${update.update_id} déjà traitée, ignorée`);
              continue;
            }
            
            if (update.message) {
              await this.handleMessage(update.message);
            } else if (update.callback_query) {
              await this.handleCallbackQuery(update.callback_query);
            }
            
            // Marquer comme traitée et mettre à jour l'offset
            this.markUpdateAsProcessed(update);
            this.updateId = Math.max(this.updateId, update.update_id);
            
          } catch (error) {
            console.error('❌ Erreur lors du traitement de la mise à jour:', error);
            // Continuer avec les autres mises à jour
          }
        }
        
        // Continuer la surveillance avec un délai plus long pour éviter la surcharge
        setTimeout(pollUpdates, 2000);
        
      } catch (error) {
        console.error('❌ Erreur lors de la surveillance:', error);
        setTimeout(pollUpdates, 10000);
      }
    };

    pollUpdates();
  }

  // Récupérer les mises à jour
  async getUpdates() {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${this.updateId + 1}&timeout=10&limit=100`
      );
      
      const result = await response.json();
      
      if (result.ok && result.result && result.result.length > 0) {
        // Retourner directement tous les updates - la déduplication se fait au niveau du traitement
        return result.result;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des mises à jour:', error);
      return [];
    }
  }

  // Gérer un message reçu
  async handleMessage(message) {
    try {
      // Vérifier que c'est un message privé
      if (message.chat.type !== 'private') return;
      
      // Vérifier que le message n'est pas du bot lui-même
      if (message.from.is_bot) return;
      
      const userId = message.from.id.toString();
      const username = message.from.username || message.from.first_name;
      
      console.log(`📨 Message reçu de @${username}: ${message.text || 'Média'}`);
      
      // Traiter les commandes
      if (message.text && message.text.startsWith('/')) {
        await this.handleCommand(message);
        return;
      }
      
      // Traiter les messages de gift
      if (this.isGiftMessage(message)) {
        await this.processGiftMessage(message);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du message:', error);
    }
  }

  // Gérer les callback queries (boutons)
  async handleCallbackQuery(callbackQuery) {
    try {
      const data = callbackQuery.data;
      const userId = callbackQuery.from.id.toString();
      const username = callbackQuery.from.username || callbackQuery.from.first_name;
      
      console.log(`🔘 Callback reçu de @${username}: ${data}`);
      
      if (data.startsWith('inventory_')) {
        await this.handleInventoryCallback(callbackQuery);
      } else if (data.startsWith('withdraw_')) {
        await this.handleWithdrawCallback(callbackQuery);
      } else if (data.startsWith('stats_')) {
        await this.handleStatsCallback(callbackQuery);
      }
      
      // Répondre au callback
      await this.answerCallbackQuery(callbackQuery.id);
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du callback:', error);
    }
  }

  // Gérer les commandes
  async handleCommand(message) {
    const command = message.text.toLowerCase();
    const userId = message.from.id.toString();
    const username = message.from.username || message.from.first_name;
    
    try {
      if (command === '/start' || command === '/help') {
        await this.sendWelcomeMessage(message.chat.id, username);
      } else if (command === '/inventory' || command === '/inv') {
        await this.showInventory(message.chat.id, userId, username);
      } else if (command === '/stats') {
        await this.showStats(message.chat.id, userId, username);
      } else if (command === '/search') {
        await this.sendMessage(message.chat.id, '🔍 Utilisez /search <nom_du_gift> pour rechercher un gift spécifique');
      } else if (command.startsWith('/search ')) {
        const searchTerm = command.substring(8);
        await this.searchGift(message.chat.id, userId, username, searchTerm);
      } else if (command === '/withdraw') {
        await this.showWithdrawOptions(message.chat.id, userId, username);
      } else {
        await this.sendMessage(message.chat.id, '❓ Commande non reconnue. Utilisez /help pour voir les commandes disponibles.');
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement de la commande:', error);
      await this.sendMessage(message.chat.id, '❌ Erreur lors du traitement de la commande');
    }
  }

  // Envoyer le message de bienvenue
  async sendWelcomeMessage(chatId, username) {
    const welcomeText = `🎁 Bienvenue @${username} sur le Bot d'Inventaire de Gifts !

📋 **Commandes disponibles :**
• /inventory - Voir votre inventaire
• /stats - Voir vos statistiques
• /search <nom> - Rechercher un gift
• /withdraw - Retirer un gift
• /help - Afficher cette aide

💡 **Comment ça marche :**
1. Envoyez un gift à @${this.depositAccountUsername}
2. Il sera automatiquement ajouté à votre inventaire
3. Utilisez /withdraw pour retirer vos gifts

🎯 Votre inventaire est synchronisé en temps réel !`;

    await this.sendMessage(chatId, welcomeText);
  }

  // Afficher l'inventaire d'un utilisateur
  async showInventory(chatId, userId, username) {
    try {
      // Utiliser Supabase au lieu de l'inventaire virtuel
      const { SupabaseInventoryManager } = require('../lib/supabase.cjs');
      const inventory = await SupabaseInventoryManager.getUserInventory(userId);
      
      // Calculer les statistiques basiques
      const stats = {
        totalGifts: inventory.length,
        totalValue: inventory.reduce((sum, gift) => sum + (gift.gift_value || 0), 0),
        uniqueGifts: new Set(inventory.map(gift => gift.gift_name)).size
      };
      
      if (inventory.length === 0) {
        await this.sendMessage(chatId, `📦 @${username}, votre inventaire est vide.\n\n💡 Envoyez un gift à @${this.depositAccountUsername} pour commencer !`);
        return;
      }
      
      let message = `📦 **Inventaire de @${username}**\n\n`;
      
      // Afficher chaque gift individuellement avec son collectible_id
      inventory.forEach((gift) => {
        // Extraire le nom court et le numéro du collectible_id
        const collectibleId = gift.gift_id || '';
        const shortName = collectibleId.split('-')[0] || gift.gift_name;
        const giftNumber = collectibleId.split('-')[1] || '';
        
        message += `🎁 **${shortName}** #${giftNumber}\n`;
      });
      
      // Ajouter les boutons d'action
      const keyboard = {
        inline_keyboard: [
          [
            { text: '🔄 Actualiser', callback_data: 'inventory_refresh' },
            { text: '📊 Statistiques', callback_data: 'stats_show' }
          ],
          [
            { text: '🗑️ Retirer un gift', callback_data: 'withdraw_show' }
          ]
        ]
      };
      
      await this.sendMessage(chatId, message, keyboard);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage de l\'inventaire:', error);
      await this.sendMessage(chatId, '❌ Erreur lors du chargement de l\'inventaire');
    }
  }

  // Afficher les statistiques
  async showStats(chatId, userId, username) {
    try {
      // Utiliser Supabase au lieu de l'inventaire virtuel
      const { SupabaseInventoryManager } = require('../lib/supabase.cjs');
      const inventory = await SupabaseInventoryManager.getUserInventory(userId);
      
      // Calculer les statistiques basiques
      const stats = {
        totalGifts: inventory.length,
        totalValue: inventory.reduce((sum, gift) => sum + (gift.gift_value || 0), 0),
        uniqueGifts: new Set(inventory.map(gift => gift.gift_name)).size,
        rarestGift: inventory.length > 0 ? inventory[0].gift_name : null,
        mostCommonGift: inventory.length > 0 ? inventory[0].gift_name : null
      };
      
      let message = `📊 **Statistiques de @${username}**\n\n`;
      message += `🎁 **Gifts :**\n`;
      message += `• Total: ${stats.totalGifts}\n`;
      message += `• Types uniques: ${stats.uniqueGifts}\n`;
      message += `• Valeur totale: ${stats.totalValue} stars\n\n`;
      
      if (stats.rarestGift) {
        message += `🏆 **Rareté :**\n`;
        message += `• Plus rare: ${stats.rarestGift}\n`;
        if (stats.mostCommonGift && stats.mostCommonGift !== stats.rarestGift) {
          message += `• Plus commun: ${stats.mostCommonGift}\n`;
        }
      }
      
      const keyboard = {
        inline_keyboard: [
          [
            { text: '📦 Voir inventaire', callback_data: 'inventory_show' },
            { text: '🔄 Actualiser', callback_data: 'stats_refresh' }
          ]
        ]
      };
      
      await this.sendMessage(chatId, message, keyboard);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage des statistiques:', error);
      await this.sendMessage(chatId, '❌ Erreur lors du chargement des statistiques');
    }
  }

  // Rechercher un gift
  async searchGift(chatId, userId, username, searchTerm) {
    try {
      const { SupabaseInventoryManager } = require('../lib/supabase.cjs');
      const inventory = await SupabaseInventoryManager.getUserInventory(userId);
      const results = inventory.filter(gift => 
        gift.gift_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.collectible_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (results.length === 0) {
        await this.sendMessage(chatId, `🔍 Aucun gift trouvé pour "${searchTerm}" dans votre inventaire.`);
        return;
      }
      
      let message = `🔍 **Résultats pour "${searchTerm}"**\n\n`;
      
      results.forEach((gift, index) => {
        message += `${index + 1}. **${gift.giftName}**\n`;
        if (gift.collectibleModel) message += `   • Modèle: ${gift.collectibleModel}\n`;
        if (gift.collectibleBackdrop) message += `   • Arrière-plan: ${gift.collectibleBackdrop}\n`;
        if (gift.collectibleSymbol) message += `   • Symbole: ${gift.collectibleSymbol}\n`;
        message += `   • Valeur: ${gift.giftValue} stars\n\n`;
      });
      
      await this.sendMessage(chatId, message);
      
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      await this.sendMessage(chatId, '❌ Erreur lors de la recherche');
    }
  }

  // Afficher les options de withdraw
  async showWithdrawOptions(chatId, userId, username) {
    try {
      const { SupabaseInventoryManager } = require('../lib/supabase.cjs');
      const inventory = await SupabaseInventoryManager.getUserInventory(userId);
      
      if (inventory.length === 0) {
        await this.sendMessage(chatId, `📦 @${username}, votre inventaire est vide. Aucun gift à retirer.`);
        return;
      }
      
      // Créer les boutons pour chaque gift
      const keyboard = {
        inline_keyboard: inventory.map(gift => [
          {
            text: `🗑️ ${gift.gift_name} (${gift.gift_value}⭐)`,
            callback_data: `withdraw_${gift.id}`
          }
        ])
      };
      
      // Ajouter un bouton retour
      keyboard.inline_keyboard.push([
        { text: '🔙 Retour', callback_data: 'inventory_show' }
      ]);
      
      const message = `🗑️ **Retirer un gift**\n\n@${username}, sélectionnez le gift que vous souhaitez retirer :`;
      
      await this.sendMessage(chatId, message, keyboard);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage des options de withdraw:', error);
      await this.sendMessage(chatId, '❌ Erreur lors du chargement des options de withdraw');
    }
  }

  // Gérer les callbacks d'inventaire
  async handleInventoryCallback(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id.toString();
    const username = callbackQuery.from.username || callbackQuery.from.first_name;
    
    if (callbackQuery.data === 'inventory_show' || callbackQuery.data === 'inventory_refresh') {
      await this.showInventory(chatId, userId, username);
    }
  }

  // Gérer les callbacks de statistiques
  async handleStatsCallback(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id.toString();
    const username = callbackQuery.from.username || callbackQuery.from.first_name;
    
    if (callbackQuery.data === 'stats_show' || callbackQuery.data === 'stats_refresh') {
      await this.showStats(chatId, userId, username);
    }
  }

  // Gérer les callbacks de withdraw
  async handleWithdrawCallback(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id.toString();
    const username = callbackQuery.from.username || callbackQuery.from.first_name;
    
    if (callbackQuery.data === 'withdraw_show') {
      await this.showWithdrawOptions(chatId, userId, username);
    } else if (callbackQuery.data.startsWith('withdraw_')) {
      const giftId = callbackQuery.data.substring(9);
      await this.processWithdraw(chatId, userId, username, giftId);
    }
  }

  // Traiter un withdraw
  async processWithdraw(chatId, userId, username, giftId) {
    try {
      console.log(`🗑️ Demande de withdraw du gift ${giftId} par @${username}`);
      
      // Utiliser Supabase pour retirer le gift
      const { SupabaseInventoryManager } = require('../lib/supabase.cjs');
      
      // Récupérer l'inventaire actuel pour obtenir les détails du gift
      const inventory = await SupabaseInventoryManager.getUserInventory(userId);
      const giftToRemove = inventory.find(gift => gift.id === giftId);
      
      if (!giftToRemove) {
        await this.sendMessage(chatId, '❌ Gift non trouvé dans votre inventaire');
        return;
      }
      
      // Retirer le gift de l'inventaire Supabase
      await SupabaseInventoryManager.removeFromInventory(userId, giftId);
      
      const message = `✅ **Gift retiré avec succès !**\n\n`;
      message += `🎁 **${giftToRemove.gift_name}**\n`;
      message += `• Valeur: ${giftToRemove.gift_value} stars\n`;
      if (giftToRemove.collectible_model) message += `• Modèle: ${giftToRemove.collectible_model}\n`;
      
      message += `\n💡 Le gift a été retiré de votre inventaire.`;
      
      const keyboard = {
        inline_keyboard: [
          [
            { text: '📦 Voir inventaire', callback_data: 'inventory_show' },
            { text: '📊 Statistiques', callback_data: 'stats_show' }
          ]
        ]
      };
      
      await this.sendMessage(chatId, message, keyboard);
      
    } catch (error) {
      console.error('❌ Erreur lors du withdraw:', error);
      await this.sendMessage(chatId, `❌ Erreur lors du retrait: ${error.message}`);
    }
  }

  // Vérifier si le message est un gift
  isGiftMessage(message) {
    try {
      // Vérifier le texte du message
      if (message.text) {
        const giftKeywords = ['gift', 'ton', 'crypto', 'nft', 'token', 'coin', 'present', 'donation'];
        const messageLower = message.text.toLowerCase();
        
        if (giftKeywords.some(keyword => messageLower.includes(keyword))) {
          return true;
        }
        
        // Vérifier les emojis de gifts
        const giftEmojis = ['🎁', '💎', '🌟', '💫', '✨', '🎉', '🎊', '🏆', '🥇', '🥈', '🥉'];
        if (giftEmojis.some(emoji => message.text.includes(emoji))) {
          return true;
        }
      }
      
      // Vérifier les médias
      if (message.sticker || message.animation || message.document) {
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Erreur lors de la détection du gift:', error);
      return false;
    }
  }

  // Traiter un message de gift
  async processGiftMessage(message) {
    try {
      const userId = message.from.id.toString();
      const username = message.from.username || message.from.first_name;
      
      console.log(`🎁 Gift détecté de @${username}`);
      
      // Extraire les informations du gift
      const giftInfo = this.extractGiftInfo(message);
      
      // Ajouter à l'inventaire
      await this.inventoryManager.addGiftToInventory(userId, username, {
        giftId: message.message_id.toString(),
        giftName: giftInfo.name,
        giftValue: giftInfo.value,
        giftType: giftInfo.type,
        collectibleId: giftInfo.collectibleId,
        collectibleModel: giftInfo.collectibleModel,
        collectibleBackdrop: giftInfo.collectibleBackdrop,
        collectibleSymbol: giftInfo.collectibleSymbol,
        telegramMessageId: message.message_id
      });
      
      // Confirmer à l'utilisateur
      const confirmMessage = `✅ **Gift ajouté à votre inventaire !**\n\n`;
      confirmMessage += `🎁 **${giftInfo.name}**\n`;
      confirmMessage += `• Valeur: ${giftInfo.value} stars\n`;
      if (giftInfo.collectibleModel) confirmMessage += `• Modèle: ${giftInfo.collectibleModel}\n`;
      
      confirmMessage += `\n💡 Utilisez /inventory pour voir votre inventaire complet.`;
      
      const keyboard = {
        inline_keyboard: [
          [
            { text: '📦 Voir inventaire', callback_data: 'inventory_show' },
            { text: '📊 Statistiques', callback_data: 'stats_show' }
          ]
        ]
      };
      
      await this.sendMessage(message.chat.id, confirmMessage, keyboard);
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du gift:', error);
      await this.sendMessage(message.chat.id, '❌ Erreur lors de l\'ajout du gift à l\'inventaire');
    }
  }

  // Extraire les informations du gift
  extractGiftInfo(message) {
    try {
      let giftName = 'Telegram Gift';
      let giftValue = 25;
      let giftType = 'star_gift_unique';
      let collectibleId = null;
      let collectibleModel = null;
      let collectibleBackdrop = null;
      let collectibleSymbol = null;
      
      // Analyser le texte du message
      if (message.text) {
        // Chercher des patterns de gifts
        const giftPatterns = [
          /lol\s*pop/i,
          /star\s*gift/i,
          /telegram\s*gift/i
        ];
        
        for (const pattern of giftPatterns) {
          if (pattern.test(message.text)) {
            giftName = message.text.match(pattern)[0];
            break;
          }
        }
        
        // Chercher des valeurs numériques
        const valueMatch = message.text.match(/(\d+)\s*(stars?|ton|coins?)/i);
        if (valueMatch) {
          giftValue = parseInt(valueMatch[1]);
        }
      }
      
      return {
        name: giftName,
        value: giftValue,
        type: giftType,
        collectibleId,
        collectibleModel,
        collectibleBackdrop,
        collectibleSymbol
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction des infos du gift:', error);
      return {
        name: 'Telegram Gift',
        value: 25,
        type: 'star_gift_unique'
      };
    }
  }

  // Envoyer un message
  async sendMessage(chatId, text, keyboard = null) {
    try {
      const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      };
      
      if (keyboard) {
        payload.reply_markup = keyboard;
      }
      
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error('❌ Erreur lors de l\'envoi du message:', result);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
    }
  }

  // Répondre à un callback query
  async answerCallbackQuery(callbackQueryId, text = '') {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text
        })
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error('❌ Erreur lors de la réponse au callback:', result);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la réponse au callback:', error);
    }
  }

  // Traiter un gift reçu via webhook (depuis le détecteur)
  async processGiftFromDetector(giftData) {
    try {
      console.log(`🎁 Gift reçu via détecteur: ${giftData.giftName} de @${giftData.fromUsername}`);
      
      // Utiliser Supabase pour ajouter à l'inventaire
      const { SupabaseInventoryManager } = require('../lib/supabase.cjs');
      
      await SupabaseInventoryManager.addToInventory(
        giftData.fromUserId,
        giftData.giftId || giftData.collectibleId,
        giftData.giftName,
        giftData.giftValue,
        giftData.collectibleModel,
        giftData.collectibleBackdrop,
        giftData.collectibleSymbol
      );
      
      console.log(`✅ Gift ${giftData.giftName} ajouté à l'inventaire de @${giftData.fromUsername}`);
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du gift via détecteur:', error);
    }
  }

  // Traiter un withdraw via webhook (depuis le détecteur)
  async processWithdrawFromDetector(giftData) {
    try {
      console.log(`🗑️ Withdraw détecté via détecteur: ${giftData.giftName} vers @${giftData.toUsername}`);
      
      // Utiliser Supabase pour retirer de l'inventaire
      const { SupabaseInventoryManager } = require('../lib/supabase.cjs');
      
      await SupabaseInventoryManager.removeFromInventory(
        giftData.toUserId,
        giftData.giftId || giftData.collectibleId
      );
      
      console.log(`✅ Gift ${giftData.giftName} retiré de l'inventaire de @${giftData.toUsername}`);
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du withdraw via détecteur:', error);
    }
  }

  // Vérifier si une mise à jour a déjà été traitée
  isUpdateAlreadyProcessed(update) {
    const updateId = update.update_id;
    const now = Date.now();
    
    // Nettoyer les anciennes entrées (plus de 1 minute)
    for (const [id, timestamp] of this.lastProcessedTime.entries()) {
      if (now - timestamp > 60000) {
        this.lastProcessedTime.delete(id);
        this.processedUpdates.delete(id);
      }
    }
    
    return this.processedUpdates.has(updateId);
  }

  // Marquer une mise à jour comme traitée
  markUpdateAsProcessed(update) {
    const updateId = update.update_id;
    this.processedUpdates.add(updateId);
    this.lastProcessedTime.set(updateId, Date.now());
    
    // Limiter la taille des caches pour éviter la surcharge mémoire
    if (this.processedUpdates.size > 1000) {
      const oldestId = this.lastProcessedTime.keys().next().value;
      this.processedUpdates.delete(oldestId);
      this.lastProcessedTime.delete(oldestId);
    }
  }
}

module.exports = TelegramInventoryBot;
