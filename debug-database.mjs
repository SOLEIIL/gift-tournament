// debug-database.mjs
// Débogage détaillé de la base de données et de l'API

import crypto from 'crypto';

const BOT_TOKEN = '7516841125:AAH_jkU6wLOEoApkwu8afeXbZr58bBqiIrU';
const TEST_USER_ID = '986778065';
const TEST_USERNAME = 'drole';
const PRODUCTION_URL = 'https://giftscasinobackup2025-08-2702-08.vercel.app';

// Fonction pour générer un InitData de test
function generateTestInitData() {
  const params = new URLSearchParams();
  params.append('user', JSON.stringify({
    id: parseInt(TEST_USER_ID),
    first_name: 'Test',
    username: TEST_USERNAME,
    is_premium: false
  }));
  params.append('auth_date', Math.floor(Date.now() / 1000).toString());
  params.append('query_id', 'test_query_id');
  
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hash = crypto.createHmac('sha256', secret).update(sortedParams).digest('hex');
  params.append('hash', hash);
  
  return params.toString();
}

// Test détaillé de l'API avec analyse des données
async function debugAPI() {
  try {
    console.log('🔍 DÉBOGAGE DÉTAILLÉ DE L\'API...\n');
    
    const initData = generateTestInitData();
    
    const response = await fetch(`${PRODUCTION_URL}/api/telegram-inventory-secure`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
    });
    
    console.log(`📡 Statut: ${response.status} ${response.statusText}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('\n📊 DONNÉES COMPLÈTES DE L\'API:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n🔍 ANALYSE DES DONNÉES:');
      console.log(`✅ Succès: ${data.success}`);
      console.log(`👤 Utilisateur: ${data.user?.username} (ID: ${data.user?.telegram_id})`);
      console.log(`📦 Nombre de gifts: ${data.count}`);
      console.log(`🔐 Sécurité: ${data.security?.authenticated ? 'OK' : 'NOK'}`);
      
      if (data.inventory && data.inventory.length > 0) {
        console.log('\n🎁 DÉTAIL DES GIFTS:');
        data.inventory.forEach((item, index) => {
          console.log(`\n--- Gift ${index + 1} ---`);
          console.log(`ID: ${item.id}`);
          console.log(`Collectible ID: ${item.collectible_id}`);
          console.log(`Username: ${item.username}`);
          console.log(`Display Name: ${item.display_name}`);
          console.log(`Received At: ${item.received_at}`);
        });
      } else {
        console.log('\n⚠️ AUCUN GIFT DANS L\'INVENTAIRE');
      }
      
      // Vérifier la cohérence des données
      console.log('\n🔍 VÉRIFICATIONS DE COHÉRENCE:');
      console.log(`- Count vs Array length: ${data.count} vs ${data.inventory?.length || 0}`);
      console.log(`- User ID cohérent: ${data.user?.telegram_id === TEST_USER_ID ? '✅' : '❌'}`);
      console.log(`- Username cohérent: ${data.user?.username === TEST_USERNAME ? '✅' : '❌'}`);
      
    } else {
      const errorData = await response.text();
      console.log('❌ Erreur API:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du débogage:', error.message);
  }
}

// Test de la page d'inventaire pour voir ce qui s'affiche
async function debugInventoryPage() {
  try {
    console.log('\n🌐 DÉBOGAGE DE LA PAGE D\'INVENTAIRE...\n');
    
    const response = await fetch(`${PRODUCTION_URL}/secure-inventory`);
    console.log(`📄 Statut page: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const html = await response.text();
      
      // Chercher des informations dans le HTML
      console.log('\n🔍 ANALYSE DU HTML:');
      
      // Vérifier si la page contient des éléments d'inventaire
      if (html.includes('Inventaire vide')) {
        console.log('⚠️ La page affiche "Inventaire vide"');
      }
      
      if (html.includes('0 Total Gifts')) {
        console.log('⚠️ La page affiche "0 Total Gifts"');
      }
      
      if (html.includes('Jamais mis à jour')) {
        console.log('⚠️ La page affiche "Jamais mis à jour"');
      }
      
      // Chercher des erreurs JavaScript
      if (html.includes('error') || html.includes('Error')) {
        console.log('⚠️ Erreurs détectées dans le HTML');
      }
      
      console.log(`📏 Taille du HTML: ${html.length} caractères`);
      
    } else {
      console.log('❌ Page non accessible');
    }
    
  } catch (error) {
    console.error('❌ Erreur page inventaire:', error.message);
  }
}

// Test de l'API avec différents paramètres
async function debugAPIVariations() {
  try {
    console.log('\n🧪 TESTS AVEC DIFFÉRENTS PARAMÈTRES...\n');
    
    const initData = generateTestInitData();
    
    // Test 1: API normale
    console.log('📡 Test 1: API normale');
    const response1 = await fetch(`${PRODUCTION_URL}/api/telegram-inventory-secure`, {
      method: 'GET',
      headers: {
        'X-Telegram-Init-Data': initData,
      },
    });
    console.log(`Résultat: ${response1.status}`);
    
    // Test 2: Avec Content-Type
    console.log('📡 Test 2: Avec Content-Type');
    const response2 = await fetch(`${PRODUCTION_URL}/api/telegram-inventory-secure`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
    });
    console.log(`Résultat: ${response2.status}`);
    
    // Test 3: Sans headers
    console.log('📡 Test 3: Sans headers');
    const response3 = await fetch(`${PRODUCTION_URL}/api/telegram-inventory-secure`);
    console.log(`Résultat: ${response3.status}`);
    
  } catch (error) {
    console.error('❌ Erreur tests variations:', error.message);
  }
}

// Fonction principale
async function runDebug() {
  console.log('🚀 DÉMARRAGE DU DÉBOGAGE COMPLET...\n');
  
  await debugAPI();
  await debugInventoryPage();
  await debugAPIVariations();
  
  console.log('\n✨ Débogage terminé !');
  console.log('\n💡 ANALYSE:');
  console.log('- Si l\'API retourne des données mais la page affiche "vide"');
  console.log('- Le problème est probablement dans le frontend React');
  console.log('- Vérifiez les erreurs JavaScript dans la console du navigateur');
}

// Exécuter le débogage
runDebug();
