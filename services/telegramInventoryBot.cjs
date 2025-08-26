// services/telegramInventoryBot.js
const crypto = require('crypto');
const InventoryManager = require('./inventoryManager');

class TelegramInventoryBot {
  constructor(config) {
    this.config = config;
    this.botToken = config.botToken;
    this.depositAccountUsername = config.depositAccountUsername;
    this.inventoryManager = new InventoryManager();
    this.isRunning = false;
    this.updateId = 0;
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
        
        for (const update of updates) {
          if (update.message) {
            await this.handleMessage(update.message);
          } else if (update.callback_query) {
            await this.handleCallbackQuery(update.callback_query);
          }
        }
        
        // Continuer la surveillance
        setTimeout(pollUpdates, 1000);
        
      } catch (error) {
        console.error('❌ Erreur lors de la surveillance:', error);
        setTimeout(pollUpdates, 5000);
      }
    };

    pollUpdates();
  }

  // Récupérer les mises à jour
  async getUpdates() {
    const response = await fetch(
      `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${this.updateId + 1}&timeout=30`
    );
    
    const result = await response.json();
    
    if (result.ok && result.result.length > 0) {
      this.updateId = result.result[result.result.length - 1].update_id;
      return result.result;
    }
    
    return [];
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
      const inventory = await this.inventoryManager.getUserInventory(userId);
      const stats = await this.inventoryManager.getInventoryStats(userId);
      
      if (inventory.length === 0) {
        await this.sendMessage(chatId, `📦 @${username}, votre inventaire est vide.\n\n💡 Envoyez un gift à @${this.depositAccountUsername} pour commencer !`);
        return;
      }
      
      let message = `📦 **Inventaire de @${username}**\n\n`;
      message += `📊 **Statistiques :**\n`;
      message += `• Total: ${stats.totalGifts} gifts\n`;
      message += `• Valeur: ${stats.totalValue} stars\n`;
      message += `• Types uniques: ${stats.uniqueGifts}\n\n`;
      
      // Grouper les gifts par nom
      const giftGroups = {};
      inventory.forEach(gift => {
        if (!giftGroups[gift.giftName]) {
          giftGroups[gift.giftName] = [];
        }
        giftGroups[gift.giftName].push(gift);
      });
      
      // Afficher chaque type de gift
      for (const [giftName, gifts] of Object.entries(giftGroups)) {
        const gift = gifts[0]; // Premier gift du groupe
        const count = gifts.length;
        
        message += `🎁 **${giftName}** (x${count})\n`;
        if (gift.collectibleModel) message += `• Modèle: ${gift.collectibleModel}\n`;
        if (gift.collectibleBackdrop) message += `• Arrière-plan: ${gift.collectibleBackdrop}\n`;
        if (gift.collectibleSymbol) message += `• Symbole: ${gift.collectibleSymbol}\n`;
        message += `• Valeur: ${gift.giftValue} stars\n\n`;
      }
      
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
      const stats = await this.inventoryManager.getInventoryStats(userId);
      
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
      const results = await this.inventoryManager.findGiftInInventory(userId, searchTerm);
      
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
      const inventory = await this.inventoryManager.getUserInventory(userId);
      
      if (inventory.length === 0) {
        await this.sendMessage(chatId, `📦 @${username}, votre inventaire est vide. Aucun gift à retirer.`);
        return;
      }
      
      // Créer les boutons pour chaque gift
      const keyboard = {
        inline_keyboard: inventory.map(gift => [
          {
            text: `🗑️ ${gift.giftName} (${gift.giftValue}⭐)`,
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
      
      // Retirer le gift de l'inventaire
      const removedGift = await this.inventoryManager.removeGiftFromInventory(userId, username, giftId);
      
      // TODO: Ici vous devrez implémenter la logique pour envoyer le gift via Telegram
      // Pour l'instant, on simule juste le retrait de l'inventaire
      
      const message = `✅ **Gift retiré avec succès !**\n\n`;
      message += `🎁 **${removedGift.giftName}**\n`;
      message += `• Valeur: ${removedGift.giftValue} stars\n`;
      if (removedGift.collectibleModel) message += `• Modèle: ${removedGift.collectibleModel}\n`;
      
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
      
      // Ajouter à l'inventaire
      await this.inventoryManager.addGiftToInventory(
        giftData.fromUserId,
        giftData.fromUsername,
        giftData
      );
      
      // TODO: Notifier l'utilisateur si possible
      console.log(`✅ Gift ${giftData.giftName} ajouté à l'inventaire de @${giftData.fromUsername}`);
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du gift via détecteur:', error);
    }
  }

  // Traiter un withdraw via webhook (depuis le détecteur)
  async processWithdrawFromDetector(giftData) {
    try {
      console.log(`🗑️ Withdraw détecté via détecteur: ${giftData.giftName} vers @${giftData.toUsername}`);
      
      // Retirer de l'inventaire
      await this.inventoryManager.removeGiftFromInventory(
        giftData.toUserId,
        giftData.toUsername,
        giftData.giftId
      );
      
      console.log(`✅ Gift ${giftData.giftName} retiré de l'inventaire de @${giftData.toUsername}`);
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du withdraw via détecteur:', error);
    }
  }
}

module.exports = TelegramInventoryBot;
