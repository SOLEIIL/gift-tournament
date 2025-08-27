// test-production-api.mjs
// Test de l'API sécurisée Telegram en production

import crypto from 'crypto';

// Configuration de test
const BOT_TOKEN = '7516841125:AAH_jkU6wLOEoApkwu8afeXbZr58bBqiIrU';
const TEST_USER_ID = '986778065';
const TEST_USERNAME = 'drole';
const PRODUCTION_URL = 'https://giftscasinobackup2025-08-2702-08.vercel.app';

// Fonction pour générer un InitData de test
function generateTestInitData() {
  // Créer les paramètres de base
  const params = new URLSearchParams();
  params.append('user', JSON.stringify({
    id: parseInt(TEST_USER_ID),
    first_name: 'Test',
    username: TEST_USERNAME,
    is_premium: false
  }));
  params.append('auth_date', Math.floor(Date.now() / 1000).toString());
  params.append('query_id', 'test_query_id');
  
  // Trier les paramètres par ordre alphabétique
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // Créer le secret pour la vérification
  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  
  // Calculer le hash
  const hash = crypto.createHmac('sha256', secret).update(sortedParams).digest('hex');
  
  // Ajouter le hash aux paramètres
  params.append('hash', hash);
  
  return params.toString();
}

// Fonction pour tester l'API de production
async function testProductionAPI() {
  try {
    console.log('🧪 Test de l\'API sécurisée Telegram en PRODUCTION...');
    console.log(`🌐 URL: ${PRODUCTION_URL}`);
    
    // Générer l'InitData de test
    const initData = generateTestInitData();
    console.log('✅ InitData généré:', initData.substring(0, 100) + '...');
    
    // Appel à l'API de production
    const response = await fetch(`${PRODUCTION_URL}/api/telegram-inventory-secure`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
    });
    
    console.log(`📡 Réponse du serveur: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API sécurisée de production fonctionne !');
      console.log('📊 Données reçues:', {
        success: data.success,
        user: data.user,
        inventoryCount: data.count,
        security: data.security
      });
    } else {
      const errorData = await response.json();
      console.log('❌ Erreur API de production:', response.status, errorData);
      
      // Analyse des erreurs courantes
      if (response.status === 404) {
        console.log('💡 Conseil: Vérifiez que l\'API est bien déployée sur Vercel');
      } else if (response.status === 500) {
        console.log('💡 Conseil: Erreur serveur - vérifiez les logs Vercel');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de production:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Conseil: Vérifiez que l\'URL Vercel est correcte');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Conseil: Le serveur de production n\'est pas accessible');
    }
  }
}

// Fonction pour tester la page principale
async function testMainPage() {
  try {
    console.log('\n🌐 Test de la page principale...');
    
    const response = await fetch(PRODUCTION_URL);
    console.log(`📄 Page principale: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Page principale accessible !');
    } else {
      console.log('❌ Problème avec la page principale');
    }
    
  } catch (error) {
    console.error('❌ Erreur page principale:', error.message);
  }
}

// Fonction pour tester la page d'inventaire sécurisé
async function testSecureInventoryPage() {
  try {
    console.log('\n🔐 Test de la page d\'inventaire sécurisé...');
    
    const response = await fetch(`${PRODUCTION_URL}/secure-inventory`);
    console.log(`📄 Page inventaire: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Page d\'inventaire sécurisé accessible !');
    } else {
      console.log('❌ Problème avec la page d\'inventaire');
    }
    
  } catch (error) {
    console.error('❌ Erreur page inventaire:', error.message);
  }
}

// Fonction principale
async function runProductionTests() {
  console.log('🚀 Démarrage des tests de PRODUCTION...\n');
  
  // Test de la page principale
  await testMainPage();
  
  // Test de la page d'inventaire
  await testSecureInventoryPage();
  
  // Test de l'API sécurisée
  await testProductionAPI();
  
  console.log('\n✨ Tests de production terminés !');
  console.log('\n📱 Pour tester la Mini App:');
  console.log('1. Ouvrir Telegram');
  console.log('2. Contacter @testnftbuybot');
  console.log('3. Envoyer /start');
  console.log('4. Cliquer sur "Start App"');
  console.log(`5. L\'app s\'ouvrira sur: ${PRODUCTION_URL}/secure-inventory`);
}

// Exécuter les tests
runProductionTests();
