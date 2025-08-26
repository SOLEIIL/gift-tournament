// Script d'analyse approfondie des gifts Telegram
// Pour comprendre COMMENT lire correctement les informations des gifts
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

class DeepGiftAnalyzer {
  constructor() {
    this.telegramApiId = parseInt(process.env.TELEGRAM_API_ID);
    this.telegramApiHash = process.env.TELEGRAM_API_HASH;
    this.telegramSessionString = process.env.TELEGRAM_SESSION_STRING;
    this.client = null;
  }

  async start() {
    try {
      console.log('🔍 ANALYSE APPROFONDIE DES GIFTS TELEGRAM');
      console.log('==================================================');
      console.log('🎯 Objectif: Comprendre COMMENT lire les vrais gifts');
      console.log('📱 Chat: Engue');
      console.log('==================================================');
      
      // Validation de la configuration
      if (!this.telegramApiId || !this.telegramApiHash || !this.telegramSessionString) {
        throw new Error('Configuration Telegram incomplète');
      }
      
      console.log('✅ Configuration validée');
      
      // Création du client Telegram
      this.client = new TelegramClient(
        new StringSession(this.telegramSessionString),
        this.telegramApiId,
        this.telegramApiHash,
        {
          connectionRetries: 5,
          useWSS: false
        }
      );

      // Connexion au client
      await this.client.start();
      await this.client.connect();
      
      if (await this.client.isUserAuthorized()) {
        const me = await this.client.getMe();
        console.log(`✅ Connecté en tant que: @${me.username || 'Unknown'} (${me.firstName || 'Unknown'})`);
        
        // ANALYSE APPROFONDIE
        console.log('🎯 Démarrage de l\'analyse approfondie...');
        await this.deepAnalyzeGifts();
        
      } else {
        throw new Error('Non autorisé sur Telegram');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error.message);
      throw error;
    }
  }

  async deepAnalyzeGifts() {
    try {
      console.log('🔍 Recherche du chat avec Engue...');
      
      // Récupérer tous les dialogues (chats privés)
      const dialogs = await this.client.getDialogs({ limit: 100 });
      
      for (const dialog of dialogs) {
        // Seulement les chats privés
        if (dialog.isUser) {
          const chatName = dialog.title || dialog.entity.username || 'Unknown';
          
          // Se concentrer sur le chat avec Engue
          if (chatName.toLowerCase().includes('engue')) {
            console.log(`🎯 ANALYSE APPROFONDIE DU CHAT AVEC: ${chatName}`);
            console.log('==================================================');
            
            await this.deepAnalyzeEngueChat(dialog);
            break; // Sortir après avoir trouvé Engue
          }
        }
      }
      
      console.log('✅ Analyse approfondie terminée');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse approfondie:', error.message);
    }
  }

  async deepAnalyzeEngueChat(dialog) {
    try {
      // Récupérer TOUS les messages du chat avec Engue
      console.log('📱 Récupération de tous les messages du chat avec Engue...');
      const messages = await this.client.getMessages(dialog.entity, { limit: 1000 });
      
      console.log(`📊 Nombre total de messages: ${messages.length}`);
      
      // ANALYSE APPROFONDIE DE CHAQUE MESSAGE
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        console.log(`\n🔍 ANALYSE APPROFONDIE DU MESSAGE ${i} (ID: ${message.id})`);
        console.log('==================================================');
        
        await this.deepAnalyzeMessage(message, dialog, i);
        
        if (i < messages.length - 1) {
          console.log('---');
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du chat Engue:', error.message);
    }
  }

  async deepAnalyzeMessage(message, dialog, index) {
    try {
      const chatName = dialog.title || dialog.entity.username || 'Unknown';
      
      // 1. INFORMATIONS DE BASE DU MESSAGE
      console.log('📱 INFORMATIONS DE BASE:');
      console.log(`   Chat: ${chatName}`);
      console.log(`   Message ID: ${message.id}`);
      console.log(`   Date: ${message.date ? new Date(message.date * 1000).toISOString() : 'N/A'}`);
      console.log(`   Texte: "${message.message || 'Aucun texte'}"`);
      
      // 2. ANALYSE APPROFONDIE DU MÉDIA
      if (message.media) {
        console.log('📁 ANALYSE APPROFONDIE DU MÉDIA:');
        console.log(`   Type: ${message.media.className}`);
        console.log(`   Type complet: ${message.media.constructor.name}`);
        
        // ANALYSE PAR TYPE DE MÉDIA
        await this.analyzeMediaType(message.media, message, dialog, index);
        
      } else {
        console.log('❌ Aucun média dans ce message');
      }
      
      // 3. ANALYSE DES ACTIONS
      if (message.action) {
        console.log('🎭 ANALYSE DES ACTIONS:');
        console.log(`   Type d'action: ${message.action.className}`);
        console.log(`   Action complète: ${message.action.constructor.name}`);
        
        // ANALYSE DES ACTIONS DE GIFT
        await this.analyzeGiftAction(message.action, message, dialog, index);
      }
      
      // 4. ANALYSE DU CONTEXTE
      console.log('🔍 ANALYSE DU CONTEXTE:');
      if (message.replyTo) {
        console.log(`   Réponse à: Message ID ${message.replyTo.replyToMsgId}`);
      }
      if (message.forward) {
        console.log(`   Transféré depuis: ${message.forward.fromId || 'Unknown'}`);
      }
      
      // 5. ANALYSE DES MÉTADONNÉES CACHÉES
      await this.analyzeHiddenMetadata(message, dialog, index);
      
      console.log('==================================================');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse approfondie du message:', error.message);
    }
  }

  async analyzeMediaType(media, message, dialog, index) {
    try {
      const mediaType = media.className;
      
      switch (mediaType) {
        case 'MessageMediaWebPage':
          await this.analyzeWebPage(media, message, dialog, index);
          break;
          
        case 'MessageMediaDocument':
          await this.analyzeDocument(media, message, dialog, index);
          break;
          
        case 'MessageMediaPhoto':
          await this.analyzePhoto(media, message, dialog, index);
          break;
          
        case 'MessageMediaGame':
          await this.analyzeGame(media, message, dialog, index);
          break;
          
        case 'MessageMediaInvoice':
          await this.analyzeInvoice(media, message, dialog, index);
          break;
          
        default:
          console.log(`   🔍 Type de média non traité: ${mediaType}`);
          console.log(`   📋 Structure: ${JSON.stringify(media, null, 2)}`);
          break;
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du type de média:', error.message);
    }
  }

  async analyzeWebPage(webpage, message, dialog, index) {
    try {
      console.log('🔗 ANALYSE WEBPAGE:');
      console.log(`   URL: ${webpage.url || 'N/A'}`);
      console.log(`   Titre: ${webpage.title || 'N/A'}`);
      console.log(`   Description: ${webpage.description || 'N/A'}`);
      console.log(`   Site: ${webpage.siteName || 'N/A'}`);
      console.log(`   Type: ${webpage.type || 'N/A'}`);
      
      // Vérifier si c'est un collectible NFT
      if (webpage.url && webpage.url.includes('t.me/nft/')) {
        console.log('🎁 COLLECTIBLE NFT DÉTECTÉ !');
        await this.analyzeNFTMetadata(webpage, message, dialog, index);
      }
      
      // Vérifier si c'est un gift Telegram
      if (webpage.url && webpage.url.includes('gift') || webpage.title?.toLowerCase().includes('gift')) {
        console.log('🎁 GIFT TELEGRAM DÉTECTÉ !');
        await this.analyzeGiftWebPage(webpage, message, dialog, index);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse de la webpage:', error.message);
    }
  }

  async analyzeDocument(document, message, dialog, index) {
    try {
      console.log('📁 ANALYSE DOCUMENT:');
      console.log(`   ID: ${document.id}`);
      console.log(`   MIME Type: ${document.mimeType || 'N/A'}`);
      console.log(`   Taille: ${document.size ? (document.size / 1024).toFixed(2) + ' KB' : 'N/A'}`);
      console.log(`   Access Hash: ${document.accessHash || 'N/A'}`);
      console.log(`   DC ID: ${document.dcId || 'N/A'}`);
      
      // ANALYSE DES ATTRIBUTS
      if (document.attributes && document.attributes.length > 0) {
        console.log('📋 ATTRIBUTS DU DOCUMENT:');
        for (const attr of document.attributes) {
          console.log(`   📋 Type: ${attr.className}`);
          console.log(`   📋 Type complet: ${attr.constructor.name}`);
          
          // Attributs spécifiques
          if (attr.alt) console.log(`      Alt: ${attr.alt}`);
          if (attr.fileName) console.log(`      Nom: ${attr.fileName}`);
          if (attr.duration) console.log(`      Durée: ${attr.duration}s`);
          if (attr.width && attr.height) console.log(`      Dimensions: ${attr.width}x${attr.height}`);
          if (attr.supportsStreaming) console.log(`      Streaming: ${attr.supportsStreaming}`);
          if (attr.supportsStreaming) console.log(`      Animated: ${attr.supportsStreaming}`);
          
          // Vérifier si c'est un attribut de gift
          if (attr.className === 'DocumentAttributeCustomEmoji') {
            console.log('🎁 EMOJI PERSONNALISÉ DÉTECTÉ !');
          }
        }
      }
      
      // Vérifier si c'est un gift
      if (document.mimeType && document.mimeType.includes('tgsticker')) {
        console.log('🎁 STICKER TELEGRAM DÉTECTÉ !');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du document:', error.message);
    }
  }

  async analyzePhoto(photo, message, dialog, index) {
    try {
      console.log('📸 ANALYSE PHOTO:');
      console.log(`   ID: ${photo.id}`);
      console.log(`   Access Hash: ${photo.accessHash || 'N/A'}`);
      console.log(`   DC ID: ${photo.dcId || 'N/A'}`);
      
      // ANALYSE DES ATTRIBUTS
      if (photo.attributes && photo.attributes.length > 0) {
        console.log('📋 ATTRIBUTS DE LA PHOTO:');
        for (const attr of photo.attributes) {
          console.log(`   📋 Type: ${attr.className}`);
          console.log(`   📋 Type complet: ${attr.constructor.name}`);
          
          if (attr.width && attr.height) console.log(`      Dimensions: ${attr.width}x${attr.height}`);
          if (attr.alt) console.log(`      Alt: ${attr.alt}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse de la photo:', error.message);
    }
  }

  async analyzeGame(game, message, dialog, index) {
    try {
      console.log('🎮 ANALYSE JEU:');
      console.log(`   ID: ${game.id}`);
      console.log(`   Titre: ${game.title || 'N/A'}`);
      console.log(`   Description: ${game.description || 'N/A'}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du jeu:', error.message);
    }
  }

  async analyzeInvoice(invoice, message, dialog, index) {
    try {
      console.log('💰 ANALYSE FACTURE:');
      console.log(`   Titre: ${invoice.title || 'N/A'}`);
      console.log(`   Description: ${invoice.description || 'N/A'}`);
      console.log(`   Devise: ${invoice.currency || 'N/A'}`);
      console.log(`   Montant: ${invoice.totalAmount || 'N/A'}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse de la facture:', error.message);
    }
  }

  async analyzeGiftAction(action, message, dialog, index) {
    try {
      console.log('🎁 ANALYSE ACTION DE GIFT:');
      console.log(`   Type: ${action.className}`);
      console.log(`   Type complet: ${action.constructor.name}`);
      
      if (action.className === 'MessageActionGiftCode') {
        console.log('🎁 GIFT CODE DÉTECTÉ !');
        console.log(`   Via: ${action.viaGiftCode || 'N/A'}`);
        console.log(`   Boost ID: ${action.boostId || 'N/A'}`);
        console.log(`   Unclaimed: ${action.unclaimed || 'N/A'}`);
      }
      
      // Autres types d'actions possibles
      if (action.className === 'MessageActionPaymentSent') {
        console.log('💳 PAIEMENT ENVOYÉ DÉTECTÉ !');
      }
      
      if (action.className === 'MessageActionPaymentSentMe') {
        console.log('💳 PAIEMENT REÇU DÉTECTÉ !');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse de l\'action de gift:', error.message);
    }
  }

  async analyzeNFTMetadata(webpage, message, dialog, index) {
    try {
      console.log('🎁 ANALYSE MÉTADONNÉES NFT:');
      
      if (webpage.url) {
        const urlMatch = webpage.url.match(/\/nft\/(.+?)[-\d]*$/);
        if (urlMatch) {
          const collectibleName = urlMatch[1].replace(/-/g, ' ');
          console.log(`   🎁 Nom du collectible: ${collectibleName}`);
        }
        
        const numberMatch = webpage.url.match(/-(\d+)$/);
        if (numberMatch) {
          console.log(`   🔢 Numéro du collectible: #${numberMatch[1]}`);
        }
      }
      
      if (webpage.description) {
        console.log(`   📋 Description: ${webpage.description}`);
        
        // Recherche de métadonnées dans la description
        const metadataPatterns = [
          /Model:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
          /Backdrop:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
          /Symbol:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
          /Lol\s*Pop\s*#(\d+)/i,
          /Gold\s*Star/i,
          /Copper/i,
          /Genie\s*Lamp/i
        ];
        
        for (const pattern of metadataPatterns) {
          const match = webpage.description.match(pattern);
          if (match) {
            console.log(`      🎯 ${pattern.source}: ${match.join(' | ')}`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des métadonnées NFT:', error.message);
    }
  }

  async analyzeGiftWebPage(webpage, message, dialog, index) {
    try {
      console.log('🎁 ANALYSE GIFT WEBPAGE:');
      
      // Recherche de patterns de gift dans le titre et la description
      const giftPatterns = [
        /gift/i,
        /collectible/i,
        /nft/i,
        /lol\s*pop/i,
        /(\d+)/g
      ];
      
      if (webpage.title) {
        console.log(`   📄 Titre: ${webpage.title}`);
        for (const pattern of giftPatterns) {
          const matches = webpage.title.match(pattern);
          if (matches) {
            console.log(`      🎯 Pattern ${pattern.source}: ${matches.join(', ')}`);
          }
        }
      }
      
      if (webpage.description) {
        console.log(`   📋 Description: ${webpage.description}`);
        for (const pattern of giftPatterns) {
          const matches = webpage.description.match(pattern);
          if (matches) {
            console.log(`      🎯 Pattern ${pattern.source}: ${matches.join(', ')}`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse de la gift webpage:', error.message);
    }
  }

  async analyzeHiddenMetadata(message, dialog, index) {
    try {
      console.log('🔍 ANALYSE DES MÉTADONNÉES CACHÉES...');
      
      // 1. Vérifier le texte du message pour des métadonnées
      if (message.message) {
        console.log('📄 ANALYSE DU TEXTE DU MESSAGE:');
        this.analyzeMessageText(message.message);
      }
      
      // 2. Vérifier les messages précédents/suivants pour le contexte
      console.log('🔍 ANALYSE DU CONTEXTE TEMPOREL...');
      
      // 3. Vérifier les métadonnées du message lui-même
      console.log('📋 MÉTADONNÉES DU MESSAGE:');
      const messageKeys = Object.keys(message);
      for (const key of messageKeys) {
        if (key !== 'media' && key !== 'action' && key !== 'message' && key !== 'id' && key !== 'date') {
          const value = message[key];
          if (value !== null && value !== undefined) {
            console.log(`   ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des métadonnées cachées:', error.message);
    }
  }

  analyzeMessageText(text) {
    try {
      console.log(`🔍 ANALYSE DU TEXTE: "${text}"`);
      
      // Patterns spécifiques pour Lol Pop et gifts
      const patterns = [
        /lol\s*pop/i,
        /collectible\s*#(\d+)/i,
        /model:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
        /backdrop:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
        /symbol:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
        /gold\s*star/i,
        /copper/i,
        /genie\s*lamp/i,
        /(\d+(?:\.\d+)?%)/g,
        /gift/i,
        /nft/i
      ];
      
      let hasInfo = false;
      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          if (!hasInfo) {
            console.log('   🎁 INFOS TROUVÉES !');
            hasInfo = true;
          }
          console.log(`      🎯 ${pattern.source}: ${matches.join(' | ')}`);
        }
      }
      
      if (!hasInfo) {
        console.log('   ❌ Aucune info trouvée dans le texte');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du texte:', error.message);
    }
  }

  async stop() {
    if (this.client) {
      await this.client.disconnect();
    }
    console.log('🛑 Analyseur approfondi arrêté');
  }
}

// Fonction principale
async function main() {
  const analyzer = new DeepGiftAnalyzer();
  
  try {
    await analyzer.start();
    
    // Attendre pour voir les résultats
    console.log('⏳ Attente de 20 secondes pour voir les résultats...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
  } catch (error) {
    console.error('❌ Erreur principale:', error.message);
  } finally {
    await analyzer.stop();
  }
}

// Lancer l'analyse
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DeepGiftAnalyzer;
