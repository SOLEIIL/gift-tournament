// Script d'analyse approfondie des collectibles Telegram
// Spécialement conçu pour extraire les métadonnées complètes
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

class CollectibleAnalyzer {
  constructor() {
    this.telegramApiId = parseInt(process.env.TELEGRAM_API_ID);
    this.telegramApiHash = process.env.TELEGRAM_API_HASH;
    this.telegramSessionString = process.env.TELEGRAM_SESSION_STRING;
    this.client = null;
  }

  async start() {
    try {
      console.log('🔍 Démarrage de l\'analyseur de collectibles Telegram...');
      console.log('==================================================');
      
      // Validation de la configuration
      if (!this.telegramApiId || !this.telegramApiHash || !this.telegramSessionString) {
        throw new Error('Configuration Telegram incomplète');
      }
      
      console.log('✅ Configuration validée');
      console.log(`   API_ID: ${this.telegramApiId}`);
      console.log(`   API_HASH: ${this.telegramApiHash.substring(0, 20)}...`);
      console.log(`   SESSION: ${this.telegramSessionString.substring(0, 20)}...`);
      
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
        
        // ANALYSE APPROFONDIE DES COLLECTIBLES
        console.log('🎯 Démarrage de l\'analyse approfondie des collectibles...');
        await this.deepAnalyzeCollectibles();
        
      } else {
        throw new Error('Non autorisé sur Telegram');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error.message);
      throw error;
    }
  }

  async deepAnalyzeCollectibles() {
    try {
      console.log('🔍 Recherche approfondie des collectibles...');
      
      // Récupérer tous les dialogues (chats privés)
      const dialogs = await this.client.getDialogs({ limit: 100 });
      
      for (const dialog of dialogs) {
        // Seulement les chats privés
        if (dialog.isUser) {
          try {
            console.log(`📱 Analyse approfondie du chat avec: ${dialog.title || dialog.entity.username || 'Unknown'}`);
            
            // Récupérer les derniers messages (limite à 100 pour une analyse complète)
            const messages = await this.client.getMessages(dialog.entity, { limit: 100 });
            
            for (const message of messages) {
              // ANALYSE APPROFONDIE DE CHAQUE MESSAGE
              await this.analyzeMessageDeep(message, dialog);
            }
            
          } catch (error) {
            console.log(`⚠️ Erreur lors de l'analyse de ${dialog.title}: ${error.message}`);
          }
        }
      }
      
      console.log('✅ Analyse approfondie terminée');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse approfondie:', error.message);
    }
  }

  async analyzeMessageDeep(message, dialog) {
    try {
      // 1. ANALYSE DES WEBPAGES (COLLECTIBLES)
      if (message.media && message.media.className === 'MessageMediaWebPage') {
        console.log('🌐 WEBPAGE DÉTECTÉE - ANALYSE APPROFONDIE EN COURS...');
        
        const webpage = message.media.webpage;
        const chatName = dialog.title || dialog.entity.username || 'Unknown';
        
        console.log(`📱 Chat: ${chatName}`);
        console.log(`🔗 URL: ${webpage.url || 'N/A'}`);
        console.log(`📄 Titre: ${webpage.title || 'N/A'}`);
        console.log(`📋 Description: ${webpage.description || 'N/A'}`);
        
        // ANALYSE SPÉCIFIQUE POUR LES COLLECTIBLES NFT
        if (webpage.url && webpage.url.includes('t.me/nft/')) {
          console.log('🎁 COLLECTIBLE NFT DÉTECTÉ ! ANALYSE COMPLÈTE...');
          await this.analyzeNFTCollectible(message, webpage, chatName);
        }
        
        // ANALYSE DES AUTRES TYPES DE WEBPAGES
        if (webpage.description) {
          this.analyzeWebPageContent(webpage.description, chatName);
        }
        
        console.log('---');
      }
      
      // 2. ANALYSE DES MÉDIAS AVEC MÉTADONNÉES
      if (message.media && message.media.className === 'MessageMediaDocument') {
        const document = message.media.document;
        if (document && document.attributes) {
          console.log('📁 DOCUMENT AVEC ATTRIBUTS - ANALYSE DES MÉTADONNÉES...');
          
          const chatName = dialog.title || dialog.entity.username || 'Unknown';
          console.log(`📱 Chat: ${chatName}`);
          console.log(`🆔 Document ID: ${document.id}`);
          console.log(`📝 MIME Type: ${document.mimeType || 'N/A'}`);
          
          for (const attr of document.attributes) {
            console.log(`   📋 Attribut: ${attr.className}`);
            if (attr.alt) console.log(`      Alt: ${attr.alt}`);
            if (attr.fileName) console.log(`      Nom: ${attr.fileName}`);
          }
          
          console.log('---');
        }
      }
      
      // 3. ANALYSE DU TEXTE POUR LES COLLECTIBLES
      if (message.message) {
        const messageText = message.message;
        const chatName = dialog.title || dialog.entity.username || 'Unknown';
        
        // Recherche de patterns de collectibles
        const collectiblePatterns = [
          /(.+?)\s*Collectible\s*#(\d+)/i,
          /Model:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
          /Backdrop:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
          /Symbol:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
          /transferred a unique collectible/i,
          /sent you a (.+) collectible/i
        ];
        
        let hasCollectibleInfo = false;
        for (const pattern of collectiblePatterns) {
          if (pattern.test(messageText)) {
            if (!hasCollectibleInfo) {
              console.log('📝 MESSAGE AVEC INFOS DE COLLECTIBLE - ANALYSE...');
              console.log(`📱 Chat: ${chatName}`);
              hasCollectibleInfo = true;
            }
            
            const match = messageText.match(pattern);
            if (match) {
              console.log(`   🎯 Pattern trouvé: ${pattern.source}`);
              console.log(`      Match: ${match.slice(1).join(' | ')}`);
            }
          }
        }
        
        if (hasCollectibleInfo) {
          console.log(`   📄 Texte complet: "${messageText}"`);
          console.log('---');
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse approfondie du message:', error.message);
    }
  }

  async analyzeNFTCollectible(message, webpage, chatName) {
    try {
      console.log('🔍 ANALYSE COMPLÈTE DU COLLECTIBLE NFT...');
      
      // 1. EXTRACTION DEPUIS L'URL
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
      
      // 2. EXTRACTION DEPUIS LE TITRE
      if (webpage.title) {
        console.log(`📄 Titre de la page: ${webpage.title}`);
      }
      
      // 3. EXTRACTION DEPUIS LA DESCRIPTION
      if (webpage.description) {
        console.log(`📋 Description complète:`);
        console.log(`   ${webpage.description}`);
        
        // Analyse des métadonnées dans la description
        this.extractMetadataFromDescription(webpage.description);
      }
      
      // 4. EXTRACTION DE L'EXPÉDITEUR
      if (message.from) {
        console.log(`👤 Expéditeur: ${message.from.username || message.from.firstName || 'Unknown'} (ID: ${message.from.id})`);
      } else if (message.peerId && message.peerId.userId) {
        console.log(`👤 Expéditeur ID: ${message.peerId.userId}`);
      }
      
      // 5. EXTRACTION DU TIMESTAMP
      if (message.date) {
        console.log(`⏰ Date: ${new Date(message.date * 1000).toISOString()}`);
      }
      
      console.log('🎯 ANALYSE DU COLLECTIBLE TERMINÉE');
      console.log('==================================================');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du collectible NFT:', error.message);
    }
  }

  extractMetadataFromDescription(description) {
    try {
      console.log('🔍 EXTRACTION DES MÉTADONNÉES DEPUIS LA DESCRIPTION...');
      
      // Patterns pour les métadonnées des collectibles
      const patterns = {
        collectible: /(.+?)\s*Collectible\s*#(\d+)/i,
        model: /Model:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
        backdrop: /Backdrop:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
        symbol: /Symbol:\s*(.+?)\s*(\d+(?:\.\d+)?%)/i,
        rarity: /(\d+(?:\.\d+)?%)/g,
        quantity: /(\d+(?:,\d+)*)\s*sur\s*(\d+(?:,\d+)*)\s*émis/i,
        blockchain: /(TON|Ethereum|Solana|Polygon)/i,
        collection: /Collection:\s*(.+)/i
      };
      
      // Extraire chaque type de métadonnée
      for (const [key, pattern] of Object.entries(patterns)) {
        const matches = description.match(pattern);
        if (matches) {
          if (key === 'rarity') {
            console.log(`   🏆 Raretés trouvées: ${matches.slice(1).join(', ')}`);
          } else if (key === 'quantity') {
            console.log(`   📊 Quantité: ${matches[1]} sur ${matches[2]} émis`);
          } else {
            console.log(`   🎯 ${key.charAt(0).toUpperCase() + key.slice(1)}: ${matches.slice(1).join(' | ')}`);
          }
        }
      }
      
      // Recherche de patterns additionnels
      const additionalPatterns = [
        /transferred a unique collectible (.+)/i,
        /sent you a (.+) collectible/i,
        /(.+) gift/i,
        /Premium (.+)/i,
        /Limited (.+)/i
      ];
      
      for (const pattern of additionalPatterns) {
        const match = description.match(pattern);
        if (match) {
          console.log(`   🎁 Info additionnelle: ${match[1]}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction des métadonnées:', error.message);
    }
  }

  analyzeWebPageContent(content, chatName) {
    try {
      console.log('🔍 ANALYSE DU CONTENU DE LA WEBPAGE...');
      
      // Recherche de mots-clés liés aux collectibles
      const collectibleKeywords = [
        'collectible', 'NFT', 'gift', 'premium', 'limited', 'rare',
        'model', 'backdrop', 'symbol', 'rarity', 'collection'
      ];
      
      const foundKeywords = [];
      for (const keyword of collectibleKeywords) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          foundKeywords.push(keyword);
        }
      }
      
      if (foundKeywords.length > 0) {
        console.log(`   🎯 Mots-clés de collectible trouvés: ${foundKeywords.join(', ')}`);
      }
      
      // Recherche de pourcentages (rareté)
      const percentageMatches = content.match(/(\d+(?:\.\d+)?%)/g);
      if (percentageMatches) {
        console.log(`   🏆 Pourcentages trouvés: ${percentageMatches.join(', ')}`);
      }
      
      // Recherche de nombres (quantités, IDs)
      const numberMatches = content.match(/#(\d+)/g);
      if (numberMatches) {
        console.log(`   🔢 Numéros trouvés: ${numberMatches.join(', ')}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du contenu:', error.message);
    }
  }

  async stop() {
    if (this.client) {
      await this.client.disconnect();
    }
    console.log('🛑 Analyseur de collectibles arrêté');
  }
}

// Fonction principale
async function main() {
  const analyzer = new CollectibleAnalyzer();
  
  try {
    await analyzer.start();
    
    // Attendre un peu pour voir les résultats
    console.log('⏳ Attente de 30 secondes pour voir les résultats...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
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

module.exports = CollectibleAnalyzer;

