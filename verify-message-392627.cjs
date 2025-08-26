// Script de vérification finale du message 392627
// Pour confirmer s'il contient le gift Lol Pop #14559
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

class MessageVerifier {
  constructor() {
    this.telegramApiId = parseInt(process.env.TELEGRAM_API_ID);
    this.telegramApiHash = process.env.TELEGRAM_API_HASH;
    this.telegramSessionString = process.env.TELEGRAM_SESSION_STRING;
    this.client = null;
    
    // Message à vérifier
    this.targetMessageId = 392627;
  }

  async start() {
    try {
      console.log('🔍 VÉRIFICATION FINALE DU MESSAGE 392627');
      console.log('==================================================');
      console.log(`🎯 Message cible: ${this.targetMessageId}`);
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
        
        // VÉRIFICATION FINALE DU MESSAGE
        console.log('🎯 Démarrage de la vérification finale...');
        await this.verifyTargetMessage();
        
      } else {
        throw new Error('Non autorisé sur Telegram');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error.message);
      throw error;
    }
  }

  async verifyTargetMessage() {
    try {
      console.log('🔍 Recherche du message 392627...');
      
      // Récupérer tous les dialogues (chats privés)
      const dialogs = await this.client.getDialogs({ limit: 100 });
      
      for (const dialog of dialogs) {
        // Seulement les chats privés
        if (dialog.isUser) {
          const chatName = dialog.title || dialog.entity.username || 'Unknown';
          
          // Se concentrer sur le chat avec Engue
          if (chatName.toLowerCase().includes('engue')) {
            console.log(`🎯 ANALYSE DU CHAT AVEC: ${chatName}`);
            console.log('==================================================');
            
            await this.analyzeEngueChatForMessage(dialog);
            break; // Sortir après avoir trouvé Engue
          }
        }
      }
      
      console.log('✅ Vérification finale terminée');
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification finale:', error.message);
    }
  }

  async analyzeEngueChatForMessage(dialog) {
    try {
      // Récupérer TOUS les messages du chat avec Engue
      console.log('📱 Récupération de tous les messages du chat avec Engue...');
      const messages = await this.client.getMessages(dialog.entity, { limit: 1000 });
      
      console.log(`📊 Nombre total de messages: ${messages.length}`);
      
      // Rechercher le message spécifique 392627
      let targetMessage = null;
      let targetMessageIndex = -1;
      
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (message.id === this.targetMessageId) {
          targetMessage = message;
          targetMessageIndex = i;
          break;
        }
      }
      
      if (targetMessage) {
        console.log(`🎯 MESSAGE 392627 TROUVÉ ! Index: ${targetMessageIndex}`);
        console.log('==================================================');
        
        // ANALYSE APPROFONDIE DU MESSAGE 392627
        await this.analyzeMessage392627(targetMessage, dialog);
        
        // ANALYSE DES MESSAGES AUTOUR
        await this.analyzeSurroundingMessages(messages, targetMessageIndex, dialog);
        
      } else {
        console.log('❌ Message 392627 non trouvé dans ce chat');
        
        // Lister tous les messages pour debug
        console.log('🔍 Liste de tous les messages trouvés:');
        for (let i = 0; i < Math.min(messages.length, 20); i++) {
          const msg = messages[i];
          console.log(`   ${i}: ID ${msg.id} - ${msg.date ? new Date(msg.date * 1000).toISOString() : 'N/A'} - ${msg.media ? msg.media.className : 'Texte'}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du chat Engue:', error.message);
    }
  }

  async analyzeMessage392627(message, dialog) {
    try {
      console.log('🔍 ANALYSE APPROFONDIE DU MESSAGE 392627');
      console.log('==================================================');
      
      const chatName = dialog.title || dialog.entity.username || 'Unknown';
      
      // 1. INFORMATIONS DE BASE DU MESSAGE
      console.log('📱 Informations de base:');
      console.log(`   Chat: ${chatName}`);
      console.log(`   Message ID: ${message.id}`);
      console.log(`   Date: ${message.date ? new Date(message.date * 1000).toISOString() : 'N/A'}`);
      console.log(`   Texte: "${message.message || 'Aucun texte'}"`);
      
      // 2. ANALYSE DU MÉDIA
      if (message.media) {
        console.log('📁 ANALYSE DU MÉDIA:');
        console.log(`   Type: ${message.media.className}`);
        
        if (message.media.className === 'MessageMediaDocument') {
          const document = message.media.document;
          console.log(`   🆔 Document ID: ${document.id}`);
          console.log(`   📝 MIME Type: ${document.mimeType || 'N/A'}`);
          console.log(`   📏 Taille: ${document.size ? (document.size / 1024).toFixed(2) + ' KB' : 'N/A'}`);
          console.log(`   🔑 Access Hash: ${document.accessHash || 'N/A'}`);
          
          // ANALYSE DES ATTRIBUTS
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
          
          // ANALYSE DES MÉTADONNÉES CACHÉES
          await this.analyzeHiddenMetadata(document, message);
          
        } else if (message.media.className === 'MessageMediaWebPage') {
          const webpage = message.media.webpage;
          console.log(`   🔗 URL: ${webpage.url || 'N/A'}`);
          console.log(`   📄 Titre: ${webpage.title || 'N/A'}`);
          console.log(`   📋 Description: ${webpage.description || 'N/A'}`);
          
          // Vérifier si c'est un collectible NFT
          if (webpage.url && webpage.url.includes('t.me/nft/')) {
            console.log('🎁 COLLECTIBLE NFT DÉTECTÉ !');
            this.analyzeNFTMetadata(webpage);
          }
        }
      } else {
        console.log('❌ Aucun média dans ce message');
      }
      
      // 3. ANALYSE DU CONTEXTE
      console.log('🔍 ANALYSE DU CONTEXTE:');
      if (message.replyTo) {
        console.log(`   Réponse à: Message ID ${message.replyTo.replyToMsgId}`);
      }
      if (message.forward) {
        console.log(`   Transféré depuis: ${message.forward.fromId || 'Unknown'}`);
      }
      
      console.log('==================================================');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du message 392627:', error.message);
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
        /\.(mp4|mov|gif|webm|jpg|png)$/i
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

  analyzeNFTMetadata(webpage) {
    try {
      console.log('🔍 ANALYSE DES MÉTADONNÉES NFT...');
      
      if (webpage.url) {
        const urlMatch = webpage.url.match(/\/nft\/(.+?)[-\d]*$/);
        if (urlMatch) {
          const collectibleName = urlMatch[1].replace(/-/g, ' ');
          console.log(`🎁 Nom du collectible: ${collectibleName}`);
        }
        
        const numberMatch = webpage.url.match(/-(\d+)$/);
        if (numberMatch) {
          console.log(`🔢 Numéro du collectible: #${numberMatch[1]}`);
        }
      }
      
      if (webpage.description) {
        console.log(`📋 Description: ${webpage.description}`);
        
        // Recherche de métadonnées dans la description
        const metadataPatterns = [
          /Model:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
          /Backdrop:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
          /Symbol:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i
        ];
        
        for (const pattern of metadataPatterns) {
          const match = webpage.description.match(pattern);
          if (match) {
            console.log(`   🎯 ${pattern.source}: ${match[1]} ${match[2]}`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des métadonnées NFT:', error.message);
    }
  }

  async analyzeSurroundingMessages(messages, targetIndex, dialog) {
    try {
      console.log('🔍 ANALYSE DES MESSAGES AUTOUR DU MESSAGE 392627...');
      console.log('==================================================');
      
      const chatName = dialog.title || dialog.entity.username || 'Unknown';
      const contextRange = 3; // Analyser 3 messages avant et après
      
      const startIndex = Math.max(0, targetIndex - contextRange);
      const endIndex = Math.min(messages.length - 1, targetIndex + contextRange);
      
      console.log(`📱 Analyse des messages ${startIndex} à ${endIndex} (autour de ${targetIndex})`);
      
      for (let i = startIndex; i <= endIndex; i++) {
        const message = messages[i];
        const isTarget = i === targetIndex;
        
        if (isTarget) {
          console.log(`🎯 >>> MESSAGE 392627 (${i}) <<<`);
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
          
          // Vérifier si c'est le message cible
          if (message.id === this.targetMessageId) {
            console.log(`      🎯 >>> MESSAGE 392627 DÉTECTÉ ! <<<`);
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

  async stop() {
    if (this.client) {
      await this.client.disconnect();
    }
    console.log('🛑 Vérificateur de message arrêté');
  }
}

// Fonction principale
async function main() {
  const verifier = new MessageVerifier();
  
  try {
    await verifier.start();
    
    // Attendre pour voir les résultats
    console.log('⏳ Attente de 15 secondes pour voir les résultats...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('❌ Erreur principale:', error.message);
  } finally {
    await verifier.stop();
  }
}

// Lancer la vérification
if (require.main === module) {
  main().catch(console.error);
}

module.exports = MessageVerifier;

