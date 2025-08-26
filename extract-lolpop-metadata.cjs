// Script d'extraction finale des métadonnées du collectible Lol Pop #14559
// Spécialement conçu pour analyser le document 5864164362444347710 d'Engue
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

class LolPopMetadataExtractor {
  constructor() {
    this.telegramApiId = parseInt(process.env.TELEGRAM_API_ID);
    this.telegramApiHash = process.env.TELEGRAM_API_HASH;
    this.telegramSessionString = process.env.TELEGRAM_SESSION_STRING;
    this.client = null;
    
    // ID du document spécifique d'Engue
    this.targetDocumentId = '5864164362444347710';
  }

  async start() {
    try {
      console.log('🎁 EXTRACTION FINALE DES MÉTADONNÉES LOL POP #14559');
      console.log('==================================================');
      console.log(`🎯 Document cible: ${this.targetDocumentId}`);
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
        
        // EXTRACTION FINALE DES MÉTADONNÉES
        console.log('🎯 Démarrage de l\'extraction finale...');
        await this.extractLolPopMetadata();
        
      } else {
        throw new Error('Non autorisé sur Telegram');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error.message);
      throw error;
    }
  }

  async extractLolPopMetadata() {
    try {
      console.log('🔍 Recherche du collectible Lol Pop #14559...');
      
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
            
            await this.analyzeEngueChat(dialog);
            break; // Sortir après avoir trouvé Engue
          }
        }
      }
      
      console.log('✅ Extraction finale terminée');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction finale:', error.message);
    }
  }

  async analyzeEngueChat(dialog) {
    try {
      // Récupérer TOUS les messages du chat avec Engue (limite augmentée)
      console.log('📱 Récupération de tous les messages du chat avec Engue...');
      const messages = await this.client.getMessages(dialog.entity, { limit: 500 });
      
      console.log(`📊 Nombre total de messages: ${messages.length}`);
      
      // Rechercher le message contenant le document cible
      let targetMessage = null;
      let targetMessageIndex = -1;
      
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (message.media && message.media.className === 'MessageMediaDocument') {
          const document = message.media.document;
          if (document && document.id.toString() === this.targetDocumentId) {
            targetMessage = message;
            targetMessageIndex = i;
            break;
          }
        }
      }
      
      if (targetMessage) {
        console.log(`🎯 MESSAGE CIBLE TROUVÉ ! Index: ${targetMessageIndex}`);
        console.log('==================================================');
        
        // ANALYSE APPROFONDIE DU MESSAGE CIBLE
        await this.analyzeTargetMessage(targetMessage, dialog);
        
        // ANALYSE DES MESSAGES AUTOUR DU MESSAGE CIBLE
        await this.analyzeSurroundingMessages(messages, targetMessageIndex, dialog);
        
      } else {
        console.log('❌ Message cible non trouvé dans ce chat');
        
        // ANALYSE GÉNÉRALE DU CHAT
        await this.analyzeGeneralChat(messages, dialog);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du chat Engue:', error.message);
    }
  }

  async analyzeTargetMessage(message, dialog) {
    try {
      console.log('🔍 ANALYSE APPROFONDIE DU MESSAGE CIBLE');
      console.log('==================================================');
      
      const chatName = dialog.title || dialog.entity.username || 'Unknown';
      
      // 1. INFORMATIONS DE BASE DU MESSAGE
      console.log('📱 Informations de base:');
      console.log(`   Chat: ${chatName}`);
      console.log(`   Message ID: ${message.id}`);
      console.log(`   Date: ${message.date ? new Date(message.date * 1000).toISOString() : 'N/A'}`);
      console.log(`   Texte: "${message.message || 'Aucun texte'}"`);
      
      // 2. ANALYSE DU MÉDIA
      if (message.media && message.media.className === 'MessageMediaDocument') {
        const document = message.media.document;
        console.log('📁 ANALYSE DU DOCUMENT:');
        console.log(`   ID: ${document.id}`);
        console.log(`   MIME Type: ${document.mimeType || 'N/A'}`);
        console.log(`   Taille: ${document.size ? (document.size / 1024).toFixed(2) + ' KB' : 'N/A'}`);
        console.log(`   Access Hash: ${document.accessHash || 'N/A'}`);
        
        // 3. ANALYSE DES ATTRIBUTS
        if (document.attributes && document.attributes.length > 0) {
          console.log('📋 ATTRIBUTS DU DOCUMENT:');
          for (const attr of document.attributes) {
            console.log(`   📋 Type: ${attr.className}`);
            
            // Attributs spécifiques
            if (attr.alt) console.log(`      Alt: ${attr.alt}`);
            if (attr.fileName) console.log(`      Nom: ${attr.fileName}`);
            if (attr.duration) console.log(`      Durée: ${attr.duration}s`);
            if (attr.width && attr.height) console.log(`      Dimensions: ${attr.width}x${attr.height}`);
            if (attr.supportsStreaming) console.log(`      Streaming: ${attr.supportsStreaming}`);
            if (attr.supportsStreaming) console.log(`      Animated: ${attr.supportsStreaming}`);
          }
        }
        
        // 4. ANALYSE DES MÉTADONNÉES CACHÉES
        await this.analyzeHiddenMetadata(document, message);
      }
      
      // 5. ANALYSE DU CONTEXTE
      console.log('🔍 ANALYSE DU CONTEXTE:');
      if (message.replyTo) {
        console.log(`   Réponse à: Message ID ${message.replyTo.replyToMsgId}`);
      }
      if (message.forward) {
        console.log(`   Transféré depuis: ${message.forward.fromId || 'Unknown'}`);
      }
      
      console.log('==================================================');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du message cible:', error.message);
    }
  }

  async analyzeHiddenMetadata(document, message) {
    try {
      console.log('🔍 ANALYSE DES MÉTADONNÉES CACHÉES...');
      
      // 1. Vérifier s'il y a des métadonnées dans le nom du fichier
      if (document.attributes) {
        for (const attr of document.attributes) {
          if (attr.className === 'DocumentAttributeFilename' && attr.fileName) {
            console.log(`📝 Nom du fichier: ${attr.fileName}`);
            
            // Analyser le nom du fichier pour des patterns
            this.analyzeFilename(attr.fileName);
          }
        }
      }
      
      // 2. Vérifier le texte du message pour des métadonnées
      if (message.message) {
        console.log('📄 ANALYSE DU TEXTE DU MESSAGE:');
        this.analyzeMessageText(message.message);
      }
      
      // 3. Vérifier les messages précédents/suivants pour le contexte
      console.log('🔍 ANALYSE DU CONTEXTE TEMPOREL...');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des métadonnées cachées:', error.message);
    }
  }

  analyzeFilename(filename) {
    try {
      console.log(`🔍 ANALYSE DU NOM DE FICHIER: ${filename}`);
      
      // Patterns pour extraire des informations
      const patterns = [
        /lol\s*pop/i,
        /collectible/i,
        /(\d+)/g,
        /([a-z]+)\s*([a-z]+)/gi,
        /\.(mp4|mov|gif|webm)$/i
      ];
      
      for (const pattern of patterns) {
        const matches = filename.match(pattern);
        if (matches) {
          console.log(`   🎯 Pattern ${pattern.source}: ${matches.join(', ')}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du nom de fichier:', error.message);
    }
  }

  analyzeMessageText(text) {
    try {
      console.log(`🔍 ANALYSE DU TEXTE: "${text}"`);
      
      // Patterns spécifiques pour Lol Pop
      const lolPopPatterns = [
        /lol\s*pop/i,
        /collectible\s*#(\d+)/i,
        /model:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
        /backdrop:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
        /symbol:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
        /gold\s*star/i,
        /copper/i,
        /genie\s*lamp/i,
        /(\d+(?:\.\d+)?%)/g
      ];
      
      let hasLolPopInfo = false;
      for (const pattern of lolPopPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          if (!hasLolPopInfo) {
            console.log('   🎁 INFOS LOL POP TROUVÉES !');
            hasLolPopInfo = true;
          }
          console.log(`      🎯 ${pattern.source}: ${matches.join(' | ')}`);
        }
      }
      
      if (!hasLolPopInfo) {
        console.log('   ❌ Aucune info Lol Pop trouvée dans le texte');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du texte:', error.message);
    }
  }

  async analyzeSurroundingMessages(messages, targetIndex, dialog) {
    try {
      console.log('🔍 ANALYSE DES MESSAGES AUTOUR DU MESSAGE CIBLE...');
      console.log('==================================================');
      
      const chatName = dialog.title || dialog.entity.username || 'Unknown';
      const contextRange = 5; // Analyser 5 messages avant et après
      
      const startIndex = Math.max(0, targetIndex - contextRange);
      const endIndex = Math.min(messages.length - 1, targetIndex + contextRange);
      
      console.log(`📱 Analyse des messages ${startIndex} à ${endIndex} (autour de ${targetIndex})`);
      
      for (let i = startIndex; i <= endIndex; i++) {
        const message = messages[i];
        const isTarget = i === targetIndex;
        
        if (isTarget) {
          console.log(`🎯 >>> MESSAGE CIBLE (${i}) <<<`);
        } else {
          console.log(`📱 Message ${i}:`);
        }
        
        // Analyser le message
        await this.analyzeContextMessage(message, dialog, isTarget);
        
        if (i !== endIndex) console.log('---');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des messages environnants:', error.message);
    }
  }

  async analyzeContextMessage(message, dialog, isTarget) {
    try {
      const chatName = dialog.title || dialog.entity.username || 'Unknown';
      
      // Informations de base
      console.log(`   📱 Chat: ${chatName}`);
      console.log(`   🆔 ID: ${message.id}`);
      console.log(`   ⏰ Date: ${message.date ? new Date(message.date * 1000).toISOString() : 'N/A'}`);
      
      // Texte du message
      if (message.message) {
        console.log(`   📄 Texte: "${message.message}"`);
      }
      
      // Média
      if (message.media) {
        console.log(`   📁 Média: ${message.media.className}`);
        
        if (message.media.className === 'MessageMediaDocument') {
          const doc = message.media.document;
          console.log(`      🆔 Document ID: ${doc.id}`);
          console.log(`      📝 Type: ${doc.mimeType || 'N/A'}`);
          
          // Vérifier si c'est le document cible
          if (doc.id.toString() === this.targetDocumentId) {
            console.log(`      🎯 >>> DOCUMENT CIBLE DÉTECTÉ ! <<<`);
          }
        }
      }
      
      // Réponse/Transfert
      if (message.replyTo) {
        console.log(`   🔄 Réponse à: ${message.replyTo.replyToMsgId}`);
      }
      if (message.forward) {
        console.log(`   ➡️ Transféré depuis: ${message.forward.fromId || 'Unknown'}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du message de contexte:', error.message);
    }
  }

  async analyzeGeneralChat(messages, dialog) {
    try {
      console.log('🔍 ANALYSE GÉNÉRALE DU CHAT...');
      console.log('==================================================');
      
      const chatName = dialog.title || dialog.entity.username || 'Unknown';
      console.log(`📱 Chat: ${chatName}`);
      console.log(`📊 Total messages: ${messages.length}`);
      
      // Compter les types de médias
      let mediaCount = 0;
      let documentCount = 0;
      let webpageCount = 0;
      
      for (const message of messages) {
        if (message.media) {
          mediaCount++;
          if (message.media.className === 'MessageMediaDocument') documentCount++;
          if (message.media.className === 'MessageMediaWebPage') webpageCount++;
        }
      }
      
      console.log(`📊 Statistiques des médias:`);
      console.log(`   Total médias: ${mediaCount}`);
      console.log(`   Documents: ${documentCount}`);
      console.log(`   WebPages: ${webpageCount}`);
      
      // Chercher des patterns Lol Pop dans tous les messages
      console.log('🔍 Recherche de patterns Lol Pop dans tous les messages...');
      let lolPopMatches = 0;
      
      for (const message of messages) {
        if (message.message && /lol\s*pop/i.test(message.message)) {
          lolPopMatches++;
          console.log(`   🎁 Message ${message.id}: "${message.message}"`);
        }
      }
      
      console.log(`🎁 Total matches Lol Pop: ${lolPopMatches}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse générale:', error.message);
    }
  }

  async stop() {
    if (this.client) {
      await this.client.disconnect();
    }
    console.log('🛑 Extracteur de métadonnées Lol Pop arrêté');
  }
}

// Fonction principale
async function main() {
  const extractor = new LolPopMetadataExtractor();
  
  try {
    await extractor.start();
    
    // Attendre pour voir les résultats
    console.log('⏳ Attente de 10 secondes pour voir les résultats...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Erreur principale:', error.message);
  } finally {
    await extractor.stop();
  }
}

// Lancer l'extraction
if (require.main === module) {
  main().catch(console.error);
}

module.exports = LolPopMetadataExtractor;

