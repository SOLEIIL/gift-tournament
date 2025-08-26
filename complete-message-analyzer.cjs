const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

async function analyzeAllMessages() {
  console.log('🔍 ANALYSE COMPLÈTE DES MESSAGES REÇUS SUR @WxyzCrypto');
  console.log('========================================================');
  
  const client = new TelegramClient(
    new StringSession(process.env.TELEGRAM_SESSION_STRING),
    parseInt(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH,
    { connectionRetries: 5 }
  );

  try {
    await client.start();
    console.log('✅ Connecté à Telegram');
    
    // Récupérer tous les dialogues
    const dialogs = await client.getDialogs();
    console.log(`📱 ${dialogs.length} dialogues trouvés`);
    
    let totalMessages = 0;
    let giftsFound = 0;
    let mediaFound = 0;
    let textMessages = 0;
    let serviceMessages = 0;
    
    // Analyser chaque dialogue
    for (const dialog of dialogs) {
      if (dialog.title && dialog.title !== 'Telegram' && dialog.title !== 'Junction Bot') {
        console.log(`\n📱 ANALYSE DU CHAT: ${dialog.title}`);
        console.log('─'.repeat(50));
        
        try {
          // Récupérer les 100 derniers messages
          const messages = await client.getMessages(dialog.entity, { limit: 100 });
          console.log(`📨 ${messages.length} messages trouvés dans ce chat`);
          
          for (const message of messages) {
            totalMessages++;
            
            // Analyser le type de message
            if (message.className === 'Message') {
              // Message normal
              if (message.media) {
                mediaFound++;
                console.log(`🎁 MÉDIA DÉTECTÉ (ID: ${message.id}):`);
                console.log(`   📱 Type: ${message.media.className}`);
                
                if (message.media.className === 'MessageMediaDocument') {
                  console.log(`   📄 Document: ${message.media.document?.fileName || 'Sans nom'}`);
                  console.log(`   💾 Taille: ${message.media.document?.size || 'Inconnue'} bytes`);
                  console.log(`   🎬 MIME: ${message.media.document?.mimeType || 'Inconnu'}`);
                } else if (message.media.className === 'MessageMediaPhoto') {
                  console.log(`   📸 Photo détectée`);
                } else if (message.media.className === 'MessageMediaWebPage') {
                  console.log(`   🌐 Page web: ${message.media.webpage?.title || 'Sans titre'}`);
                  console.log(`   🔗 URL: ${message.media.webpage?.url || 'Inconnue'}`);
                }
                
                if (message.message) {
                  console.log(`   💬 Texte: "${message.message}"`);
                }
                
                // Vérifier si c'est un gift
                if (message.media.className === 'MessageMediaDocument' && 
                    message.media.document?.attributes?.some(attr => 
                      attr.className === 'DocumentAttributeVideo' || 
                      attr.className === 'DocumentAttributeSticker'
                    )) {
                  giftsFound++;
                  console.log(`   🎁 ✅ POTENTIEL GIFT DÉTECTÉ !`);
                }
                
              } else if (message.message) {
                textMessages++;
                console.log(`💬 MESSAGE TEXTE (ID: ${message.id}): "${message.message}"`);
              }
              
            } else if (message.className === 'MessageService') {
              serviceMessages++;
              console.log(`🔧 MESSAGE SERVICE (ID: ${message.id}):`);
              
              if (message.action) {
                console.log(`   📋 Action: ${message.action.className}`);
                
                // Vérifier si c'est un gift natif Telegram
                if (message.action.className === 'MessageActionStarGiftUnique') {
                  giftsFound++;
                  console.log(`   🎁 ✅ VRAI GIFT TELEGRAM DÉTECTÉ !`);
                  
                  if (message.action.gift) {
                    const gift = message.action.gift;
                    console.log(`   🏷️ Titre: ${gift.title}`);
                    console.log(`   🆔 Slug: ${gift.slug}`);
                    console.log(`   🔢 Numéro: ${gift.num}`);
                    console.log(`   💰 Coût: ${message.action.transferStars} stars`);
                    
                    if (gift.attributes && gift.attributes.length > 0) {
                      console.log(`   ⭐ Attributs:`);
                      gift.attributes.forEach(attr => {
                        console.log(`      - ${attr.name}: ${attr.rarityPermille}‰ (${attr.className})`);
                      });
                    }
                  }
                }
              }
            }
          }
          
        } catch (chatError) {
          console.warn(`⚠️ Erreur lors de l'analyse du chat ${dialog.title}:`, chatError.message);
          continue;
        }
      }
    }
    
    // Résumé final
    console.log('\n📊 RÉSUMÉ DE L\'ANALYSE COMPLÈTE:');
    console.log('=====================================');
    console.log(`📨 Total des messages analysés: ${totalMessages}`);
    console.log(`🎁 Gifts détectés: ${giftsFound}`);
    console.log(`📱 Médias trouvés: ${mediaFound}`);
    console.log(`💬 Messages texte: ${textMessages}`);
    console.log(`🔧 Messages de service: ${serviceMessages}`);
    
    if (giftsFound > 0) {
      console.log('\n🎉 RÉSULTAT: Des gifts ont été détectés sur le compte !');
    } else {
      console.log('\n❌ RÉSULTAT: Aucun gift détecté sur le compte.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  } finally {
    await client.disconnect();
    console.log('\n🔌 Déconnecté de Telegram');
  }
}

// Lancer l'analyse
analyzeAllMessages();
