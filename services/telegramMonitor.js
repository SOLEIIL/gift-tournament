// services/telegramMonitor.js
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const crypto = require('crypto');

class TelegramMonitor {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.isRunning = false;
    this.webhookUrl = config.webhookUrl;
    this.webhookSecret = config.webhookSecret;
    this.apiKey = config.apiKey;
  }

  // Démarrer le moniteur
  async start() {
    try {
      if (this.isRunning) {
        console.log('⚠️ Le moniteur est déjà en cours d\'exécution');
        return;
      }

      console.log('🚀 Démarrage du moniteur Telegram...');
      
      // Initialiser le client Telegram
      this.client = new TelegramClient(
        new StringSession(this.config.sessionString),
        this.config.apiId,
        this.config.apiHash,
        {
          connectionRetries: 5,
          useWSS: true
        }
      );

      // Démarrer le client
      await this.client.start();
      console.log('✅ Client Telegram connecté');

      // Écouter les nouveaux messages
      this.client.addEventHandler(this.handleNewMessage.bind(this));
      
      this.isRunning = true;
      console.log('🎯 Moniteur Telegram actif - Surveillance des transferts de gifts');
      
      // Vérifier périodiquement la connexion
      this.startHeartbeat();
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage du moniteur:', error);
      throw error;
    }
  }

  // Arrêter le moniteur
  async stop() {
    try {
      if (!this.isRunning) return;
      
      console.log('🛑 Arrêt du moniteur Telegram...');
      
      this.isRunning = false;
      
      if (this.client) {
        await this.client.disconnect();
        this.client = null;
      }
      
      console.log('✅ Moniteur Telegram arrêté');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt du moniteur:', error);
    }
  }

  // Gérer les nouveaux messages
  async handleNewMessage(event) {
    try {
      const message = event.message;
      
      // Vérifier que le message est pour le compte de dépôt
      if (!this.isMessageForDepositAccount(message)) {
        return;
      }
      
      // Vérifier si c'est un transfert de gift
      if (this.isGiftTransfer(message)) {
        await this.processGiftTransfer(message);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du message:', error);
    }
  }

  // Vérifier si le message est pour le compte de dépôt
  isMessageForDepositAccount(message) {
    // Vérifier que le message est reçu (pas envoyé)
    if (message.outgoing) return false;
    
    // Vérifier que le message est dans un chat privé avec le compte de dépôt
    if (message.chat?.className !== 'Chat') return false;
    
    // Vérifier que c'est bien le compte de dépôt qui reçoit
    const chatUsername = message.chat.username;
    return chatUsername === this.config.depositAccountUsername;
  }

  // Détecter un transfert de gift Telegram
  isGiftTransfer(message) {
    try {
      // Vérifier que le message contient des médias
      if (!message.media) return false;
      
      // Détecter différents types de gifts Telegram
      const mediaType = message.media.className;
      
      // 1. Stickers (gifts visuels)
      if (mediaType === 'MessageMediaDocument' && message.media.document?.mimeType?.includes('sticker')) {
        return true;
      }
      
      // 2. GIFs animés
      if (mediaType === 'MessageMediaDocument' && message.media.document?.mimeType?.includes('gif')) {
        return true;
      }
      
      // 3. Emojis spéciaux (messages avec emojis de gifts)
      if (mediaType === 'MessageMediaUnsupported' && message.text) {
        const giftEmojis = ['🎁', '💎', '🌟', '💫', '✨', '🎉', '🎊', '🏆', '🥇', '🥈', '🥉'];
        return giftEmojis.some(emoji => message.text.includes(emoji));
      }
      
      // 4. Messages avec le mot "gift" ou "ton"
      if (message.text && !message.media) {
        const giftKeywords = ['gift', 'ton', 'crypto', 'nft', 'token', 'coin'];
        const messageLower = message.text.toLowerCase();
        return giftKeywords.some(keyword => messageLower.includes(keyword));
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Erreur lors de la détection du gift Telegram:', error);
      return false;
    }
  }

  // Extraire le nom du fichier
  extractFileName(document) {
    try {
      const fileNameAttr = document.attributes.find(attr => attr.className === 'DocumentAttributeFilename');
      return fileNameAttr ? fileNameAttr.fileName : null;
    } catch (error) {
      return null;
    }
  }

  // Traiter un transfert de gift
  async processGiftTransfer(message) {
    try {
      console.log(`🎁 Transfert de gift détecté de @${message.sender.username}`);
      
      // Extraire les informations du gift
      const giftInfo = await this.extractGiftInfo(message);
      
      // Créer l'objet de transfert
      const transfer = {
        id: this.generateTransferId(),
        fromUserId: message.senderId.toString(),
        fromUsername: message.sender.username || 'unknown',
        toDepositAccount: this.config.depositAccountUsername,
        giftId: message.media?.document?.id?.toString() || `msg_${message.id}`,
        giftName: giftInfo.name,
        giftValue: giftInfo.value,
        giftType: giftInfo.type,
        mediaType: giftInfo.mediaType,
        timestamp: new Date(message.date * 1000),
        status: 'pending',
        telegramMessageId: message.id,
        messageText: message.text || ''
      };
      
      console.log('📋 Informations du transfert:', transfer);
      
      // Envoyer au webhook
      await this.sendWebhook('transfer_received', transfer);
      
      // Répondre à l'utilisateur
      await this.sendConfirmationMessage(message.chat.id, transfer);
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du transfert:', error);
      
      // Envoyer un message d'erreur à l'utilisateur
      try {
        await this.sendErrorMessage(message.chat.id, error.message);
      } catch (sendError) {
        console.error('❌ Impossible d\'envoyer le message d\'erreur:', sendError);
      }
    }
  }

  // Extraire les informations du gift Telegram
  async extractGiftInfo(message) {
    try {
      let giftName = 'Telegram Gift';
      let giftValue = 1; // Valeur par défaut
      let giftType = 'unknown';
      
      // Analyser le type de média
      if (message.media) {
        const mediaType = message.media.className;
        
        if (mediaType === 'MessageMediaDocument') {
          const document = message.media.document;
          
          // Sticker
          if (document?.mimeType?.includes('sticker')) {
            giftType = 'sticker';
            giftName = 'Sticker Gift';
            giftValue = this.extractValueFromText(message.text) || 5; // Stickers valent 5 TON par défaut
          }
          // GIF
          else if (document?.mimeType?.includes('gif')) {
            giftType = 'gif';
            giftName = 'GIF Gift';
            giftValue = this.extractValueFromText(message.text) || 10; // GIFs valent 10 TON par défaut
          }
          // Autre document
          else {
            giftType = 'document';
            giftName = document?.attributes?.find(attr => attr.className === 'DocumentAttributeFilename')?.fileName || 'Document Gift';
            giftValue = this.extractValueFromText(message.text) || 15; // Documents valent 15 TON par défaut
          }
        }
        // Message texte avec emojis
        else if (message.text) {
          giftType = 'emoji';
          giftName = this.extractGiftNameFromText(message.text);
          giftValue = this.extractValueFromText(message.text) || 1;
        }
      }
      
      // Analyser le texte du message pour extraire la valeur
      if (message.text) {
        const extractedValue = this.extractValueFromText(message.text);
        if (extractedValue) {
          giftValue = extractedValue;
        }
      }
      
      return {
        name: giftName,
        value: giftValue,
        type: giftType,
        mediaType: message.media?.className || 'text'
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction des infos du gift Telegram:', error);
      return {
        name: 'Telegram Gift',
        value: 1,
        type: 'unknown',
        mediaType: 'text'
      };
    }
  }

  // Extraire la valeur depuis le texte du message
  extractValueFromText(text) {
    if (!text) return null;
    
    try {
      // Chercher des patterns comme "5 TON", "10 ton", "gift 15", etc.
      const patterns = [
        /(\d+)\s*ton/i,
        /(\d+)\s*toncoin/i,
        /gift\s*(\d+)/i,
        /(\d+)\s*coin/i,
        /(\d+)\s*token/i,
        /(\d+)\s*crypto/i
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
  
  // Extraire le nom du gift depuis le texte
  extractGiftNameFromText(text) {
    if (!text) return 'Telegram Gift';
    
    try {
      // Chercher des mots-clés spécifiques
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
      
      // Si pas d'emoji, chercher des mots-clés
      if (text.toLowerCase().includes('gift')) return 'Text Gift';
      if (text.toLowerCase().includes('ton')) return 'TON Gift';
      if (text.toLowerCase().includes('crypto')) return 'Crypto Gift';
      
      return 'Telegram Gift';
    } catch (error) {
      return 'Telegram Gift';
    }
  }

  // Envoyer le webhook
  async sendWebhook(type, data) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const body = JSON.stringify({ type, data });
      
      // Générer la signature
      const signature = this.generateWebhookSignature(body, timestamp);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Signature': signature,
          'X-Telegram-Timestamp': timestamp.toString(),
          'User-Agent': 'WxyzCrypto-Deposit-Monitor/1.0'
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
      
      await this.client.sendMessage(chatId, { message });
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
      
      await this.client.sendMessage(chatId, { message });
      console.log(`⚠️ Message d'erreur envoyé à ${chatId}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message d\'erreur:', error);
    }
  }

  // Générer un ID unique pour le transfert
  generateTransferId() {
    return `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Vérification périodique de la connexion
  startHeartbeat() {
    setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        // Vérifier que le client est toujours connecté
        if (this.client && this.client.connected) {
          console.log('💓 Moniteur Telegram - Connexion OK');
        } else {
          console.log('⚠️ Reconnexion du moniteur Telegram...');
          await this.restart();
        }
      } catch (error) {
        console.error('❌ Erreur lors du heartbeat:', error);
        await this.restart();
      }
    }, 60000); // Vérifier toutes les minutes
  }

  // Redémarrer le moniteur
  async restart() {
    try {
      await this.stop();
      await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre 5 secondes
      await this.start();
    } catch (error) {
      console.error('❌ Erreur lors du redémarrage:', error);
    }
  }
}

module.exports = TelegramMonitor;
