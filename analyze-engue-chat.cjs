const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

async function analyzeEngueChat() {
  console.log('🔍 Analyse complète du chat avec Engue...');
  
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
    console.log(`🆔 ID du chat: ${engueDialog.entity.id}`);

    // Récupérer les 50 derniers messages
    const messages = await client.getMessages(engueDialog.entity, {
      limit: 50,
      reverse: true
    });

    console.log(`\n📨 ${messages.length} messages analysés:`);
    console.log('==================================================');

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      console.log(`\n🔍 Message ${i + 1}:`);
      console.log(`   📅 Date: ${new Date(message.date * 1000).toISOString()}`);
      console.log(`   🆔 ID: ${message.id}`);
      console.log(`   👤 Type: ${message.className}`);
      
      // Vérifier si c'est un gift natif Telegram
      if (message.action && message.action.className === 'MessageActionStarGiftUnique') {
        console.log(`   🎁 GIFT NATIF DÉTECTÉ !`);
        console.log(`   📋 Action: ${message.action.className}`);
        
        if (message.action.gift) {
          const gift = message.action.gift;
          console.log(`   🎯 Titre: ${gift.title}`);
          console.log(`   🆔 Slug: ${gift.slug}`);
          console.log(`   🔢 Numéro: ${gift.num}`);
          console.log(`   💰 Coût: ${message.action.transferStars} stars`);
          
          if (gift.attributes && gift.attributes.length > 0) {
            console.log(`   ⭐ Attributs:`);
            gift.attributes.forEach(attr => {
              console.log(`      - ${attr.name}: ${attr.rarityPermille}‰`);
            });
          }
        }
      }
      
      // Vérifier les médias
      if (message.media) {
        console.log(`   📱 Média: ${message.media.className}`);
        if (message.media.className === 'MessageMediaDocument') {
          const doc = message.media.document;
          console.log(`      📄 Nom: ${doc.fileName || 'Sans nom'}`);
          console.log(`      🆔 ID: ${doc.id}`);
          console.log(`      📋 Type: ${doc.mimeType}`);
        }
      }
      
      // Vérifier le texte
      if (message.message && message.message.length > 0) {
        console.log(`   💬 Texte: "${message.message.substring(0, 100)}${message.message.length > 100 ? '...' : ''}"`);
      }
      
      console.log('   ---');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.disconnect();
  }
}

analyzeEngueChat();

