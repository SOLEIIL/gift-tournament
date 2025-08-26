// generate-session.cjs
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');
const path = require('path');

// Lire le fichier .env manuellement
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

async function generateSession() {
  try {
    console.log('🚀 Génération de la session Telegram...');
    
    // Charger les variables d'environnement
    const env = loadEnv();
    
    console.log('📋 Variables chargées:');
    console.log('   API_ID:', env.TELEGRAM_API_ID);
    console.log('   API_HASH:', env.TELEGRAM_API_HASH ? env.TELEGRAM_API_HASH.substring(0, 10) + '...' : 'MANQUANT');
    console.log('   PHONE:', env.DEPOSIT_ACCOUNT_PHONE);
    
    if (!env.TELEGRAM_API_ID || !env.TELEGRAM_API_HASH) {
      throw new Error('TELEGRAM_API_ID ou TELEGRAM_API_HASH manquant dans le fichier .env');
    }
    
    if (!env.DEPOSIT_ACCOUNT_PHONE) {
      throw new Error('DEPOSIT_ACCOUNT_PHONE manquant dans le fichier .env');
    }
    
    const client = new TelegramClient(
      new StringSession(''),
      parseInt(env.TELEGRAM_API_ID),
      env.TELEGRAM_API_HASH,
      {
        connectionRetries: 5,
        useWSS: false
      }
    );

    console.log('🔐 Connexion à Telegram...');
    console.log('📱 Utilisation du numéro:', env.DEPOSIT_ACCOUNT_PHONE);
    
    // Démarrer le client avec le numéro de téléphone
    await client.start({
      phoneNumber: env.DEPOSIT_ACCOUNT_PHONE,
      phoneCode: async () => {
        // Demander le code de vérification à l'utilisateur
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        return new Promise((resolve) => {
          rl.question('📱 Entrez le code de vérification reçu par SMS : ', (code) => {
            rl.close();
            resolve(code);
          });
        });
      },
      password: async () => {
        // Demander le mot de passe 2FA
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        return new Promise((resolve) => {
          rl.question('🔐 Entrez votre mot de passe 2FA : ', (password) => {
            rl.close();
            resolve(password);
          });
        });
      },
      onError: (err) => {
        console.error('❌ Erreur d\'authentification:', err);
      }
    });
    
    console.log('✅ Session générée avec succès !');
    console.log('📋 Session String:', client.session.save());
    console.log('\n💡 Copiez cette session string dans votre fichier .env');
    console.log('   Ajoutez cette ligne : TELEGRAM_SESSION_STRING=VOTRE_SESSION_STRING');
    
    await client.disconnect();
  } catch (error) {
    console.error('❌ Erreur lors de la génération de session:', error);
    console.log('\n🔧 Vérifiez que vous avez bien :');
    console.log('   - TELEGRAM_API_ID dans votre .env');
    console.log('   - TELEGRAM_API_HASH dans votre .env');
    console.log('   - DEPOSIT_ACCOUNT_PHONE dans votre .env');
  }
}

generateSession();
