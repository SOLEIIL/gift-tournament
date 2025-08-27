// test-api-local.js
// Test local de l'API d'inventaire avec authentification Telegram

import crypto from 'crypto';

// Simuler les données Telegram (comme dans une vraie Mini App)
const botToken = '7516841125:AAH_jkU6wLOEoApkwu8afeXbZr58bBqiIrU';

// Créer des données d'initialisation factices pour le test
function createTestInitData() {
  const userData = {
    id: 986778065,
    first_name: 'drole',
    username: 'drole',
    is_premium: false
  };
  
  const params = new URLSearchParams();
  params.set('user', JSON.stringify(userData));
  params.set('auth_date', Math.floor(Date.now() / 1000).toString());
  params.set('query_id', 'test_query_123');
  
  // Créer la signature selon la documentation officielle
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  
  // Trier les paramètres par ordre alphabétique
  const sortedParams = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = sortedParams.map(([key, value]) => `${key}=${value}`).join('\n');
  
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  params.set('hash', hash);
  
  return params.toString();
}

// Test de l'API
async function testAPI() {
  console.log('🧪 Test de l\'API d\'inventaire Telegram');
  console.log('=====================================');
  
  const initData = createTestInitData();
  console.log('🔐 Données d\'initialisation créées:', initData);
  
  try {
    // Test avec le serveur local
    const response = await fetch('http://localhost:3001/api/inventory', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData
      }
    });
    
    console.log('📡 Réponse reçue:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Succès:', data);
    } else {
      const error = await response.json();
      console.log('❌ Erreur:', error);
    }
    
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    console.log('💡 Assurez-vous que le serveur local tourne sur localhost:3001');
    console.log('💡 Lancez: node server-local.js');
  }
  
  console.log('\n🔍 Validation de la signature:');
  console.log('=====================================');
  
  // Valider la signature localement
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const params = Array.from(urlParams.entries()).sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = params.map(([key, value]) => `${key}=${value}`).join('\n');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  console.log('🔐 Hash reçu:', hash);
  console.log('🔐 Hash calculé:', calculatedHash);
  console.log('✅ Signature valide:', hash === calculatedHash);
  console.log('📝 Chaîne de vérification:', dataCheckString);
}

// Lancer le test
testAPI().catch(console.error);
