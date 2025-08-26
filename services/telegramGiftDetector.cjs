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
    this.wxyzCryptoId = '446713824'; // ID fixe de @WxyzCrypto
    
    // Configuration webhook
    this.webhookUrl = config.webhookUrl;
    this.webhookSecret = config.webhookSecret;
    this.apiKey = config.apiKey;
    
    // Token de bypass Vercel pour l'API
    this.vercelBypassToken = 'J7ycuRhEZVd72UKna9XRx64n2eQ2Cz27';
    
    // État du service
    this.isRunning = false;
    this.client = null;
    this.pollingInterval = null;
    this.lastMessageIds = new Map();
    
    // 🔒 SYSTÈME DE DÉDUPLICATION DES GIFTS
    this.processedGifts = new Map(); // Map pour éviter les doublons
    this.giftDeduplicationKey = (giftName, collectibleId, fromUserId) => 
      `${giftName}-${collectibleId}-${fromUserId}`;
    
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
      let processedGifts = new Set(); // Pour éviter les doublons dans l'historique
      
      console.log('🔍 Recherche des VRAIS gifts Telegram dans l\'historique...');
      
      for (const dialog of dialogs) {
        if (dialog.entity && dialog.entity.className === 'User') {
          const chatId = dialog.entity.id.toString();
          const username = dialog.entity.username || dialog.entity.firstName || 'Unknown';
          
          try {
            const messages = await this.client.getMessages(dialog.entity, { limit: 50 });
            
            // Initialiser le dernier ID de message pour ce chat
            if (messages.length > 0) {
              this.lastMessageIds.set(chatId, messages[0].id);
            }
            
            for (const message of messages) {
              // 🎯 UNIQUEMENT : Détecter les vrais gifts Telegram
              if (this.isRealTelegramGift(message)) {
                // Extraire les infos du gift pour la déduplication
                const giftInfo = this.extractGiftInfo(message);
                if (giftInfo) {
                  const dedupKey = this.giftDeduplicationKey(giftInfo.giftName, giftInfo.collectibleId, this.extractSenderId(message));
                  
                  // Traiter seulement si pas déjà vu
                  if (!processedGifts.has(dedupKey)) {
                    processedGifts.add(dedupKey);
                    nativeGiftsFound++;
                    
                    console.log(`🎁 Gift historique: ${giftInfo.giftName} de @${username}`);
                    
                    // Traiter le gift
                    const success = await this.processGiftMessage(message, true);
                    if (!success) {
                      console.log('⚠️  Gift non traité (erreur)');
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.log(`⚠️  Erreur lors de la vérification du chat: ${error.message}`);
          }
        }
      }
      
      console.log(`✅ Scan terminé: ${nativeGiftsFound} gifts uniques trouvés`);
      
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

  // 🔍 Extraire le destinataire depuis la conversation (pour les withdraws)
  extractRecipientFromConversation(message) {
    try {
      console.log(`🔍 EXTRACTION DESTINATAIRE - Message structure:`, {
        peerId: message.peerId,
        chat: message.chat,
        fromId: message.fromId,
        toId: message.toId
      });
      
      // 🎯 NOUVELLE SOLUTION : Utiliser message.chat pour récupérer username et ID
      if (message.chat && message.chat.className === 'User') {
        console.log(`🔍 Chat utilisateur trouvé:`, message.chat);
        
        // Extraire l'ID (sans le 'n' à la fin)
        const userId = message.chat.id.value.toString();
        const username = message.chat.username;
        
        console.log(`🔍 ID utilisateur extrait: ${userId}`);
        console.log(`🔍 Username extrait: @${username}`);
        
        // Retourner le username si disponible, sinon l'ID
        if (username) {
          return username;
        } else {
          return userId;
        }
      }
      
      // Fallback : utiliser peerId si chat n'est pas disponible
      if (message.peerId) {
        console.log(`🔍 Fallback peerId:`, message.peerId);
        
        if (message.peerId.className === 'PeerUser') {
          const userId = message.peerId.userId.toString();
          console.log(`🔍 Fallback ID utilisateur: ${userId}`);
          return userId;
        }
      }
      
      console.log(`🔍 Aucun destinataire trouvé`);
      return 'unknown_recipient';
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du destinataire:', error.message);
      return 'error_recipient';
    }
  }

  // 🔍 Extraire l'ID Telegram du destinataire (pour les withdraws)
  extractRecipientUserId(message) {
    try {
      // 🎯 PRIORITÉ 1: message.chat.id.value (pour les WITHDRAWS)
      if (message.chat && message.chat.className === 'User') {
        const userId = message.chat.id.value.toString();
        console.log(`🔍 ID Telegram du destinataire extrait: ${userId}`);
        return userId;
      }
      
      // 🎯 PRIORITÉ 2: message.peerId.userId (fallback)
      if (message.peerId && message.peerId.className === 'PeerUser') {
        const userId = message.peerId.userId.toString();
        console.log(`🔍 Fallback ID Telegram du destinataire: ${userId}`);
        return userId;
      }
      
      console.log(`🔍 Aucun ID Telegram du destinataire trouvé`);
      return 'unknown_user_id';
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction de l\'ID Telegram du destinataire:', error.message);
      return 'error_user_id';
    }
  }



  // Traiter un message de gift
  async processGiftMessage(message, isFromHistory = false) {
    try {
      // Extraire les informations du gift
      const giftInfo = this.extractGiftInfo(message);
      if (!giftInfo) {
        return false;
      }
      
      // 🔒 VÉRIFICATION DE DÉDUPLICATION
      const fromUserId = this.extractSenderId(message);
      const dedupKey = this.giftDeduplicationKey(giftInfo.giftName, giftInfo.collectibleId, fromUserId);
      
      // Vérifier si ce gift a déjà été traité récemment
      if (this.processedGifts.has(dedupKey)) {
        const lastProcessed = this.processedGifts.get(dedupKey);
        const timeDiff = Date.now() - lastProcessed.timestamp;
        
        // Si le gift a été traité il y a moins de 5 minutes, l'ignorer silencieusement
        if (timeDiff < 5 * 60 * 1000) {
          return false;
        }
        
        // Si c'est le même message, l'ignorer complètement
        if (lastProcessed.messageId === message.id) {
          return false;
        }
      }
      

      
      // 🎯 LOGS ESSENTIELS SEULEMENT
      console.log(`\n🎁 === GIFT DÉTECTÉ ===`);
      console.log(`📱 ID: ${message.id}`);
      console.log(`👤 Expéditeur: ${this.extractSenderUsername(message)} (ID: ${fromUserId})`);
      console.log(`🎁 Gift: ${giftInfo.giftName} #${giftInfo.collectibleId} (${giftInfo.giftValue}⭐)`);
      console.log(`🏷️  Traits: ${giftInfo.collectibleModel} | ${giftInfo.collectibleBackdrop} | ${giftInfo.collectibleSymbol}`);
      
      // 🎯 DÉTECTION AMÉLIORÉE AVEC L'ID @WxyzCrypto :
      // - Expéditeur ID = 446713824 → WITHDRAW (envoyé par @WxyzCrypto)
      // - Expéditeur ID ≠ 446713824 → DÉPÔT (reçu par @WxyzCrypto)
      
      const isWithdraw = fromUserId === this.wxyzCryptoId;
      
      console.log(`🔍 ID @WxyzCrypto: ${this.wxyzCryptoId}`);
      console.log(`🔍 ID Expéditeur: ${fromUserId}`);
      console.log(`🔄 Type: ${isWithdraw ? 'WITHDRAW' : 'DÉPÔT'}`);
      console.log('========================\n');
      
      if (isWithdraw) {
        // WITHDRAW : @WxyzCrypto envoie un gift → RETIRER de l'inventaire
        console.log(`🔄 WITHDRAW détecté: ${giftInfo.giftName} envoyé par @WxyzCrypto`);
        
        // Récupérer le destinataire depuis la conversation
        const recipientUsername = this.extractRecipientFromConversation(message);
        console.log(`👤 Destinataire détecté: @${recipientUsername}`);
        
        // 🎯 IMPORTANT : Pour un WITHDRAW, nous devons retirer le gift de l'inventaire
        // Nous avons besoin de l'ID Telegram de l'utilisateur pour l'inventaire
        const recipientUserId = this.extractRecipientUserId(message);
        console.log(`👤 ID Telegram du destinataire: ${recipientUserId}`);
        
        const eventType = 'gift_withdrawn';
        const eventData = {
          toUsername: recipientUsername,
          toUserId: recipientUserId,
          fromDepositAccount: this.depositAccountUsername,
          ...giftInfo,
          isFromHistory: isFromHistory
        };
        
        // Envoyer le webhook
        await this.sendWebhook(eventType, eventData);
        console.log(`✅ RETIRÉ de l'inventaire: ${giftInfo.giftName} (${giftInfo.giftValue}⭐) de @${recipientUsername} (ID: ${recipientUserId})`);
        
        return true;
      }
      
      // DÉPÔT : @WxyzCrypto reçoit un gift → AJOUTER à l'inventaire
      const eventType = 'transfer_received';
      const eventData = {
        fromUserId: fromUserId,
        fromUsername: this.extractSenderUsername(message),
        fromFirstName: this.extractSenderFirstName(message),
        fromLastName: this.extractSenderLastName(message),
        toDepositAccount: this.depositAccountUsername,
        ...giftInfo,
        isFromHistory: isFromHistory
      };
      
      // 🔒 MARQUER CE GIFT COMME TRAITÉ
      this.processedGifts.set(dedupKey, {
        timestamp: Date.now(),
        messageId: message.id,
        eventType: eventType,
        giftName: giftInfo.giftName
      });
      
      // Nettoyer les anciens gifts (garder seulement les 1000 plus récents)
      if (this.processedGifts.size > 1000) {
        const entries = Array.from(this.processedGifts.entries());
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        this.processedGifts = new Map(entries.slice(0, 1000));
      }
      
      // Envoyer le webhook
      await this.sendWebhook(eventType, eventData);
      
      // Afficher seulement le résumé de l'action
      const action = eventType === 'transfer_received' ? 'AJOUTÉ' : 'RETIRÉ';
      const username = eventType === 'transfer_received' ? eventData.fromUsername : eventData.toUsername;
      console.log(`✅ ${action} à l'inventaire: ${giftInfo.giftName} (${giftInfo.giftValue}⭐) de @${username}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du gift:', error.message);
      return false;
    }
  }

  // Extraire les informations du gift (UNIQUEMENT l'essentiel)
  extractGiftInfo(message) {
    try {
      if (message.action && message.action.className === 'MessageActionStarGiftUnique') {
        const gift = message.action.gift;
        
        if (gift) {
          // 🎯 INFORMATIONS ESSENTIELLES SEULEMENT :
          const giftName = gift.title || 'Unknown Gift';
          const collectibleId = gift.slug || `gift-${message.id}`;
          const giftValue = gift.num || 25;
          
          // Traitement des attributs (Model, Backdrop, Symbol)
          const attributes = gift.attributes || [];
          let collectibleModel = 'Unknown';
          let collectibleBackdrop = 'Unknown';
          let collectibleSymbol = 'Unknown';
          
          for (const attr of attributes) {
            if (attr.key === 'model') collectibleModel = attr.value;
            if (attr.key === 'backdrop') collectibleBackdrop = attr.value;
            if (attr.key === 'symbol') collectibleSymbol = attr.value;
          }
          
          return {
            giftName,           // Nom du gift
            collectibleId,      // ID du collectible
            giftValue,          // Valeur en stars
            collectibleModel,   // Model (ex: "Gold Star 1%")
            collectibleBackdrop, // Backdrop (ex: "Copper 2%")
            collectibleSymbol   // Symbol (ex: "Genie Lamp 0.4%")
          };
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction des informations du gift:', error.message);
      return null;
    }
  }

  // Extraire l'ID de l'expéditeur
  extractSenderId(message) {
    try {
      // 🎯 PRIORITÉ 1: message.sender.id (pour les WITHDRAWS)
      if (message.sender && message.sender.id) {
        console.log(`🔍 Sender ID trouvé: ${message.sender.id}`);
        return message.sender.id.toString();
      }
      
      // 🎯 PRIORITÉ 2: message.fromId (pour les DÉPÔTS)
      if (message.fromId) {
        console.log(`🔍 FromId trouvé: ${message.fromId}`);
        return message.fromId.toString();
      }
      
      // 🎯 PRIORITÉ 3: message.peerId.userId (fallback)
      if (message.peerId && message.peerId.userId) {
        console.log(`🔍 PeerId userId trouvé: ${message.peerId.userId}`);
        return message.peerId.userId.toString();
      }
      
      console.log(`🔍 Aucun ID d'expéditeur trouvé`);
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
          'x-vercel-protection-bypass': this.vercelBypassToken
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

