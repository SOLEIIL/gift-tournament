// services/telegramGiftDetector.cjs
// Basé sur TG Gifts Notifier (https://github.com/arynyklas/tg_gifts_notifier)
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const crypto = require('crypto');
const VirtualInventoryManager = require('./virtualInventoryManager.cjs');
const { createClient } = require('@supabase/supabase-js');
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
    this.lastMessageIds = new Map(); // Stocker le dernier ID de message par chat
    
    // 🎯 Gestionnaire d'inventaire virtuel
    this.virtualInventory = new VirtualInventoryManager();
    
    // 🔗 Configuration Supabase pour la synchronisation
    this.supabaseUrl = process.env.SUPABASE_URL || 'https://gquyvmelpkgnddvefpwd.supabase.co';
    this.supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzM2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0';
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    // Validation de la configuration
    this.validateConfig();
  }

  // Démarrer le détecteur
  async start() {
    try {
      console.log('🎁 Démarrage du détecteur de VRAIS gifts Telegram...');
      console.log('==================================================');
      
      // Créer le client Telegram
      this.client = new TelegramClient(
        new StringSession(this.telegramSessionString),
        this.telegramApiId,
        this.telegramApiHash,
        { connectionRetries: 5 }
      );
      
      // Connexion au client
      await this.client.start();
      
      // Récupération des informations du compte
      const me = await this.client.getMe();
      console.log(`🎁 Configuration Telegram Gift Detector:`);
      console.log(`   API_ID: ${this.telegramApiId}`);
      console.log(`   API_HASH: ${this.telegramApiHash.substring(0, 20)}...`);
      console.log(`   SESSION: ${this.telegramSessionString.substring(0, 20)}...`);
      console.log(`   COMPTE: ${me.username || me.firstName}`);
      
      console.log('🚀 Démarrage du détecteur de gifts Telegram...');
      await this.client.connect();
      
      if (await this.client.isUserAuthorized()) {
        console.log(`✅ Connecté en tant que: @${me.username || 'Unknown'} (${me.firstName || 'Unknown'})`);
        
        // 🔍 SCANNER L'HISTOIRE DES GIFTS REÇUS
        console.log('🔍 Scanner l\'historique des gifts reçus...');
        await this.scanHistory();
        
        // 🎯 AFFICHER L'INVENTAIRE VIRTUEL ACTUEL
        this.virtualInventory.displayAllInventories();
        
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
      let giftsFilteredOut = 0;
      
      console.log('🔍 Recherche des VRAIS gifts Telegram dans l\'historique...');
      
      // 🎯 FILTRER LES CHATS PERTINENTS : Seulement ceux où @WxyzCrypto peut recevoir des gifts
      const relevantDialogs = dialogs.filter(dialog => {
        // Exclure le bot lui-même
        if (dialog.entity.username === 'testnftbuybot') return false;
        
        // Exclure les bots en général
        if (dialog.entity.username && dialog.entity.username.endsWith('bot')) return false;
        
        // Inclure seulement les utilisateurs normaux
        return dialog.entity && 
               dialog.entity.className === 'User' && 
               dialog.entity.username !== this.depositAccountUsername; // Exclure @WxyzCrypto lui-même
      });
      
      if (relevantDialogs.length === 0) {
        console.log('❌ Aucun dialogue utilisateur pertinent trouvé pour recevoir des gifts');
        console.log('🛑 ARRÊT du scan - pas de chats pertinents');
        return;
      }
      
      console.log(`✅ ${relevantDialogs.length} dialogue(s) utilisateur(s) pertinent(s) trouvé(s), scan en cours...`);
      
      for (const dialog of relevantDialogs) {
        if (dialog.entity && dialog.entity.className === 'User') {
          const chatId = dialog.entity.id.toString();
          const chatUsername = dialog.entity.username || dialog.entity.firstName || 'Unknown';
          
          console.log(`📱 Vérification du chat avec: ${chatUsername}`);
          
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
                
                // 🔍 ENRICHIR LE MESSAGE AVEC LES INFOS DU DIALOGUE
                const enrichedMessage = {
                  ...message,
                  chat: {
                    id: { value: dialog.entity.id },
                    username: dialog.entity.username,
                    title: dialog.entity.firstName || dialog.entity.username
                  }
                };
                
                // Traiter le gift enrichi
                const success = await this.processGiftMessage(enrichedMessage, true);
                
                nativeGiftsFound++;
                
                if (success === 'filtered') {
                  giftsFilteredOut++;
                } else if (success === true) {
                  giftsFound++;
                } else {
                  console.error('❌ ÉCHEC du traitement du gift, arrêt du scan');
                  return; // S'arrêter immédiatement
                }
              }
            }
          } catch (chatError) {
            console.warn(`⚠️ Erreur lors de la vérification du chat ${chatUsername}:`, chatError.message);
            continue;
          }
        }
      }
      
      if (nativeGiftsFound === 0) {
        console.log('❌ AUCUN VRAI GIFT TELEGRAM trouvé dans l\'historique');
        console.log('🛑 ARRÊT du scan - pas de gifts natifs détectés');
        return;
      }
      
      console.log(`✅ Scan terminé: ${nativeGiftsFound} vrais gifts Telegram trouvés`);
      console.log(`📊 Résultats: ${giftsFound} gifts ajoutés, ${giftsFilteredOut} gifts filtrés (retirés)`);
      
      // 🔄 SYNCHRONISER LES GIFTS RETIRÉS AVEC SUPABASE AU DÉMARRAGE
      await this.syncWithdrawnGiftsAtStartup();
      
    } catch (error) {
      console.error('❌ Erreur lors du scan de l\'historique:', error.message);
      console.log('🛑 ARRÊT du scan en raison d\'une erreur');
    }
  }

  // Démarrer la surveillance par polling
  async startPolling() {
    console.log('🔍 Démarrage de la surveillance par polling (toutes les 30 secondes)...');
    
    // Première vérification immédiate
    await this.checkForNewMessages();
    
    // Vérification toutes les 30 secondes (au lieu de 5) pour éviter les flood waits
    this.pollingInterval = setInterval(async () => {
      await this.checkForNewMessages();
    }, 30000); // 30 secondes
    
    console.log('✅ Polling configuré avec succès (30s)');
  }

  // Vérifier les nouveaux messages
  async checkForNewMessages() {
    try {
      // 🔍 VÉRIFICATION OPTIMISÉE : Utiliser le cache des dialogues
      let dialogs;
      
      // Essayer de récupérer les dialogues avec gestion des erreurs
      try {
        dialogs = await this.client.getDialogs();
      } catch (dialogError) {
        if (dialogError.message.includes('flood wait') || dialogError.message.includes('FLOOD_WAIT')) {
          console.log('⏳ Flood wait détecté - Attente avant prochaine vérification...');
          return; // Sortir sans traiter
        }
        console.warn('⚠️ Erreur lors de la récupération des dialogues:', dialogError.message);
        return;
      }
      
      // 🔍 FILTRER LES CHATS PERTINENTS : Seulement ceux où @WxyzCrypto peut recevoir des gifts
      const relevantDialogs = dialogs.filter(dialog => {
        // Exclure le bot lui-même
        if (dialog.entity.username === 'testnftbuybot') return false;
        
        // Exclure les bots en général
        if (dialog.entity.username && dialog.entity.username.endsWith('bot')) return false;
        
        // Inclure seulement les utilisateurs normaux
        return dialog.entity && 
               dialog.entity.className === 'User' && 
               dialog.entity.username !== this.depositAccountUsername; // Exclure @WxyzCrypto lui-même
      });
      
      if (relevantDialogs.length === 0) {
        console.log('📱 Aucun dialogue utilisateur pertinent trouvé pour recevoir des gifts');
        return;
      }
      
      console.log(`📱 Vérification des messages pour ${relevantDialogs.length} dialogue(s) utilisateur(s) pertinent(s)`);
      
      for (const dialog of relevantDialogs) {
        const chatId = dialog.entity.id.toString();
        const chatName = dialog.entity.username || dialog.entity.firstName || 'Unknown';
        
        try {
          // Obtenir les messages récents avec limite réduite
          const messages = await this.client.getMessages(dialog.entity, { limit: 5 }); // Limite réduite
          
          if (messages.length === 0) continue;
          
          // Obtenir le dernier ID connu pour ce chat
          const lastKnownId = this.lastMessageIds.get(chatId) || 0;
          
          // Vérifier s'il y a de nouveaux messages
          for (const message of messages) {
            if (message.id > lastKnownId) {
              // 📨 AFFICHER TOUS LES MESSAGES DANS LES LOGS (pour le debug)
              console.log(`📨 Nouveau message ${message.id} de ${chatName}`);
              
              // 🎯 VÉRIFIER SI C'EST UN GIFT TELEGRAM
              if (this.isRealTelegramGift(message)) {
                console.log('🎁🎁🎁 NOUVEAU GIFT TELEGRAM DÉTECTÉ ! 🎁🎁🎁');
                
                // 🔍 ENRICHIR LE MESSAGE AVEC LES INFOS DU DIALOGUE
                const enrichedMessage = {
                  ...message,
                  chat: {
                    id: { value: dialog.entity.id },
                    username: dialog.entity.username,
                    title: dialog.entity.firstName || dialog.entity.username
                  }
                };
                
                if (message.out) {
                  // 🚫 WITHDRAW : Gift envoyé par @WxyzCrypto
                  console.log('🚫 WITHDRAW DÉTECTÉ - Gift envoyé par @WxyzCrypto');
                  await this.processWithdrawMessage(enrichedMessage);
                } else {
                  // 🎁 GIFT REÇU : Gift reçu par @WxyzCrypto
                  console.log('🎁 NOUVEAU GIFT REÇU DÉTECTÉ !');
                  await this.processGiftMessage(enrichedMessage, false);
                }
              } else {
                // 📝 MESSAGE IGNORÉ (pas un gift)
                console.log(`📝 Message ignoré (pas un gift Telegram)`);
              }
              
              // Mettre à jour le dernier ID
              this.lastMessageIds.set(chatId, Math.max(message.id, lastKnownId));
            }
          }
          
        } catch (chatError) {
          if (chatError.message.includes('flood wait') || chatError.message.includes('FLOOD_WAIT')) {
            console.log('⏳ Flood wait lors de la vérification du chat - Attente...');
            break; // Sortir de la boucle
          }
          console.warn(`⚠️ Erreur lors de la vérification du chat ${chatName}:`, chatError.message);
          continue;
        }
      }
      
    } catch (error) {
      if (error.message.includes('flood wait') || error.message.includes('FLOOD_WAIT')) {
        console.log('⏳ Flood wait global détecté - Attente avant prochaine vérification...');
        return;
      }
      console.error('❌ Erreur lors de la vérification des nouveaux messages:', error.message);
    }
  }

  // Vérifier si un message contient un vrai gift Telegram
  isRealTelegramGift(message) {
    try {
      // 🎯 UNIQUEMENT : DÉTECTION DES GIFTS NATIFS TELEGRAM (MessageActionStarGiftUnique)
      if (message.action && message.action.className === 'MessageActionStarGiftUnique') {
        // 🔍 DÉTECTION DES GIFTS REÇUS ET ENVOYÉS (WITHDRAWS)
        if (message.out) {
          console.log('🚫 WITHDRAW DÉTECTÉ - Gift envoyé par @WxyzCrypto');
          return true; // Maintenant on détecte les withdraws
        } else {
          console.log('🎁 VRAI GIFT TELEGRAM DÉTECTÉ ! (MessageActionStarGiftUnique) - REÇU');
          return true;
        }
      }

      // 🚫 TOUT LE RESTE EST IGNORÉ
      return false;

    } catch (error) {
      console.error('❌ Erreur lors de la vérification du gift:', error.message);
      return false;
    }
  }



  // Traiter un message de withdraw (gift envoyé par @WxyzCrypto)
  async processWithdrawMessage(message) {
    try {
      console.log('🚫 Traitement du WITHDRAW...');
      
      // 🔍 Extraction des informations du gift envoyé
      const giftInfo = this.extractGiftInfo(message);
      
      if (!giftInfo) {
        console.error('❌ ÉCHEC de l\'extraction des métadonnées du withdraw');
        return false;
      }
      
      console.log('✅ Métadonnées du withdraw extraites avec succès');
      
      // Générer un ID unique pour le withdraw
      const withdrawId = `withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Préparer les données du withdraw
      const withdrawData = {
        id: withdrawId,
        fromDepositAccount: this.depositAccountUsername,
        toUserId: giftInfo.toUserId || 'unknown',
        toUsername: giftInfo.toUsername || 'unknown',
        giftId: message.id.toString(),
        giftName: giftInfo.giftName,
        giftValue: giftInfo.giftValue,
        giftType: giftInfo.giftType,
        mediaType: giftInfo.mediaType,
        collectibleId: giftInfo.collectibleId,
        collectibleModel: giftInfo.collectibleModel,
        collectibleBackdrop: giftInfo.collectibleBackdrop,
        collectibleSymbol: giftInfo.collectibleSymbol,
        timestamp: new Date().toISOString(),
        status: 'withdrawn',
        telegramMessageId: message.id,
        messageText: message.message || '',
        isWithdraw: true
      };
      
      console.log('📋 Informations du WITHDRAW:', withdrawData);
      
      // 🎯 RETIRER DE L'INVENTAIRE VIRTUEL
      this.virtualInventory.removeGiftWithdrawn(withdrawData);
      
      // 🔗 SYNCHRONISER AVEC SUPABASE (RETRAIT)
      await this.syncWithdrawToSupabase(withdrawData);
      
      // Envoyer le webhook pour le withdraw
      await this.sendWebhook('gift_withdrawn', withdrawData);
      
      console.log('✅ WITHDRAW traité avec succès et synchronisé avec Supabase !');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du withdraw:', error.message);
      return false;
    }
  }

  // Traiter un message de gift
  async processGiftMessage(message, isFromHistory = false) {
    try {
      console.log('🎁 Traitement du gift...');
      
      // 🔍 Extraction des informations du gift
      const giftInfo = this.extractGiftInfo(message);
      
      // 🛑 ARRÊT IMMÉDIAT si l'extraction échoue
      if (!giftInfo) {
        console.error('❌ ÉCHEC de l\'extraction des métadonnées du gift');
        return false;
      }
      
      // 🔍 VÉRIFIER SI LE GIFT EST ENCORE SUR LE COMPTE @WxyzCrypto
      const isGiftStillOnAccount = await this.verifyGiftOnAccount(message);
      
      if (!isGiftStillOnAccount) {
        console.log('🚫 Gift retiré - pas d\'ajout à l\'inventaire virtuel');
        return 'filtered'; // Gift traité mais filtré (retiré)
      }
      
      console.log('✅ Gift confirmé sur le compte @WxyzCrypto - ajout à l\'inventaire');
      
      // Générer un ID unique pour le transfert
      const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Préparer les données du transfert
      const transferData = {
        id: transferId,
        fromUserId: giftInfo.fromUserId,
        fromUsername: giftInfo.fromUsername,
        toDepositAccount: this.depositAccountUsername,
        giftId: message.id.toString(),
        giftName: giftInfo.giftName,
        giftValue: giftInfo.giftValue,
        giftType: giftInfo.giftType,
        mediaType: giftInfo.mediaType,
        collectibleId: giftInfo.collectibleId,
        collectibleModel: giftInfo.collectibleModel,
        collectibleBackdrop: giftInfo.collectibleBackdrop,
        collectibleSymbol: giftInfo.collectibleSymbol,
        timestamp: new Date().toISOString(),
        status: 'active',
        telegramMessageId: message.id,
        messageText: message.message || '',
        isFromHistory: isFromHistory
      };

      // 🎯 AJOUTER À L'INVENTAIRE VIRTUEL
      this.virtualInventory.addGiftReceived(transferData);

      // 🔗 SYNCHRONISER IMMÉDIATEMENT AVEC SUPABASE
      await this.syncGiftReceivedToSupabase(transferData);

      // Envoyer le webhook (désactivé temporairement à cause de l'erreur 401)
      // try {
      //   const response = await this.sendWebhook('transfer_received', transferData);
      //   if (!response.ok) {
      //     console.error(`❌ Erreur webhook: ${response.status}`);
      //   }
      // } catch (webhookError) {
      //   console.error('❌ Erreur webhook:', webhookError.message);
      // }
      console.log('📨 Webhook transfer_received désactivé temporairement (erreur 401)');

      // Envoyer le webhook de gift reçu
      try {
        await this.sendWebhook('gift_received', transferData);
        console.log('✅ Webhook gift_received envoyé avec succès');
      } catch (error) {
        console.error('❌ Erreur webhook gift_received:', error.message);
        // Ne pas désactiver le webhook, juste logger l'erreur
      }

      return true;

    } catch (error) {
      console.error('❌ Erreur lors du traitement du gift:', error.message);
      return false;
    }
  }

  // Extraire les informations d'un gift Telegram
  extractGiftInfo(message) {
    try {
      console.log('🔍 Extraction des informations du gift...');
      
      // 🎯 PRIORITÉ ABSOLUE : GIFTS NATIFS TELEGRAM (MessageActionStarGiftUnique)
      if (message.action && message.action.className === 'MessageActionStarGiftUnique') {
        console.log('🎁 Extraction des métadonnées du gift natif Telegram...');
        
        const action = message.action;
        if (!action.gift) {
          console.error('❌ Gift object manquant dans MessageActionStarGiftUnique');
          return null; // S'arrêter immédiatement
        }
        
        const gift = action.gift;
        const giftInfo = {
          giftName: 'Unknown Gift',
          giftValue: 25,
          giftType: 'star_gift_unique',
          mediaType: 'star_gift_unique',
          fromUserId: 'unknown',
          fromUsername: 'unknown',
          collectibleId: 'unknown',
          collectibleModel: 'unknown',
          collectibleBackdrop: 'unknown',
          collectibleSymbol: 'unknown'
        };

        // 🆔 Informations de base du gift
        if (gift.title) {
          giftInfo.giftName = gift.title;
        } else {
          console.error('❌ Titre du gift manquant');
          return null; // S'arrêter immédiatement
        }

        if (gift.slug) {
          giftInfo.collectibleId = gift.slug;
        } else if (gift.num) {
          giftInfo.collectibleId = `${gift.title}-${gift.num}`;
        } else {
          console.error('❌ Slug et num du collectible manquants');
          return null; // S'arrêter immédiatement
        }

        // 💰 Coût en stars
        if (action.transferStars) {
          giftInfo.giftValue = parseInt(action.transferStars);
        }

        // ⭐ Extraction des attributs détaillés
        if (gift.attributes && gift.attributes.length > 0) {
          for (const attr of gift.attributes) {
            if (attr.className === 'StarGiftAttributeModel') {
              giftInfo.collectibleModel = `${attr.name} (${attr.rarityPermille}‰)`;
            } else if (attr.className === 'StarGiftAttributePattern') {
              giftInfo.collectibleSymbol = `${attr.name} (${attr.rarityPermille}‰)`;
            } else if (attr.className === 'StarGiftAttributeBackdrop') {
              giftInfo.collectibleBackdrop = `${attr.name} (${attr.rarityPermille}‰)`;
            }
          }
        }

        // 👤 Extraction de l'expéditeur ou du destinataire selon le type de message
        if (message.out) {
          // 🚫 WITHDRAW : Gift envoyé par @WxyzCrypto
          giftInfo.toUserId = this.extractRecipientId(message);
          giftInfo.toUsername = this.extractRecipientUsername(message);
          
          if (giftInfo.toUserId === 'unknown') {
            console.warn('⚠️ Impossible d\'extraire l\'ID du destinataire');
          }
          if (giftInfo.toUsername === 'unknown') {
            console.warn('⚠️ Impossible d\'extraire le nom d\'utilisateur du destinataire');
          }
        } else {
          // 🎁 GIFT REÇU : Gift reçu par @WxyzCrypto
          giftInfo.fromUserId = this.extractSenderId(message);
          giftInfo.fromUsername = this.extractSenderUsername(message);
          
          if (giftInfo.fromUserId === 'unknown') {
            console.warn('⚠️ Impossible d\'extraire l\'ID de l\'expéditeur');
          }
          if (giftInfo.fromUsername === 'unknown') {
            console.warn('⚠️ Impossible d\'extraire le nom d\'utilisateur de l\'expéditeur');
          }
        }

        console.log('✅ Métadonnées du gift natif extraites avec succès:', giftInfo);
        return giftInfo;
      }

      // 🚫 Si ce n'est pas un gift natif Telegram, s'arrêter immédiatement
      console.log('❌ Ce n\'est pas un gift natif Telegram, arrêt de l\'extraction');
      return null;

    } catch (error) {
      console.error('❌ Erreur fatale lors de l\'extraction des informations du gift:', error.message);
      console.error('🛑 Arrêt immédiat de l\'extraction');
      return null; // S'arrêter immédiatement
    }
  }

  // Fonctions d'aide pour extraire les informations de l'expéditeur
  extractSenderId(message) {
    try {
      // 🔍 PRIORITÉ 1: message.fromId (pour les messages reçus)
      if (message.fromId) {
        if (message.fromId.className === 'PeerUser') {
          console.log('✅ ID expéditeur trouvé via message.fromId:', message.fromId.userId);
          return message.fromId.userId.toString();
        }
      }
      
      // 🔍 PRIORITÉ 2: message.action.fromId (pour les actions de gift)
      if (message.action && message.action.fromId) {
        if (message.action.fromId.className === 'PeerUser') {
          console.log('✅ ID expéditeur trouvé via message.action.fromId:', message.action.fromId.userId);
          return message.action.fromId.userId.toString();
        }
      }
      
      // 🔍 PRIORITÉ 3: message.sender.id (pour les messages récents)
      if (message.sender && message.sender.id) {
        console.log('✅ ID expéditeur trouvé via message.sender.id:', message.sender.id);
        return message.sender.id.toString();
      }
      
      // 🔍 PRIORITÉ 4: message.peerId.userId (fallback)
      if (message.peerId && message.peerId.userId) {
        console.log('✅ ID expéditeur trouvé via message.peerId.userId:', message.peerId.userId);
        return message.peerId.userId.toString();
      }
      
      // 🔍 PRIORITÉ 5: message.chat.id (pour les conversations privées)
      if (message.chat && message.chat.id) {
        // Extraire l'ID de l'utilisateur depuis l'ID du chat
        const chatId = message.chat.id.value || message.chat.id;
        if (chatId && typeof chatId === 'bigint') {
          // Convertir BigInt en string et retirer le 'n' si présent
          const userId = chatId.toString().replace('n', '');
          console.log('✅ ID expéditeur trouvé via message.chat.id:', userId);
          return userId;
        } else if (chatId) {
          console.log('✅ ID expéditeur trouvé via message.chat.id:', chatId.toString());
          return chatId.toString();
        }
      }
      
      console.warn('⚠️ Aucun ID expéditeur trouvé dans le message');
      return 'unknown';
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction de l\'ID de l\'expéditeur:', error.message);
      return 'unknown';
    }
  }

  extractSenderUsername(message) {
    try {
      // 🔍 PRIORITÉ 1: message.sender.username (pour les messages récents)
      if (message.sender && message.sender.username) {
        console.log('✅ Username expéditeur trouvé via message.sender.username:', message.sender.username);
        return message.sender.username;
      }
      
      // 🔍 PRIORITÉ 2: message.sender.firstName (fallback)
      if (message.sender && message.sender.firstName) {
        console.log('✅ Prénom expéditeur trouvé via message.sender.firstName:', message.sender.firstName);
        return message.sender.firstName;
      }
      
      // 🔍 PRIORITÉ 3: message.action.peer.username
      if (message.action && message.action.peer && message.action.peer.username) {
        console.log('✅ Username expéditeur trouvé via message.action.peer.username:', message.action.peer.username);
        return message.action.peer.username;
      }
      
      // 🔍 PRIORITÉ 4: message.chat.username (depuis l'enrichissement)
      if (message.chat && message.chat.username) {
        console.log('✅ Username expéditeur trouvé via message.chat.username:', message.chat.username);
        return message.chat.username;
      }
      
      console.warn('⚠️ Aucun username expéditeur trouvé dans le message');
      return 'unknown';
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du username expéditeur:', error.message);
      return 'unknown';
    }
  }

  extractRecipientId(message) {
    try {
      // 🔍 PRIORITÉ 1: message.toId (pour les messages envoyés)
      if (message.toId) {
        if (message.toId.className === 'PeerUser') {
          console.log('✅ ID destinataire trouvé via message.toId:', message.toId.userId);
          return message.toId.userId.toString();
        }
      }
      
      // 🔍 PRIORITÉ 2: message.chat.id (pour les conversations privées)
      if (message.chat && message.chat.id) {
        const chatId = message.chat.id;
        
        // Si c'est un BigInt, le convertir en string
        if (typeof chatId === 'bigint') {
          const userId = chatId.toString().replace('n', '');
          console.log('✅ ID destinataire trouvé via message.chat.id (BigInt):', userId);
          return userId;
        }
        
        // Si c'est un objet avec une propriété value (BigInt)
        if (chatId && typeof chatId === 'object' && chatId.value) {
          const userId = chatId.value.toString().replace('n', '');
          console.log('✅ ID destinataire trouvé via message.chat.id.value:', userId);
          return userId;
        }
        
        // Si c'est un objet avec une propriété userId
        if (chatId && typeof chatId === 'object' && chatId.userId) {
          const userId = chatId.userId.toString().replace('n', '');
          console.log('✅ ID destinataire trouvé via message.chat.id.userId:', userId);
          return userId;
        }
        
        // Si c'est un nombre ou string simple
        if (typeof chatId === 'number' || typeof chatId === 'string') {
          const userId = chatId.toString();
          console.log('✅ ID destinataire trouvé via message.chat.id (simple):', userId);
          return userId;
        }
        
        console.warn('⚠️ message.chat.id est un objet complexe:', JSON.stringify(chatId));
      }
      
      // 🔍 PRIORITÉ 3: message.peerId (fallback)
      if (message.peerId && message.peerId.userId) {
        const userId = message.peerId.userId.toString().replace('n', '');
        console.log('✅ ID destinataire trouvé via message.peerId.userId:', userId);
        return userId;
      }
      
      console.warn('⚠️ Aucun ID destinataire trouvé dans le message');
      return 'unknown';
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction de l\'ID du destinataire:', error.message);
      return 'unknown';
    }
  }

  // Extraire le nom d'utilisateur du destinataire (pour les withdraws)
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

  // 🔗 Synchroniser le retrait avec Supabase
  async syncWithdrawToSupabase(withdrawData) {
    try {
      console.log('🔗 Synchronisation du retrait avec Supabase...');
      
      // 🎯 Récupérer l'utilisateur destinataire
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('telegram_id, username')
        .eq('telegram_id', withdrawData.toUserId)
        .single();
      
      if (userError && userError.code !== 'PGRST116') {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', userError);
        return false;
      }
      
      // 🎯 Si l'utilisateur n'existe pas, le créer
      let userId = withdrawData.toUserId;
      let username = withdrawData.toUsername;
      
      if (!user) {
        console.log('👤 Création de l\'utilisateur destinataire...');
        const { data: newUser, error: createError } = await this.supabase
          .from('users')
          .insert({
            telegram_id: withdrawData.toUserId,
            username: withdrawData.toUsername
          })
          .select('telegram_id, username')
          .single();
        
        if (createError) {
          console.error('❌ Erreur lors de la création de l\'utilisateur:', createError);
          return false;
        }
        
        userId = newUser.telegram_id;
        username = newUser.username;
        console.log('✅ Utilisateur créé:', username);
      }
      
      // 🎯 SUPPRIMER le gift de l'inventaire de l'utilisateur (WITHDRAW)
      console.log(`🗑️ Suppression du gift ${withdrawData.collectibleId} de l'inventaire de ${username}...`);
      
      const { error: deleteError } = await this.supabase
        .from('gifts')
        .delete()
        .eq('telegram_id', userId)
        .eq('collectible_id', withdrawData.collectibleId);
      
      if (deleteError) {
        console.error('❌ Erreur lors de la suppression du gift:', deleteError);
        return false;
      }
      
      console.log(`✅ Gift ${withdrawData.collectibleId} supprimé de l'inventaire de ${username}`);
      
             // 🎯 Transaction enregistrée dans les logs (pas de table transactions pour l'instant)
       console.log(`📝 Transaction enregistrée: withdraw - User ${userId}, Gift ${withdrawData.collectibleId}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation avec Supabase:', error.message);
      return false;
    }
  }

  // 🔄 Synchroniser les gifts retirés avec Supabase au démarrage
  async syncWithdrawnGiftsAtStartup() {
    try {
      console.log('🔄 Vérification des gifts retirés au démarrage...');
      
      // 🎯 Récupérer tous les gifts actifs dans Supabase
      const { data: activeGifts, error: giftsError } = await this.supabase
        .from('gifts')
        .select('*');
      
      if (giftsError) {
        console.error('❌ Erreur lors de la récupération des gifts actifs:', giftsError);
        return;
      }
      
      if (!activeGifts || activeGifts.length === 0) {
        console.log('📭 Aucun gift actif trouvé dans Supabase');
        return;
      }
      
      console.log(`🔍 Vérification de ${activeGifts.length} gifts actifs...`);
      
      let withdrawnCount = 0;
      
      for (const gift of activeGifts) {
        try {
          // 🎯 Vérifier si le gift est encore sur le compte @WxyzCrypto
          const isStillOnAccount = await this.verifyGiftStillOnAccount(gift.collectible_id, gift.telegram_id);
          
          if (!isStillOnAccount) {
            console.log(`🚫 Gift ${gift.collectible_id} retiré - synchronisation avec Supabase...`);
            
            // 🗑️ Supprimer le gift de Supabase
            const { error: deleteError } = await this.supabase
              .from('gifts')
              .delete()
              .eq('telegram_id', gift.telegram_id)
              .eq('collectible_id', gift.collectible_id);
            
            if (deleteError) {
              console.error(`❌ Erreur lors de la suppression du gift ${gift.collectible_id}:`, deleteError);
            } else {
              console.log(`✅ Gift ${gift.collectible_id} supprimé de Supabase (retiré)`);
              withdrawnCount++;
            }
          }
        } catch (giftError) {
          console.warn(`⚠️ Erreur lors de la vérification du gift ${gift.collectible_id}:`, giftError.message);
        }
      }
      
      if (withdrawnCount > 0) {
        console.log(`✅ Synchronisation terminée: ${withdrawnCount} gifts retirés synchronisés avec Supabase`);
      } else {
        console.log('✅ Aucun gift retiré détecté - synchronisation à jour');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des gifts retirés:', error.message);
    }
  }

  // 🔗 Synchroniser le gift reçu avec Supabase
  async syncGiftReceivedToSupabase(transferData) {
    try {
      console.log('🔗 Synchronisation du gift reçu avec Supabase...');
      
      // 🎯 Récupérer ou créer l'utilisateur expéditeur
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('telegram_id, username')
        .eq('telegram_id', transferData.fromUserId)
        .single();
      
      if (userError && userError.code !== 'PGRST116') {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', userError);
        return false;
      }
      
      // 🎯 Si l'utilisateur n'existe pas, le créer
      let userId = transferData.fromUserId;
      let username = transferData.fromUsername;
      
      if (!user) {
        console.log('👤 Création de l\'utilisateur expéditeur...');
        const { data: newUser, error: createError } = await this.supabase
          .from('users')
          .insert({
            telegram_id: transferData.fromUserId,
            username: transferData.fromUsername
          })
          .select('telegram_id, username')
          .single();
        
        if (createError) {
          console.error('❌ Erreur lors de la création de l\'utilisateur:', createError);
          return false;
        }
        
        userId = newUser.telegram_id;
        username = newUser.username;
        console.log('✅ Utilisateur créé:', username);
      }
      
      // 🎯 AJOUTER le gift à l'inventaire de l'utilisateur
      console.log(`📦 Ajout du gift ${transferData.collectibleId} à l'inventaire de ${username}...`);
      
      const { error: insertError } = await this.supabase
        .from('gifts')
        .insert({
          telegram_id: userId,
          username: username,
          collectible_id: transferData.collectibleId
        });
      
      if (insertError) {
        console.error('❌ Erreur lors de l\'ajout du gift:', insertError);
        return false;
      }
      
      console.log(`✅ Gift ${transferData.collectibleId} ajouté à l'inventaire de ${username}`);
      
      // 🎯 Transaction enregistrée dans les logs
      console.log(`📝 Transaction enregistrée: gift_received - User ${userId}, Gift ${transferData.collectibleId}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation avec Supabase:', error.message);
      return false;
    }
  }

  // 🔍 Vérifier si un gift spécifique est encore sur le compte @WxyzCrypto
  async verifyGiftStillOnAccount(collectibleId, telegramId) {
    try {
      console.log(`🔍 Vérification détaillée du gift ${collectibleId} pour l'utilisateur ${telegramId}...`);
      
      // 🎯 Récupérer l'utilisateur pour accéder à son chat
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('telegram_id, username')
        .eq('telegram_id', telegramId)
        .single();
      
      if (userError) {
        console.warn(`⚠️ Impossible de récupérer l'utilisateur ${telegramId}:`, userError.message);
        return false; // Par sécurité, considérer comme retiré
      }
      
      // 🎯 Récupérer le chat avec l'utilisateur
      const chatEntity = await this.client.getEntity(telegramId);
      if (!chatEntity) {
        console.warn(`⚠️ Impossible de récupérer le chat avec ${user.username}`);
        return false; // Par sécurité, considérer comme retiré
      }
      
      // 🎯 Récupérer les messages récents pour vérifier le gift
      const messages = await this.client.getMessages(chatEntity, { limit: 200 });
      console.log(`📱 ${messages.length} messages récupérés pour la vérification du gift ${collectibleId}`);
      
      // 🔍 Chercher le gift spécifique dans les messages
      let giftFound = false;
      let giftStatus = 'unknown';
      
      for (const message of messages) {
        if (message.action && message.action.className === 'MessageActionStarGiftUnique') {
          const gift = message.action.gift;
          if (gift) {
            // 🔍 Vérifier si c'est le bon gift
            const messageCollectibleId = gift.slug || `${gift.title}-${gift.num}`;
            if (messageCollectibleId === collectibleId) {
              giftFound = true;
              giftStatus = message.action.transferred === false ? 'active' : 'withdrawn';
              
              console.log(`🎁 Gift ${collectibleId} trouvé dans le message ${message.id}:`);
              console.log(`   - transferred: ${message.action.transferred}`);
              console.log(`   - status: ${giftStatus}`);
              console.log(`   - message.out: ${message.out}`);
              
              // 🎯 Si c'est un message sortant (withdraw), le gift est retiré
              if (message.out) {
                console.log(`🚫 Gift ${collectibleId} détecté comme WITHDRAW (message sortant)`);
                return false;
              }
              
              // 🎯 Si transferred = true, le gift est retiré
              if (message.action.transferred === true) {
                console.log(`🚫 Gift ${collectibleId} transféré/retiré (transferred = true)`);
                return false;
              }
              
              // 🎯 Si transferred = false, le gift est encore actif
              if (message.action.transferred === false) {
                console.log(`✅ Gift ${collectibleId} encore actif sur le compte @WxyzCrypto`);
                return true;
              }
            }
          }
        }
      }
      
      if (!giftFound) {
        console.log(`🚫 Gift ${collectibleId} non trouvé dans l'historique récent - considéré comme retiré`);
        return false;
      }
      
      // 🚫 Si on arrive ici, le gift a un statut inconnu - considérer comme retiré par sécurité
      console.log(`⚠️ Gift ${collectibleId} trouvé mais statut inconnu (${giftStatus}) - considéré comme retiré par sécurité`);
      return false;
      
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification du gift ${collectibleId}:`, error.message);
      return false; // Par sécurité, considérer comme retiré
    }
  }

  // 🔍 Vérifier si un gift est encore sur le compte @WxyzCrypto
  async verifyGiftOnAccount(message) {
    try {
      // 🎯 VÉRIFIER SI LE MESSAGE EST UN WITHDRAW (gift envoyé par @WxyzCrypto)
      if (message.out) {
        console.log('🚫 Message envoyé par @WxyzCrypto - gift retiré');
        return false; // Gift retiré
      }
      
      // 🎯 VÉRIFIER SI LE MESSAGE EST UN GIFT REÇU (gift sur le compte @WxyzCrypto)
      if (message.action && message.action.className === 'MessageActionStarGiftUnique') {
        const action = message.action;
        
        // 🔍 LOGIQUE CORRIGÉE : Seuls les gifts avec transferred=false sont sur le compte
        if (action.transferred === false) {
          console.log('✅ Gift non transféré - encore sur le compte @WxyzCrypto');
          return true;
        }
        
        // 🚫 TOUT LE RESTE EST CONSIDÉRÉ COMME RETIRÉ
        console.log('🚫 Gift transféré ou retiré - pas d\'ajout à l\'inventaire');
        return false;
      }
      
      // Si ce n'est pas un gift, on ne l'ajoute pas à l'inventaire
      console.log('❌ Pas un gift Telegram - pas d\'ajout à l\'inventaire');
      return false;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du gift sur le compte:', error.message);
      // En cas d'erreur, on ne l'ajoute pas à l'inventaire par sécurité
      return false;
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
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify(payload)
      });
      
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
      await this.client.disconnect();
    }
    this.isRunning = false;
    console.log('🛑 Détecteur de gifts Telegram arrêté');
  }
}

module.exports = TelegramGiftDetector;
