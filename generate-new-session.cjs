// generate-new-session.cjs
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const readline = require('readline');

async function generateNewSession() {
  try {
    console.log('🚀 Génération d\'une nouvelle session Telegram...');
    console.log('==================================================');
    
    // Lire les variables d'environnement
    require('dotenv').config();
    
    const apiId = parseInt(process.env.TELEGRAM_API_ID);
    const apiHash = process.env.TELEGRAM_API_HASH;
    const phone = process.env.DEPOSIT_ACCOUNT_PHONE;
    
    console.log('📋 Configuration:');
    console.log(`   API_ID: ${apiId}`);
    console.log(`   API_HASH: ${apiHash ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`   PHONE: ${phone}`);
    
    if (!apiId || !apiHash || !phone) {
      throw new Error('Configuration incomplète');
    }
    
    console.log('\n🔐 Création du client Telegram...');
    const client = new TelegramClient(
      new StringSession(''),
      apiId,
      apiHash,
      {
        connectionRetries: 3,
        useWSS: false
      }
    );
    
    console.log('📱 Connexion avec le numéro:', phone);
    
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
    
    // Démarrer le client
    await client.start({
      phoneNumber: phone,
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
    console.log('==================================================');
    console.log('📋 NOUVELLE SESSION STRING:');
    console.log(client.session.save());
    console.log('==================================================');
    console.log('\n💡 Copiez cette session string dans votre fichier .env');
    console.log('   Remplacez TELEGRAM_SESSION_STRING par cette nouvelle valeur');
    
    await client.disconnect();
    rl.close();
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération de session:', error.message);
    if (error.code) console.error('   Code d\'erreur:', error.code);
  }
}

generateNewSession();
