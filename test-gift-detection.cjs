const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

// Script de test pour simuler la détection de gifts en temps réel
async function testGiftDetection() {
  console.log('🧪 TEST DE DÉTECTION DE GIFTS EN TEMPS RÉEL');
  console.log('==========================================');
  
  try {
    // Créer le client Telegram
    const client = new TelegramClient(
      new StringSession(process.env.TELEGRAM_SESSION_STRING),
      parseInt(process.env.TELEGRAM_API_ID),
      process.env.TELEGRAM_API_HASH,
      { connectionRetries: 5 }
    );
    
    await client.start();
    console.log('✅ Connecté à Telegram');
    
    // Simuler un gift reçu
    console.log('\n🎁 SIMULATION D\'UN GIFT REÇU EN TEMPS RÉEL...');
    
    // Créer un objet message simulé avec MessageActionStarGiftUnique
    const simulatedGiftMessage = {
      id: 999999,
      action: {
        className: 'MessageActionStarGiftUnique',
        transferStars: 25,
        gift: {
          title: 'Test Gift - Lol Pop',
          slug: 'TestLolPop-99999',
          num: 99999,
          attributes: [
            {
              className: 'StarGiftAttributeModel',
              name: 'Test Gold Star',
              rarityPermille: 15
            },
            {
              className: 'StarGiftAttributePattern',
              name: 'Test Genie Lamp',
              rarityPermille: 8
            },
            {
              className: 'StarGiftAttributeBackdrop',
              name: 'Test Copper',
              rarityPermille: 25
            }
          ]
        }
      },
      fromId: {
        className: 'PeerUser',
        userId: 123456789
      },
      sender: {
        username: 'testuser'
      },
      message: 'Test gift message',
      date: Math.floor(Date.now() / 1000)
    };
    
    console.log('📋 Message simulé créé avec succès');
    console.log('🎁 Type d\'action:', simulatedGiftMessage.action.className);
    console.log('💰 Coût en stars:', simulatedGiftMessage.action.transferStars);
    console.log('🏷️ Titre du gift:', simulatedGiftMessage.action.gift.title);
    console.log('🆔 Slug:', simulatedGiftMessage.action.gift.slug);
    console.log('⭐ Attributs:', simulatedGiftMessage.action.gift.attributes.length);
    
    // Tester la fonction isRealTelegramGift
    console.log('\n🔍 TEST DE LA FONCTION isRealTelegramGift...');
    
    // Importer la classe TelegramGiftDetector
    const TelegramGiftDetector = require('./services/telegramGiftDetector.cjs');
    
    // Créer une instance de test
    const testDetector = new TelegramGiftDetector({
      telegramApiId: process.env.TELEGRAM_API_ID,
      telegramApiHash: process.env.TELEGRAM_API_HASH,
      telegramSessionString: process.env.TELEGRAM_SESSION_STRING,
      depositAccountUsername: 'WxyzCrypto',
      webhookUrl: process.env.WEBHOOK_URL || 'https://test.com',
      webhookSecret: process.env.WEBHOOK_SECRET || 'test',
      apiKey: process.env.DEPOSIT_API_KEY || 'test'
    });
    
    // Tester la détection
    const isGift = testDetector.isRealTelegramGift(simulatedGiftMessage);
    console.log('✅ Résultat de isRealTelegramGift:', isGift);
    
    if (isGift) {
      console.log('🎉 SUCCÈS ! Le gift simulé est détecté comme un vrai gift Telegram');
      
      // Tester l'extraction des métadonnées
      console.log('\n🔍 TEST DE L\'EXTRACTION DES MÉTADONNÉES...');
      const giftInfo = testDetector.extractGiftInfo(simulatedGiftMessage);
      
      if (giftInfo) {
        console.log('✅ Métadonnées extraites avec succès:');
        console.log('   🏷️ Nom:', giftInfo.giftName);
        console.log('   🆔 Collectible ID:', giftInfo.collectibleId);
        console.log('   💰 Valeur:', giftInfo.giftValue);
        console.log('   🎭 Type:', giftInfo.giftType);
        console.log('   📱 Media Type:', giftInfo.mediaType);
        console.log('   👤 User ID:', giftInfo.fromUserId);
        console.log('   🏷️ Username:', giftInfo.fromUsername);
        console.log('   ⭐ Modèle:', giftInfo.collectibleModel);
        console.log('   🎨 Backdrop:', giftInfo.collectibleBackdrop);
        console.log('   🔮 Symbole:', giftInfo.collectibleSymbol);
        
        console.log('\n🎯 TEST COMPLET RÉUSSI !');
        console.log('Votre système détecte parfaitement les gifts Telegram !');
      } else {
        console.log('❌ Échec de l\'extraction des métadonnées');
      }
    } else {
      console.log('❌ ÉCHEC ! Le gift simulé n\'est pas détecté');
    }
    
    await client.disconnect();
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
console.log('🚀 Démarrage du test de détection...');
testGiftDetection();

