const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

async function cleanAccount() {
  console.log('🧹 Script de nettoyage du compte @WxyzCrypto...');
  
  // Configuration
  const apiId = parseInt(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const sessionString = process.env.TELEGRAM_SESSION_STRING;
  
  if (!apiId || !apiHash || !sessionString) {
    console.error('❌ Variables d\'environnement manquantes dans .env');
    return;
  }
  
  const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 5,
  });
  
  try {
    console.log('🔌 Connexion au compte...');
    await client.start();
    
    const me = await client.getMe();
    console.log(`✅ Connecté en tant que: @${me.username} (${me.firstName})`);
    
    console.log('🧹 Nettoyage du compte en cours...');
    
    // Obtenir tous les dialogues
    const dialogs = await client.getDialogs();
    let leftCount = 0;
    let errorCount = 0;
    
    for (const dialog of dialogs) {
      try {
        // Ignorer les conversations privées (saved messages)
        if (dialog.isUser && dialog.entity.id.toString() === me.id.toString()) {
          console.log(`💾 Conversation privée ignorée: ${dialog.title}`);
          continue;
        }
        
        if (dialog.isChannel) {
          console.log(`🚪 Quitte canal: ${dialog.title}`);
          
          try {
            // Utiliser la méthode native pour quitter les canaux
            await client.invoke({
              _: 'channels.leaveChannel',
              channel: {
                _: 'inputChannel',
                channelId: BigInt(dialog.entity.id),
                accessHash: BigInt(dialog.entity.accessHash)
              }
            });
            leftCount++;
            console.log(`✅ Canal quitté: ${dialog.title}`);
          } catch (leaveError) {
            console.error(`❌ Erreur lors du départ de ${dialog.title}:`, leaveError.message);
            errorCount++;
          }
          
        } else if (dialog.isGroup) {
          console.log(`🚪 Quitte groupe: ${dialog.title}`);
          
          try {
            // Utiliser la méthode native pour quitter les groupes
            await client.invoke({
              _: 'messages.deleteChat',
              chatId: BigInt(dialog.entity.id)
            });
            leftCount++;
            console.log(`✅ Groupe quitté: ${dialog.title}`);
          } catch (leaveError) {
            console.error(`❌ Erreur lors du départ de ${dialog.title}:`, leaveError.message);
            errorCount++;
          }
        }
        
        // Attendre un peu pour éviter le spam
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (dialogError) {
        console.error(`❌ Erreur lors du traitement du dialogue:`, dialogError.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Nettoyage terminé !`);
    console.log(`📊 Résumé:`);
    console.log(`   - Canaux/groupes quittés: ${leftCount}`);
    console.log(`   - Erreurs rencontrées: ${errorCount}`);
    console.log(`   - Total traité: ${dialogs.length}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  } finally {
    await client.disconnect();
    console.log('🔌 Déconnexion terminée');
  }
}

// Lancer le nettoyage
cleanAccount().catch(console.error);
