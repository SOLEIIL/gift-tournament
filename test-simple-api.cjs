// test-simple-api.cjs
// Test de l'API simple une fois déployée
const fetch = require('node-fetch').default;

async function testSimpleApi() {
  try {
    console.log('🧪 TEST API SIMPLE');
    console.log('===================');
    
    const url = 'https://gift-tournament-git-main-soleiils-projects.vercel.app/api/test-simple';
    
    console.log('📡 Test de:', url);
    console.log('📤 Méthode: GET (pas de body)');
    
    const response = await fetch(url, { 
      method: 'GET',
      headers: {
        'x-vercel-protection-bypass': 'J7ycuRhEZVd72UKna9XRx64n2eQ2Cz27'
      }
    });
    
    console.log('📥 Réponse:');
    console.log('   Status:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCÈS ! API simple fonctionne !');
      console.log('📊 Réponse:', result);
      console.log('\n🔍 DIAGNOSTIC : Le problème vient du code complexe de inventory-webhook.js');
      console.log('🔧 Il faut corriger les dépendances ou la logique');
    } else {
      const errorText = await response.text();
      console.log('❌ ERREUR ! API simple plante aussi');
      console.log('📄 Détails:', errorText);
      console.log('\n🔍 DIAGNOSTIC : Problème de configuration Vercel');
      console.log('🔧 Vérifiez les logs Vercel et la configuration');
    }
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
  }
}

console.log('🚀 Test de l\'API simple (une fois déployée)...\n');
testSimpleApi();
