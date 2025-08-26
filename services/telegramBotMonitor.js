// services/telegramBotMonitor.js
const crypto = require('crypto');

class TelegramBotMonitor {
  constructor(config) {
    this.config = config;
    this.botToken = config.botToken;
    this.webhookUrl = config.webhookUrl;
    this.webhookSecret = config.webhookSecret;
    this.apiKey = config.apiKey;
    this.isRunning = false;
    this.updateId = 0;
  }

  // Démarrer le moniteur
  async start() {
    try {
      console.log('🚀 Démarrage du moniteur Bot Telegram...');
      
      // Vérifier que le bot est actif
      const botInfo = await this.getBotInfo();
      if (!botInfo.ok) {
        throw new Error('Impossible de récupérer les infos du bot');
      }
      
      console.log(`✅ Bot connecté: @${botInfo.result.username}`);
      
      // Démarrer la surveillance des messages
      this.isRunning = true;
      this.startPolling();
      
      console.log('🎯 Moniteur Bot Telegram actif - Surveillance des gifts');
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage du moniteur:', error);
      throw error;
    }
  }

  // Arrêter le moniteur
  async stop() {
    this.isRunning = false;
    console.log('🛑 Moniteur Bot Telegram arrêté');
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
          }
        }
        
        // Continuer la surveillance
        setTimeout(pollUpdates, 1000);
        
      } catch (error) {
        console.error('❌ Erreur lors de la surveillance:', error);
        setTimeout(pollUpdates, 5000); // Attendre plus longtemps en cas d'erreur
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
      // Vérifier que c'est un message privé (pas de groupe)
      if (message.chat.type !== 'private') return;
      
      // Vérifier que le message n'est pas du bot lui-même
      if (message.from.is_bot) return;
      
      console.log(`📨 Message reçu de @${message.from.username}: ${message.text || 'Média'}`);
      
      // Vérifier si c'est un gift
      if (this.isGiftMessage(message)) {
        await this.processGiftMessage(message);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du message:', error);
    }
  }

  // Vérifier si le message est un gift
  isGiftMessage(message) {
    try {
      // 1. Vérifier le texte du message
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
      
      // 2. Vérifier les médias
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
      console.log(`🎁 Gift détecté de @${message.from.username}`);
      
      // Extraire les informations du gift
      const giftInfo = this.extractGiftInfo(message);
      
      // Créer l'objet de transfert
      const transfer = {
        id: this.generateTransferId(),
        fromUserId: message.from.id.toString(),
        fromUsername: message.from.username || 'unknown',
        toDepositAccount: this.config.depositAccountUsername,
        giftId: message.message_id.toString(),
        giftName: giftInfo.name,
        giftValue: giftInfo.value,
        giftType: giftInfo.type,
        mediaType: giftInfo.mediaType,
        timestamp: new Date(message.date * 1000),
        status: 'pending',
        telegramMessageId: message.message_id,
        messageText: message.text || ''
      };
      
      console.log('📋 Informations du transfert:', transfer);
      
      // Envoyer au webhook
      await this.sendWebhook('transfer_received', transfer);
      
      // Répondre à l'utilisateur
      await this.sendConfirmationMessage(message.chat.id, transfer);
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du gift:', error);
      
      // Envoyer un message d'erreur à l'utilisateur
      try {
        await this.sendErrorMessage(message.chat.id, error.message);
      } catch (sendError) {
        console.error('❌ Impossible d\'envoyer le message d\'erreur:', sendError);
      }
    }
  }

  // Extraire les informations du gift
  extractGiftInfo(message) {
    try {
      let giftName = 'Telegram Gift';
      let giftValue = 1;
      let giftType = 'unknown';
      let mediaType = 'text';
      
      // Analyser le texte du message
      if (message.text) {
        giftName = this.extractGiftNameFromText(message.text);
        giftValue = this.extractValueFromText(message.text) || 1;
        giftType = 'text';
      }
      
      // Analyser les médias
      if (message.sticker) {
        giftType = 'sticker';
        giftName = 'Sticker Gift';
        giftValue = this.extractValueFromText(message.text) || 5;
        mediaType = 'sticker';
      } else if (message.animation) {
        giftType = 'gif';
        giftName = 'GIF Gift';
        giftValue = this.extractValueFromText(message.text) || 10;
        mediaType = 'animation';
      } else if (message.document) {
        giftType = 'document';
        giftName = message.document.file_name || 'Document Gift';
        giftValue = this.extractValueFromText(message.text) || 15;
        mediaType = 'document';
      }
      
      return {
        name: giftName,
        value: giftValue,
        type: giftType,
        mediaType: mediaType
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction des infos du gift:', error);
      return {
        name: 'Telegram Gift',
        value: 1,
        type: 'unknown',
        mediaType: 'text'
      };
    }
  }

  // Extraire le nom du gift depuis le texte
  extractGiftNameFromText(text) {
    if (!text) return 'Telegram Gift';
    
    try {
      const giftKeywords = {
        '🎁': 'Gift Box',
        '💎': 'Diamond Gift',
        '🌟': 'Star Gift',
        '💫': 'Sparkle Gift',
        '✨': 'Magic Gift',
        '🎉': 'Party Gift',
        '🎊': 'Celebration Gift',
        '🏆': 'Trophy Gift',
        '🥇': 'Gold Medal Gift',
        '🥈': 'Silver Medal Gift',
        '🥉': 'Bronze Medal Gift'
      };
      
      for (const [emoji, name] of Object.entries(giftKeywords)) {
        if (text.includes(emoji)) {
          return name;
        }
      }
      
      if (text.toLowerCase().includes('gift')) return 'Text Gift';
      if (text.toLowerCase().includes('ton')) return 'TON Gift';
      if (text.toLowerCase().includes('crypto')) return 'Crypto Gift';
      
      return 'Telegram Gift';
    } catch (error) {
      return 'Telegram Gift';
    }
  }

  // Extraire la valeur depuis le texte
  extractValueFromText(text) {
    if (!text) return null;
    
    try {
      const patterns = [
        /(\d+)\s*ton/i,
        /(\d+)\s*coin/i,
        /gift\s*(\d+)/i,
        /(\d+)\s*token/i
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          return parseInt(match[1]);
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // Envoyer le webhook
  async sendWebhook(type, data) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const body = JSON.stringify({ type, data });
      
      const signature = this.generateWebhookSignature(body, timestamp);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Signature': signature,
          'X-Telegram-Timestamp': timestamp.toString(),
          'User-Agent': 'WxyzCrypto-Bot-Monitor/1.0'
        },
        body: body
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`✅ Webhook ${type} envoyé avec succès:`, result);
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi du webhook ${type}:`, error);
      throw error;
    }
  }

  // Générer la signature du webhook
  generateWebhookSignature(body, timestamp) {
    const payload = body + timestamp + this.webhookSecret;
    return crypto.createHmac('sha256', this.apiKey)
      .update(payload)
      .digest('hex');
  }

  // Envoyer un message de confirmation
  async sendConfirmationMessage(chatId, transfer) {
    try {
      const message = `🎁 **Gift reçu !**\n\n` +
        `**Nom:** ${transfer.giftName}\n` +
        `**Valeur:** ${transfer.giftValue} TON\n` +
        `**Statut:** En cours de traitement\n\n` +
        `Votre gift sera ajouté à votre inventaire dans quelques secondes.`;
      
      await this.sendTelegramMessage(chatId, message);
      console.log(`✅ Message de confirmation envoyé à ${chatId}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message de confirmation:', error);
    }
  }

  // Envoyer un message d'erreur
  async sendErrorMessage(chatId, errorMessage) {
    try {
      const message = `❌ **Erreur lors du traitement**\n\n` +
        `Une erreur s'est produite lors du traitement de votre gift.\n` +
        `Veuillez réessayer ou contacter le support.\n\n` +
        `**Erreur:** ${errorMessage}`;
      
      await this.sendTelegramMessage(chatId, message);
      console.log(`⚠️ Message d'erreur envoyé à ${chatId}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message d'erreur:', error);
    }
  }

  // Envoyer un message Telegram
  async sendTelegramMessage(chatId, text) {
    const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    
    return await response.json();
  }

  // Générer un ID unique pour le transfert
  generateTransferId() {
    return `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = TelegramBotMonitor;

