// generate-testnftbuybot-session.cjs
// Script pour générer une session pour @testnftbuybot

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const readline = require('readline');

async function generateTestnftbuybotSession() {
  console.log('🚀 GÉNÉRATION DE SESSION POUR @testnftbuybot');
  console.log('==============================================');
  console.log('📱 API ID: 26309990');
  console.log('🔑 API Hash: bda0f9feb8...');
  console.log('📞 Phone: +33651450710');
  console.log('==============================================\n');

  try {
    // Créer le client Telegram
    console.log('🔐 Création du client Telegram...');
    const client = new TelegramClient(
      new StringSession(''),
      26309990,
      'bda0f9feb8e160644bd05f2904425183',
      {
        connectionRetries: 3,
        useWSS: false
      }
    );

    console.log('📱 Connexion avec le numéro: +33651450710');
    console.log('📱 Utilisation de l\'app: Wxyz DepoGifts\n');

    // Interface de lecture
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (question) => {
      return new Promise((resolve) => {
        rl.question(question, (answer) => {
          resolve(answer);
        });
      });
    };

    // Démarrer le client avec authentification
    console.log('🔐 Démarrage de l\'authentification...');
    await client.start({
      phoneNumber: '+33651450710',
      phoneCode: async () => {
        const code = await askQuestion('📱 Entrez le code de vérification reçu par SMS : ');
        return code;
      },
      password: async () => {
        const password = await askQuestion('🔐 Entrez votre mot de passe 2FA (si activé) : ');
        return password || undefined;
      },
      onError: (err) => {
        console.error('❌ Erreur d\'authentification:', err.message);
      }
    });

    console.log('\n✅ Session générée avec succès !');
    console.log('==============================================');
    console.log('📋 NOUVELLE SESSION STRING:');
    console.log('==============================================');
    console.log(client.session.save());
    console.log('==============================================');
    console.log('\n💡 INSTRUCTIONS:');
    console.log('1. Copiez cette session string');
    console.log('2. Ouvrez votre fichier .env');
    console.log('3. Remplacez TELEGRAM_SESSION_STRING par cette nouvelle valeur');
    console.log('4. Sauvegardez le fichier .env');
    console.log('5. Redémarrez le détecteur de gifts');
    console.log('\n🎯 Votre bot @testnftbuybot pourra maintenant se connecter !');

    // Nettoyage
    await client.disconnect();
    await client.destroy();
    rl.close();

  } catch (error) {
    console.error('\n❌ Erreur lors de la génération de session:', error.message);
    if (error.code) {
      console.error('   Code d\'erreur:', error.code);
      
      if (error.code === 400) {
        if (error.errorMessage === 'API_ID_INVALID') {
          console.error('\n🔍 DIAGNOSTIC:');
          console.error('   ❌ API_ID_INVALID: Votre app n\'est plus reconnue');
          console.error('   💡 Solution: Vérifiez sur my.telegram.org que l\'app est active');
        }
      }
    }
  }
}

generateTestnftbuybotSession();
