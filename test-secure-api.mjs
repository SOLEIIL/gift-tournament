// test-secure-api.mjs
// Test de l'API sécurisée Telegram (ES Modules)

import crypto from 'crypto';

// Configuration de test
const BOT_TOKEN = '7516841125:AAH_jkU6wLOEoApkwu8afeXbZr58bBqiIrU';
const TEST_USER_ID = '986778065';
const TEST_USERNAME = 'drole';

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

// Fonction pour tester l'API
async function testSecureAPI() {
  try {
    console.log('🧪 Test de l\'API sécurisée Telegram...');
    
    // Générer l'InitData de test
    const initData = generateTestInitData();
    console.log('✅ InitData généré:', initData.substring(0, 100) + '...');
    
    // Appel à l'API locale (si disponible)
    const response = await fetch('http://localhost:3000/api/telegram-inventory-secure', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API sécurisée fonctionne !');
      console.log('📊 Données reçues:', {
        success: data.success,
        user: data.user,
        inventoryCount: data.count,
        security: data.security
      });
    } else {
      const errorData = await response.json();
      console.log('❌ Erreur API:', response.status, errorData);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Conseil: Assurez-vous que le serveur local est démarré (npm run dev)');
    }
  }
}

// Fonction pour tester la vérification du hash
function testHashVerification() {
  console.log('\n🔐 Test de vérification du hash...');
  
  const initData = generateTestInitData();
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  
  // Supprimer le hash pour la vérification
  params.delete('hash');
  
  // Trier les paramètres
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // Créer le secret
  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  
  // Calculer le hash attendu
  const expectedHash = crypto.createHmac('sha256', secret).update(sortedParams).digest('hex');
  
  // Comparer
  if (hash === expectedHash) {
    console.log('✅ Vérification du hash réussie !');
    console.log('📝 Hash reçu:', hash);
    console.log('🔍 Hash attendu:', expectedHash);
  } else {
    console.log('❌ Vérification du hash échouée !');
    console.log('📝 Hash reçu:', hash);
    console.log('🔍 Hash attendu:', expectedHash);
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Démarrage des tests de l\'API sécurisée...\n');
  
  // Test de la vérification du hash
  testHashVerification();
  
  // Test de l'API
  await testSecureAPI();
  
  console.log('\n✨ Tests terminés !');
}

// Exécuter les tests
runTests();
