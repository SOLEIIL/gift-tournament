// services/telegramGiftDetector-fixed.cjs
// Version corrigée qui utilise la même approche de connexion que le test
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const crypto = require('crypto');
require('dotenv').config();

class TelegramGiftDetector {
  constructor(config) {
    // Configuration Telegram
    this.telegramApiId = parseInt(config.telegramApiId);
    this.telegramApiHash = config.telegramApiHash;
    this.telegramSessionString = config.telegramSessionString;
    
    // Configuration du compte de dépôt
    this.depositAccountUsername = config.depositAccountUsername;
    
    // Configuration webhook
    this.webhookUrl = config.webhookUrl;
    this.webhookSecret = config.webhookSecret;
    this.apiKey = config.apiKey;
    
    // État du service
    this.isRunning = false;
    this.client = null;
    this.pollingInterval = null;
    this.lastMessageIds = new Map();
    
    // Validation de la configuration
    this.validateConfig();
  }

  // Démarrer le détecteur
  async start() {
    try {
      console.log('🎁 Démarrage du détecteur de VRAIS gifts Telegram...');
      console.log('==================================================');
      
      // Créer le client Telegram avec la même config que le test
      this.client = new TelegramClient(
        new StringSession(this.telegramSessionString),
        this.telegramApiId,
        this.telegramApiHash,
        { 
          connectionRetries: 3,
          useWSS: false
        }
      );
      
      // Connexion directe (comme dans le test qui fonctionne)
      console.log('🚀 Démarrage du détecteur de gifts Telegram...');
      await this.client.connect();
      
      // Vérifier l'autorisation
      if (await this.client.isUserAuthorized()) {
        // Récupération des informations du compte
        const me = await this.client.getMe();
        console.log(`🎁 Configuration Telegram Gift Detector:`);
        console.log(`   API_ID: ${this.telegramApiId}`);
        console.log(`   API_HASH: ${this.telegramApiHash.substring(0, 20)}...`);
        console.log(`   SESSION: ${this.telegramSessionString.substring(0, 20)}...`);
        console.log(`   COMPTE: ${me.username || me.firstName}`);
        
        console.log(`✅ Connecté en tant que: @${me.username || 'Unknown'} (${me.firstName || 'Unknown'})`);
        
        // 🔍 SCANNER L'HISTOIRE DES GIFTS REÇUS
        console.log('🔍 Scanner l\'historique des gifts reçus...');
        await this.scanHistory();
        
        // Démarrer la surveillance par polling
        console.log('📨 Démarrage de la surveillance des gifts par polling...');
        await this.startPolling();
        
        this.isRunning = true;
        console.log('🎯 Détecteur de VRAIS gifts Telegram actif en temps réel !');
        console.log('==================================================');
        console.log('🚀 PRÊT POUR LE TEST ! 🚀');
        console.log('==================================================');
        console.log('📱 ENVOYEZ MAINTENANT VOTRE GIFT :');
        console.log('1. Ouvrez Telegram sur votre téléphone');
        console.log('2. Contactez @WxyzCrypto');
        console.log('3. Envoyez un VRAI gift Telegram (25+ stars)');
        console.log('4. Le gift sera détecté en 5 secondes !');
        console.log('==================================================');
        console.log('🎁 DÉTECTION EN TEMPS RÉEL :');
        console.log('   ✅ Gifts reçus → Webhook transfer_received');
        console.log('   🚫 Withdraws → Webhook gift_withdrawn');
        console.log('   ❌ Tout le reste est ignoré');
        console.log('==================================================');
        console.log('⏳ ATTENTE DU GIFT...');
        console.log('==================================================');
        
      } else {
        throw new Error('Non autorisé sur Telegram');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error.message);
      throw error;
    }
  }

  // Scanner l'historique des gifts reçus
  async scanHistory() {
    try {
      console.log('🔍 Scanner l\'historique des gifts reçus...');
      
      const dialogs = await this.client.getDialogs();
      let giftsFound = 0;
      let nativeGiftsFound = 0;
      
      console.log('🔍 Recherche des VRAIS gifts Telegram dans l\'historique...');
      
      for (const dialog of dialogs) {
        if (dialog.entity && dialog.entity.className === 'User') {
          const chatId = dialog.entity.id.toString();
          console.log(`📱 Vérification du chat avec: ${dialog.entity.username || dialog.entity.firstName || 'Unknown'}`);
          
          try {
            const messages = await this.client.getMessages(dialog.entity, { limit: 50 });
            
            // Initialiser le dernier ID de message pour ce chat
            if (messages.length > 0) {
              this.lastMessageIds.set(chatId, messages[0].id);
            }
            
            for (const message of messages) {
              // 🎯 UNIQUEMENT : Détecter les vrais gifts Telegram
              if (this.isRealTelegramGift(message)) {
                console.log('🎁 VRAI GIFT TELEGRAM DÉTECTÉ dans l\'historique !');
                nativeGiftsFound++;
                
                // Traiter le gift
                const success = await this.processGiftMessage(message, true);
                if (!success) {
                  console.log('⚠️  Gift non traité (erreur)');
                }
              }
            }
          } catch (error) {
            console.log(`⚠️  Erreur lors de la vérification du chat: ${error.message}`);
          }
        }
      }
      
      console.log(`✅ Scan terminé: ${nativeGiftsFound} vrais gifts Telegram trouvés`);
      
    } catch (error) {
      console.error('❌ Erreur lors du scan de l\'historique:', error.message);
    }
  }

  // Démarrer la surveillance par polling
  async startPolling() {
    try {
      console.log('📨 Démarrage de la surveillance des gifts par polling...');
      
      // Vérifier les nouveaux messages toutes les 5 secondes
      this.pollingInterval = setInterval(async () => {
        await this.checkForNewMessages();
      }, 5000);
      
      console.log('🔍 Démarrage de la surveillance par polling (toutes les 5 secondes)...');
      console.log('✅ Polling configuré avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage du polling:', error.message);
    }
  }

  // Vérifier les nouveaux messages
  async checkForNewMessages() {
    try {
      const dialogs = await this.client.getDialogs();
      
      for (const dialog of dialogs) {
        if (dialog.entity && dialog.entity.className === 'User') {
          const chatId = dialog.entity.id.toString();
          const lastKnownId = this.lastMessageIds.get(chatId) || 0;
          
          try {
            const messages = await this.client.getMessages(dialog.entity, { 
              limit: 10,
              offsetId: lastKnownId 
            });
            
            for (const message of messages) {
              if (message.id > lastKnownId) {
                console.log(`📨 Nouveau message ${message.id} de ${dialog.entity.username || dialog.entity.firstName}`);
                
                // Détecter les gifts
                if (this.isRealTelegramGift(message)) {
                  console.log('🎁🎁🎁 NOUVEAU GIFT TELEGRAM DÉTECTÉ ! 🎁🎁🎁');
                  
                  if (message.out) {
                    console.log('🚫 WITHDRAW DÉTECTÉ - Gift envoyé par @WxyzCrypto');
                  } else {
                    console.log('🎁 NOUVEAU GIFT REÇU DÉTECTÉ !');
                    await this.processGiftMessage(message, false);
                  }
                }
                
                // Mettre à jour le dernier ID connu
                this.lastMessageIds.set(chatId, Math.max(message.id, lastKnownId));
              }
            }
          } catch (error) {
            console.log(`⚠️  Erreur lors de la vérification des nouveaux messages: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des nouveaux messages:', error.message);
    }
  }

  // Vérifier si c'est un vrai gift Telegram
  isRealTelegramGift(message) {
    try {
      // Vérifier si c'est un MessageService avec MessageActionStarGiftUnique
      if (message.className === 'MessageService' && message.action) {
        if (message.action.className === 'MessageActionStarGiftUnique') {
          return true;
        }
      }
      
      // Vérifier si c'est un Message avec action
      if (message.className === 'Message' && message.action) {
        if (message.action.className === 'MessageActionStarGiftUnique') {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du gift:', error.message);
      return false;
    }
  }

  // Traiter un message de gift
  async processGiftMessage(message, isFromHistory = false) {
    try {
      console.log('🎁 Traitement du gift...');
      
      // Extraire les informations du gift
      const giftInfo = this.extractGiftInfo(message);
      if (!giftInfo) {
        console.log('❌ Impossible d\'extraire les informations du gift');
        return false;
      }
      
      // Déterminer le type d'événement
      let eventType = 'transfer_received';
      let eventData = {
        fromUserId: this.extractSenderId(message),
        fromUsername: this.extractSenderUsername(message),
        fromFirstName: this.extractSenderFirstName(message),
        fromLastName: this.extractSenderLastName(message),
        toDepositAccount: this.depositAccountUsername,
        ...giftInfo,
        isFromHistory: isFromHistory
      };
      
      // Si c'est un withdraw (message.out = true)
      if (message.out) {
        eventType = 'gift_withdrawn';
        eventData = {
          toUserId: this.extractRecipientId(message),
          toUsername: this.extractRecipientUsername(message),
          toFirstName: this.extractRecipientFirstName(message),
          toLastName: this.extractRecipientLastName(message),
          fromDepositAccount: this.depositAccountUsername,
          ...giftInfo,
          isFromHistory: isFromHistory
        };
      }
      
      // Envoyer le webhook
      await this.sendWebhook(eventType, eventData);
      
      console.log('✅ Gift traité avec succès !');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du gift:', error.message);
      return false;
    }
  }

  // Extraire les informations du gift
  extractGiftInfo(message) {
    try {
      console.log('🔍 Extraction des informations du gift...');
      
      if (message.action && message.action.className === 'MessageActionStarGiftUnique') {
        const gift = message.action.gift;
        
        if (gift) {
          console.log('🎁 Extraction des métadonnées du gift natif Telegram...');
          
          // Extraire le nom du gift
          const giftName = gift.title || 'Unknown Gift';
          console.log(`✅ Nom du gift: ${giftName}`);
          
          // Extraire le slug du collectible
          const collectibleId = gift.slug || `gift-${message.id}`;
          console.log(`✅ Slug du collectible: ${collectibleId}`);
          
          // Extraire le coût en stars
          const giftValue = gift.num || 25;
          console.log(`✅ Coût en stars: ${giftValue}`);
          
          // Extraire les attributs
          console.log('🔍 Extraction des attributs du gift...');
          const attributes = gift.attributes || [];
          
          let collectibleModel = 'Unknown';
          let collectibleBackdrop = 'Unknown';
          let collectibleSymbol = 'Unknown';
          
          for (const attr of attributes) {
            if (attr.key === 'model') collectibleModel = attr.value;
            if (attr.key === 'backdrop') collectibleBackdrop = attr.value;
            if (attr.key === 'symbol') collectibleSymbol = attr.value;
          }
          
          console.log(`✅ Modèle: ${collectibleModel}`);
          console.log(`✅ Symbole: ${collectibleSymbol}`);
          console.log(`✅ Backdrop: ${collectibleBackdrop}`);
          
          console.log('✅ Métadonnées du gift natif extraites avec succès:', {
            giftName,
            giftValue,
            giftType: 'star_gift_unique',
            mediaType: 'star_gift_unique',
            fromUserId: this.extractSenderId(message),
            fromUsername: this.extractSenderUsername(message),
            collectibleId,
            collectibleModel,
            collectibleBackdrop,
            collectibleSymbol
          });
          
          return {
            giftName,
            giftValue,
            giftType: 'star_gift_unique',
            mediaType: 'star_gift_unique',
            collectibleId,
            collectibleModel,
            collectibleBackdrop,
            collectibleSymbol
          };
        }
      }
      
      console.log('⚠️  Impossible d\'extraire les informations du gift');
      return null;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction des informations du gift:', error.message);
      return null;
    }
  }

  // Extraire l'ID de l'expéditeur
  extractSenderId(message) {
    try {
      if (message.fromId) {
        return message.fromId.toString();
      }
      if (message.peerId && message.peerId.userId) {
        return message.peerId.userId.toString();
      }
      return 'unknown';
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction de l\'ID de l\'expéditeur:', error.message);
      return 'unknown';
    }
  }

  // Extraire le nom d'utilisateur de l'expéditeur
  extractSenderUsername(message) {
    try {
      if (message.sender && message.sender.username) {
        return message.sender.username;
      }
      if (message.sender && message.sender.firstName) {
        return message.sender.firstName;
      }
      return 'unknown';
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du nom d\'utilisateur de l\'expéditeur:', error.message);
      return 'unknown';
    }
  }

  // Extraire le prénom de l'expéditeur
  extractSenderFirstName(message) {
    try {
      if (message.sender && message.sender.firstName) {
        return message.sender.firstName;
      }
      return 'unknown';
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du prénom de l\'expéditeur:', error.message);
      return 'unknown';
    }
  }

  // Extraire le nom de famille de l'expéditeur
  extractSenderLastName(message) {
    try {
      if (message.sender && message.sender.lastName) {
        return message.sender.lastName;
      }
      return 'unknown';
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du nom de famille de l\'expéditeur:', error.message);
      return 'unknown';
    }
  }

  // Extraire l'ID du destinataire
  extractRecipientId(message) {
    try {
      if (message.toId && message.toId.userId) {
        return message.toId.userId.toString();
      }
      if (message.peerId && message.peerId.userId) {
        return message.peerId.userId.toString();
      }
      return 'unknown';
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction de l\'ID du destinataire:', error.message);
      return 'unknown';
    }
  }

  // Extraire le nom d'utilisateur du destinataire
  extractRecipientUsername(message) {
    try {
      if (message.toId && this.client) {
        const recipientUser = this.client.getEntity(message.toId);
        if (recipientUser && recipientUser.username) {
          return recipientUser.username;
        }
        if (recipientUser && recipientUser.firstName) {
          return recipientUser.firstName;
        }
      }
      if (message.chat && message.chat.username) {
        return message.chat.username;
      }
      if (message.chat && message.chat.title) {
        return message.chat.title;
      }
      return 'unknown';
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du nom d\'utilisateur du destinataire:', error.message);
      return 'unknown';
    }
  }

  // Extraire le prénom du destinataire
  extractRecipientFirstName(message) {
    try {
      if (message.toId && this.client) {
        const recipientUser = this.client.getEntity(message.toId);
        if (recipientUser && recipientUser.firstName) {
          return recipientUser.firstName;
        }
      }
      return 'unknown';
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du prénom du destinataire:', error.message);
      return 'unknown';
    }
  }

  // Extraire le nom de famille du destinataire
  extractRecipientLastName(message) {
    try {
      if (message.toId && this.client) {
        const recipientUser = this.client.getEntity(message.toId);
        if (recipientUser && recipientUser.lastName) {
          return recipientUser.lastName;
        }
      }
      return 'unknown';
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du nom de famille du destinataire:', error.message);
      return 'unknown';
    }
  }

  // Envoyer le webhook
  async sendWebhook(eventType, data) {
    try {
      const payload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: data
      };
      
      const signature = this.generateWebhookSignature(payload);
      
      // Utiliser l'API d'inventaire
      const webhookUrl = this.webhookUrl.replace('/deposit-webhook', '/inventory-webhook');
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Signature': signature,
          'X-Telegram-Timestamp': Math.floor(Date.now() / 1000).toString(),
          'x-vercel-protection-bypass': 'J7ycuRhEZVd72UKna9XRx64n2eQ2Cz27'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`✅ Webhook d'inventaire envoyé avec succès:`, result);
      
      return response;
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi du webhook ${eventType}:`, error.message);
      throw error;
    }
  }

  // Générer la signature du webhook
  generateWebhookSignature(payload) {
    const data = JSON.stringify(payload);
    return crypto.createHmac('sha256', this.webhookSecret).update(data).digest('hex');
  }

  // Validation de la configuration
  validateConfig() {
    if (!this.telegramApiId || !this.telegramApiHash || !this.telegramSessionString) {
      throw new Error('Configuration Telegram incomplète');
    }
    
    if (!this.webhookUrl || !this.webhookSecret || !this.apiKey) {
      throw new Error('Configuration webhook incomplète');
    }
  }

  // Arrêter le détecteur
  async stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    if (this.client) {
      try {
        await this.client.disconnect();
        await this.client.destroy(); // Fix pour le bug GramJS #615
      } catch (error) {
        console.log('⚠️  Erreur lors de l\'arrêt du client:', error.message);
      }
    }
    this.isRunning = false;
    console.log('🛑 Détecteur de gifts Telegram arrêté');
  }
}

module.exports = TelegramGiftDetector;
