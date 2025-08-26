const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

async function analyzePersonalGifts() {
  console.log('🔍 ANALYSE DES GIFTS DANS LES CONVERSATIONS PERSONNELLES');
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
    
    let personalChats = 0;
    let giftsFound = 0;
    let realTelegramGifts = 0;
    
    // Analyser chaque dialogue
    for (const dialog of dialogs) {
      // Filtrer uniquement les conversations personnelles (pas les groupes/channels)
      if (dialog.entity && 
          (dialog.entity.className === 'User' || 
           dialog.entity.className === 'Chat' && dialog.entity.broadcast === false)) {
        
        personalChats++;
        console.log(`\n👤 CONVERSATION PERSONNELLE: ${dialog.title || 'Sans nom'}`);
        console.log('─'.repeat(60));
        console.log(`📱 Type: ${dialog.entity.className}`);
        
        try {
          // Récupérer les 100 derniers messages
          const messages = await client.getMessages(dialog.entity, { limit: 100 });
          console.log(`📨 ${messages.length} messages trouvés`);
          
          let chatGifts = 0;
          
          for (const message of messages) {
            // 🔍 PRIORITÉ 1: Vérifier les MessageService avec MessageActionStarGiftUnique
            if (message.className === 'MessageService' && 
                message.action && 
                message.action.className === 'MessageActionStarGiftUnique') {
              
              realTelegramGifts++;
              chatGifts++;
              giftsFound++;
              
              console.log(`\n🎁 🎯 VRAI GIFT TELEGRAM DÉTECTÉ ! (ID: ${message.id})`);
              console.log(`   📋 Action: ${message.action.className}`);
              
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
              
              // Essayer d'extraire l'expéditeur
              if (message.action.fromId && message.action.fromId.className === 'PeerUser') {
                console.log(`   👤 Expéditeur ID: ${message.action.fromId.userId}`);
              }
              
            }
            // 🔍 PRIORITÉ 2: Vérifier les messages avec médias (potentiels gifts)
            else if (message.className === 'Message' && message.media) {
              if (message.media.className === 'MessageMediaDocument') {
                const doc = message.media.document;
                // Vérifier si c'est un document qui pourrait être un gift
                if (doc.attributes && doc.attributes.some(attr => 
                  attr.className === 'DocumentAttributeVideo' || 
                  attr.className === 'DocumentAttributeSticker' ||
                  attr.className === 'DocumentAttributeAnimated'
                )) {
                  chatGifts++;
                  giftsFound++;
                  console.log(`\n📦 MÉDIA POTENTIEL (ID: ${message.id}):`);
                  console.log(`   📄 Document: ${doc.fileName || 'Sans nom'}`);
                  console.log(`   💾 Taille: ${doc.size} bytes`);
                  console.log(`   🎬 MIME: ${doc.mimeType}`);
                  
                  if (doc.attributes) {
                    console.log(`   🔍 Attributs:`);
                    doc.attributes.forEach(attr => {
                      console.log(`      - ${attr.className}: ${attr.name || 'N/A'}`);
                    });
                  }
                }
              }
            }
          }
          
          if (chatGifts > 0) {
            console.log(`\n✅ ${chatGifts} gift(s) trouvé(s) dans cette conversation`);
          } else {
            console.log(`\n❌ Aucun gift trouvé dans cette conversation`);
          }
          
        } catch (chatError) {
          console.warn(`⚠️ Erreur lors de l'analyse de ${dialog.title}:`, chatError.message);
          continue;
        }
      }
    }
    
    // Résumé final
    console.log('\n📊 RÉSUMÉ DE L\'ANALYSE DES CONVERSATIONS PERSONNELLES:');
    console.log('=============================================================');
    console.log(`👤 Conversations personnelles analysées: ${personalChats}`);
    console.log(`🎁 Total des gifts détectés: ${giftsFound}`);
    console.log(`🎯 Vrais gifts Telegram (MessageActionStarGiftUnique): ${realTelegramGifts}`);
    console.log(`📦 Médias potentiels: ${giftsFound - realTelegramGifts}`);
    
    if (realTelegramGifts > 0) {
      console.log('\n🎉 SUCCÈS: Des vrais gifts Telegram ont été détectés !');
      console.log('✅ Le système fonctionne correctement pour les gifts natifs');
    } else if (giftsFound > 0) {
      console.log('\n⚠️ ATTENTION: Seuls des médias potentiels ont été détectés');
      console.log('❌ Aucun vrai gift Telegram (MessageActionStarGiftUnique) trouvé');
    } else {
      console.log('\n❌ AUCUN GIFT: Aucun gift ou média détecté dans les conversations personnelles');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  } finally {
    await client.disconnect();
    console.log('\n🔌 Déconnecté de Telegram');
  }
}

// Lancer l'analyse
analyzePersonalGifts();

