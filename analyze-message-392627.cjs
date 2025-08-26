const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

async function analyzeMessage392627() {
  console.log('🔍 Analyse spécifique du message 392627...');
  
  const client = new TelegramClient(
    new StringSession(process.env.TELEGRAM_SESSION_STRING),
    parseInt(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH,
    { connectionRetries: 5 }
  );

  try {
    await client.start();
    console.log('✅ Connecté à Telegram');

    // Rechercher le chat avec "Engue"
    const dialogs = await client.getDialogs();
    const engueDialog = dialogs.find(dialog => 
      dialog.title && dialog.title.includes('Engue')
    );

    if (!engueDialog) {
      console.log('❌ Chat avec Engue non trouvé');
      return;
    }

    console.log(`📱 Chat trouvé: ${engueDialog.title}`);

    // Récupérer le message 392627 spécifiquement
    try {
      const message = await client.getMessages(engueDialog.entity, { ids: [392627] });
      
      if (message && message.length > 0) {
        const msg = message[0];
        console.log('\n🎯 ANALYSE DU MESSAGE 392627:');
        console.log('=====================================');
        console.log(`📱 Type de message: ${msg.className}`);
        console.log(`🆔 ID: ${msg.id}`);
        console.log(`📅 Date: ${new Date(msg.date * 1000).toISOString()}`);
        
        // Vérifier si c'est un gift natif Telegram
        if (msg.action && msg.action.className === 'MessageActionStarGiftUnique') {
          console.log('🎁 ✅ C\'EST UN VRAI GIFT TELEGRAM !');
          console.log(`📋 Action: ${msg.action.className}`);
          
          if (msg.action.gift) {
            const gift = msg.action.gift;
            console.log(`🎁 Titre: ${gift.title}`);
            console.log(`🆔 Slug: ${gift.slug}`);
            console.log(`🔢 Numéro: ${gift.num}`);
            console.log(`💰 Coût: ${msg.action.transferStars} stars`);
            
            if (gift.attributes && gift.attributes.length > 0) {
              console.log('⭐ Attributs:');
              gift.attributes.forEach(attr => {
                console.log(`   - ${attr.name}: ${attr.rarityPermille}‰ (${attr.className})`);
              });
            }
          }
        } else {
          console.log('❌ Ce n\'est PAS un gift natif Telegram');
          console.log(`📋 Type d\'action: ${msg.action ? msg.action.className : 'Aucune'}`);
        }
        
        // Vérifier la fonction isRealTelegramGift
        console.log('\n🔍 TEST DE LA FONCTION isRealTelegramGift:');
        console.log('=====================================');
        
        // Simuler la logique de détection
        if (msg.action && msg.action.className === 'MessageActionStarGiftUnique') {
          console.log('✅ DÉTECTÉ comme gift natif Telegram');
        } else {
          console.log('❌ NON DÉTECTÉ comme gift natif Telegram');
        }
        
      } else {
        console.log('❌ Message 392627 non trouvé');
      }
      
    } catch (msgError) {
      console.error('❌ Erreur lors de la récupération du message:', msgError.message);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.disconnect();
  }
}

analyzeMessage392627();

