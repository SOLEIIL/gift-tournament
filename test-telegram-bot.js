// Script de test pour vérifier la configuration du bot Telegram
import https from 'https';

const BOT_TOKEN = '7516841125:AAH_jkU6wLOEoApkwu8afeXbZr58bBqiIrU';

// Fonction pour faire une requête à l'API Telegram
function makeTelegramRequest(method, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/${method}`,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Test des fonctionnalités du bot
async function testBot() {
  console.log('🤖 Test de la configuration du bot Telegram...\n');
  
  try {
    // 1. Test getMe - Récupérer les informations du bot
    console.log('1. Test getMe - Informations du bot:');
    const botInfo = await makeTelegramRequest('getMe');
    if (botInfo.ok) {
      console.log('✅ Bot configuré avec succès!');
      console.log(`   Nom: ${botInfo.result.first_name}`);
      console.log(`   Username: @${botInfo.result.username}`);
      console.log(`   ID: ${botInfo.result.id}`);
      console.log(`   Peut rejoindre des groupes: ${botInfo.result.can_join_groups}`);
      console.log(`   Peut lire tous les messages: ${botInfo.result.can_read_all_group_messages}`);
    } else {
      console.log('❌ Erreur lors de la récupération des informations du bot');
      console.log(`   Erreur: ${botInfo.description}`);
      return;
    }
    
    console.log('\n2. Test des webhooks:');
    const webhookInfo = await makeTelegramRequest('getWebhookInfo');
    if (webhookInfo.ok) {
      console.log(`   URL webhook: ${webhookInfo.result.url || 'Aucune'}`);
      console.log(`   Nombre d'erreurs: ${webhookInfo.result.pending_update_count}`);
      if (webhookInfo.result.last_error_date) {
        const lastError = new Date(webhookInfo.result.last_error_date * 1000);
        console.log(`   Dernière erreur: ${lastError.toLocaleString()}`);
        console.log(`   Message d'erreur: ${webhookInfo.result.last_error_message}`);
      }
    }
    
    console.log('\n3. Test des méthodes personnalisées (simulation):');
    console.log('   Note: Ces endpoints doivent être implémentés côté serveur');
    console.log('   - getUserGifts: Récupérer l\'inventaire des gifts');
    console.log('   - sendGift: Transférer un gift');
    console.log('   - canTransferGift: Vérifier les règles de transfert');
    
    console.log('\n4. Configuration recommandée:');
    console.log('   - Créer un serveur web pour gérer les endpoints personnalisés');
    console.log('   - Configurer une base de données pour stocker les gifts');
    console.log('   - Implémenter la logique de transfert des gifts');
    console.log('   - Configurer les webhooks pour les mises à jour en temps réel');
    
    console.log('\n✅ Configuration de base terminée!');
    console.log('\n📋 Prochaines étapes:');
    console.log('   1. Implémenter le serveur backend avec les endpoints requis');
    console.log('   2. Configurer la base de données');
    console.log('   3. Tester l\'intégration avec l\'application frontend');
    console.log('   4. Déployer sur un serveur accessible publiquement');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('\n🔧 Vérifications à faire:');
    console.log('   - Vérifier que le token est correct');
    console.log('   - Vérifier la connexion internet');
    console.log('   - Vérifier que le bot n\'est pas désactivé');
  }
}

// Exécuter le test
testBot();
