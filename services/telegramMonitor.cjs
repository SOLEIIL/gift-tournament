// services/telegramMonitor.cjs
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const crypto = require('crypto');
const { NewMessage } = require('telegram/events');

class TelegramMonitor {
  constructor(config) {
    // Validation des paramètres requis
    if (!config.telegramApiId || !config.telegramApiHash || !config.telegramSessionString) {
      throw new Error('API ID, API Hash et Session String sont requis');
    }
    
    this.telegramApiId = parseInt(config.telegramApiId);
    this.telegramApiHash = config.telegramApiHash;
    this.telegramSessionString = config.telegramSessionString;
    this.depositAccountUsername = config.depositAccountUsername;
    this.webhookUrl = config.webhookUrl;
    this.webhookSecret = config.webhookSecret;
    this.apiKey = config.apiKey;
    
    // Initialiser le client Telegram
    this.client = new TelegramClient(
      new StringSession(this.telegramSessionString),
      this.telegramApiId,
      this.telegramApiHash,
      {
        connectionRetries: 5,
        useWSS: false
      }
    );
    
    // Configuration des événements
    this.client.addEventHandler(this.handleMessage.bind(this), new NewMessage({}));
    
    console.log('📋 Configuration Telegram:');
    console.log(`   API_ID: ${this.telegramApiId}`);
    console.log(`   API_HASH: ${this.telegramApiHash.substring(0, 20)}...`);
    console.log(`   SESSION: ${this.telegramSessionString.substring(0, 20)}...`);
    console.log(`   COMPTE: ${this.depositAccountUsername}`);
  }

  // Démarrer le moniteur
  async start() {
    try {
      console.log('🚀 Démarrage du moniteur Telegram...');
      
      // Démarrer le client
      await this.client.start();
      
      // Obtenir les informations du compte
      const me = await this.client.getMe();
      console.log(`✅ Connecté en tant que: @${me.username} (${me.firstName})`);
      
      // Nettoyer le compte (quitter tous les canaux/groupes)
      await this.leaveAllChannelsAndGroups();
      
      console.log('📨 Démarrage de la surveillance des messages...');
      console.log('🎯 Moniteur Telegram actif - Surveillance des gifts');
      
      this.isRunning = true;
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error);
      throw error;
    }
  }

  // Arrêter le moniteur
  async stop() {
    try {
      if (this.client) {
        await this.client.disconnect();
      }
      this.isRunning = false;
      console.log('🛑 Moniteur Telegram arrêté');
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt:', error);
    }
  }

  // Vérifier si le moniteur est actif
  isActive() {
    return this.isRunning;
  }

  // Démarrer la surveillance des messages
  startMessageMonitoring() {
    console.log('📨 Démarrage de la surveillance des messages...');
    
    // Écouter les nouveaux messages
    this.client.addEventHandler(async (update) => {
      if (!this.isRunning) return;
      
      try {
        if (update.message) {
          await this.handleMessage(update.message);
        }
      } catch (error) {
        console.error('❌ Erreur lors du traitement du message:', error);
      }
    });
  }

  // Ignorer tous les canaux et groupes (pas de nettoyage)
  async leaveAllChannelsAndGroups() {
    try {
      console.log('🧹 Configuration du compte en cours...');
      
      // Obtenir tous les dialogues
      const dialogs = await this.client.getDialogs();
      let channelCount = 0;
      let groupCount = 0;
      
      for (const dialog of dialogs) {
        try {
          if (dialog.isChannel) {
            channelCount++;
            console.log(`📺 Canal ignoré: ${dialog.title}`);
          } else if (dialog.isGroup) {
            groupCount++;
            console.log(`👥 Groupe ignoré: ${dialog.title}`);
          }
        } catch (dialogError) {
          // Ignorer les erreurs de dialogue
        }
      }
      
      console.log(`✅ Configuration terminée: ${channelCount} canaux et ${groupCount} groupes seront ignorés`);
      console.log('🎯 Seuls les messages privés seront traités');
      
    } catch (error) {
      console.error('❌ Erreur lors de la configuration:', error);
    }
  }

  // Gérer un message reçu
  async handleMessage(message) {
    try {
      // Vérifier que le message a du contenu
      if (!message) {
        return;
      }
      
      // Extraire les informations du message
      let text = '';
      let from = null;
      let chat = null;
      let hasMedia = false;
      
      // Vérifier si c'est un message texte (structure normale)
      if (message.message && typeof message.message === 'string') {
        text = message.message;
        from = message.fromId || message.from;
        chat = message.peerId || message.chat;
        hasMedia = !!(message.media);
        
        // Vérifier que c'est un message privé (pas de canal/groupe)
        if (chat && chat.className === 'PeerUser') {
          console.log(`📨 Message privé reçu de ${from?.userId || 'unknown'}: "${text}"`);
          
          // Vérifier si c'est un gift
          if (this.isGiftMessage({ text, from, chat })) {
            console.log('🎁 Gift détecté ! Traitement en cours...');
            await this.processGiftMessage({ text, from, chat, id: message.id, media: message.media });
          } else {
            console.log('ℹ️ Message normal, pas un gift');
          }
        } else {
          // Ignorer les messages de canaux/groupes
          console.log(`🚫 Message de ${chat?.className || 'unknown'} ignoré (pas privé)`);
        }
      }
      // Vérifier si c'est un message simple (string direct)
      else if (typeof message === 'string') {
        text = message;
        from = { userId: 'unknown' };
        chat = { type: 'private', id: 'unknown' };
        hasMedia = false;
        
        console.log(`📨 Message simple reçu: "${text}"`);
        
        // Vérifier si c'est un gift
        if (this.isGiftMessage({ text, from, chat })) {
          console.log('🎁 Gift détecté ! Traitement en cours...');
          await this.processGiftMessage({ text, from, chat, id: 'unknown', media: null });
        } else {
          console.log('ℹ️ Message simple normal, pas un gift');
        }
      }
      // Vérifier si c'est un message avec structure différente
      else if (message.message && typeof message.message === 'object') {
        text = message.message.message || '';
        from = message.message.fromId || message.message.from || message.fromId || message.from;
        chat = message.message.peerId || message.message.chat || message.peerId || message.chat;
        hasMedia = !!(message.message.media || message.media);
        
        if (text && chat && chat.className === 'PeerUser') {
          console.log(`📨 Message structuré privé reçu de ${from?.userId || 'unknown'}: "${text}"`);
          
          // Vérifier si c'est un gift
          if (this.isGiftMessage({ text, from, chat })) {
            console.log('🎁 Gift détecté ! Traitement en cours...');
            await this.processGiftMessage({ text, from, chat, id: message.message.id || message.id, media: message.message.media || message.media });
          } else {
            console.log('ℹ️ Message structuré normal, pas un gift');
          }
        } else if (text && chat) {
          // Ignorer les messages de canaux/groupes
          console.log(`🚫 Message structuré de ${chat.className || 'unknown'} ignoré (pas privé)`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du message:', error);
    }
  }

  // Vérifier si le message est un gift
  isGiftMessage(message) {
    try {
      // 1. Vérifier les médias (priorité haute - vrais gifts)
      if (message.media || message.sticker || message.animation || message.document) {
        console.log('🎁 Gift détecté via média');
        return true;
      }
      
      // 2. Vérifier le texte du message (plus strict)
      if (message.text) {
        const messageLower = message.text.toLowerCase();
        
        // Patterns spécifiques pour les gifts
        const giftPatterns = [
          /^gift\s+\d+$/i,           // "gift 5"
          /^🎁\s*\d*$/i,             // "🎁" ou "🎁 5"
          /^donate\s+\d+\s*ton$/i,   // "donate 10 ton"
          /^send\s+\d+\s*ton$/i,     // "send 5 ton"
          /^transfer\s+\d+\s*ton$/i, // "transfer 15 ton"
          /^pay\s+\d+\s*ton$/i       // "pay 20 ton"
        ];
        
        // Vérifier les patterns stricts
        for (const pattern of giftPatterns) {
          if (pattern.test(message.text.trim())) {
            console.log(`🎁 Gift détecté via pattern: ${message.text}`);
            return true;
          }
        }
        
        // Vérifier les emojis de gifts avec contexte
        const giftEmojis = ['🎁', '💎', '🌟', '💫', '✨', '🎉', '🎊', '🏆', '🥇', '🥈', '🥉'];
        const hasGiftEmoji = giftEmojis.some(emoji => message.text.includes(emoji));
        
        if (hasGiftEmoji) {
          // Vérifier que ce n'est pas juste un message normal avec emoji
          const giftContext = [
            'gift', 'donate', 'send', 'transfer', 'pay', 'give', 'present',
            'ton', 'crypto', 'payment', 'deposit', 'contribution'
          ];
          
          const hasGiftContext = giftContext.some(word => messageLower.includes(word));
          
          if (hasGiftContext) {
            console.log(`🎁 Gift détecté via emoji + contexte: ${message.text}`);
            return true;
          }
        }
      }
      
      // 3. Vérifier les messages de paiement/crypto spécifiques
      if (message.text) {
        const messageLower = message.text.toLowerCase();
        
        // Patterns de paiement crypto
        const cryptoPatterns = [
          /^\d+\.?\d*\s*ton$/i,      // "10.5 ton" ou "10 ton"
          /^\$\d+\.?\d*$/i,          // "$15.99"
          /^\d+\.?\d*\s*usdt$/i,     // "100 usdt"
          /^\d+\.?\d*\s*btc$/i       // "0.001 btc"
        ];
        
        for (const pattern of cryptoPatterns) {
          if (pattern.test(message.text.trim())) {
            console.log(`💰 Paiement crypto détecté: ${message.text}`);
            return true;
          }
        }
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
      console.log(`🎁 Gift détecté de ${message.from?.userId || 'unknown'}`);
      
      // Extraire les informations du gift
      const giftInfo = this.extractGiftInfo(message);
      
      // Créer l'objet de transfert
      const transfer = {
        id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromUserId: message.from?.userId?.toString() || 'unknown',
        fromUsername: message.from?.username || message.from?.userId?.toString() || 'unknown',
        toDepositAccount: this.depositAccountUsername,
        giftId: message.id?.toString() || 'unknown',
        giftName: giftInfo.name,
        giftValue: giftInfo.value,
        giftType: giftInfo.type,
        mediaType: giftInfo.mediaType,
        timestamp: new Date().toISOString(),
        status: 'pending',
        telegramMessageId: message.id || 'unknown',
        messageText: message.text || ''
      };
      
      console.log('📋 Informations du transfert:', transfer);
      
      // Envoyer le webhook
      await this.sendWebhook('transfer_received', transfer);
      
      // Répondre à l'utilisateur (seulement si on a un chat ID valide)
      if (message.chat && message.chat.id && message.chat.id !== 'unknown') {
        await this.sendConfirmationMessage(message.chat.id, transfer);
      } else {
        console.log('ℹ️ Pas de chat ID valide, pas de message de confirmation envoyé');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du gift:', error);
      
      // Envoyer un message d'erreur à l'utilisateur (seulement si possible)
      try {
        if (message.chat && message.chat.id && message.chat.id !== 'unknown') {
          await this.sendErrorMessage(message.chat.id, error.message);
        }
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
        
        // Vérifier si c'est un pattern de gift spécifique
        if (/^gift\s+\d+$/i.test(message.text.trim())) {
          giftType = 'gift_command';
          giftName = 'Command Gift';
        } else if (/^🎁\s*\d*$/i.test(message.text.trim())) {
          giftType = 'emoji_gift';
          giftName = 'Emoji Gift';
        } else if (/^(donate|send|transfer|pay)\s+\d+\s*ton$/i.test(message.text.trim())) {
          giftType = 'ton_payment';
          giftName = 'TON Payment';
        }
      }
      
      // Analyser les médias (priorité haute)
      if (message.media) {
        if (message.media.className === 'MessageMediaPhoto') {
          giftType = 'photo';
          giftName = 'Photo Gift';
          giftValue = this.extractValueFromText(message.text) || 5;
          mediaType = 'photo';
        } else if (message.media.className === 'MessageMediaDocument') {
          const doc = message.media.document;
          if (doc && doc.mimeType) {
            if (doc.mimeType.startsWith('image/')) {
              giftType = 'image';
              giftName = 'Image Gift';
              giftValue = this.extractValueFromText(message.text) || 8;
              mediaType = 'image';
            } else if (doc.mimeType.startsWith('video/')) {
              giftType = 'video';
              giftName = 'Video Gift';
              giftValue = this.extractValueFromText(message.text) || 12;
              mediaType = 'video';
            } else {
              giftType = 'document';
              giftName = doc.fileName || 'Document Gift';
              giftValue = this.extractValueFromText(message.text) || 15;
              mediaType = 'document';
            }
          }
        }
      } else if (message.sticker) {
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
        giftName = message.document.fileName || 'Document Gift';
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
        // Patterns de gifts
        /^gift\s+(\d+)$/i,                    // "gift 5"
        /^🎁\s*(\d*)$/i,                      // "🎁" ou "🎁 5"
        
        // Patterns de paiement TON
        /(\d+\.?\d*)\s*ton/i,                 // "10.5 ton" ou "10 ton"
        /(donate|send|transfer|pay)\s+(\d+\.?\d*)\s*ton/i,  // "donate 10 ton"
        
        // Patterns de paiement USD
        /\$(\d+\.?\d*)/i,                     // "$15.99"
        
        // Patterns de paiement crypto
        /(\d+\.?\d*)\s*usdt/i,                // "100 usdt"
        /(\d+\.?\d*)\s*btc/i,                 // "0.001 btc"
        
        // Patterns génériques
        /gift\s+(\d+)/i,                      // "gift 5"
        /(\d+)\s*coin/i,                      // "5 coin"
        /(\d+)\s*token/i,                     // "10 token"
        /(\d+)\s*credit/i,                    // "20 credit"
        
        // Patterns avec emojis
        /🎁\s*(\d+)/i,                        // "🎁 5"
        /💎\s*(\d+)/i,                        // "💎 10"
        /🌟\s*(\d+)/i                          // "🌟 15"
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          // Si le pattern a des groupes, prendre le premier groupe de capture
          const value = match[1] || match[0];
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && numValue > 0) {
            console.log(`💰 Valeur extraite: ${numValue} depuis "${text}"`);
            return numValue;
          }
        }
      }
      
      // Si aucun pattern ne correspond, essayer de trouver un nombre simple
      const simpleNumber = text.match(/(\d+)/);
      if (simpleNumber) {
        const numValue = parseInt(simpleNumber[1]);
        if (numValue > 0 && numValue <= 1000) { // Limite raisonnable
          console.log(`💰 Nombre simple extrait: ${numValue} depuis "${text}"`);
          return numValue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction de la valeur:', error);
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
          'User-Agent': 'WxyzCrypto-Monitor/1.0'
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
    return crypto.createHmac('sha256', this.webhookSecret)
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
      console.error('❌ Erreur lors de l\'envoi du message d\'erreur:', error);
    }
  }

  // Envoyer un message Telegram
  async sendTelegramMessage(chatId, text) {
    const result = await this.client.sendMessage(chatId, {
      message: text,
      parseMode: 'Markdown'
    });
    
    return result;
  }

  // Générer un ID unique pour le transfert
  generateTransferId() {
    return `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = TelegramMonitor;
