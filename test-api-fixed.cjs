// test-api-fixed.cjs
// Test de l'API corrigée (CommonJS)
const fetch = require('node-fetch').default;

async function testApiFixed() {
  try {
    console.log('🧪 TEST API CORRIGÉE - CommonJS');
    console.log('==================================');
    
    const url = 'https://gift-tournament-git-main-soleiils-projects.vercel.app/api/inventory-webhook';
    
    console.log('📡 Test de:', url);
    console.log('📤 Méthode: POST (sans signature)');
    
    const response = await fetch(url, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': 'J7ycuRhEZVd72UKna9XRx64n2eQ2Cz27'
      },
      body: JSON.stringify({ test: 'api_fixed' })
    });
    
    console.log('📥 Réponse:');
    console.log('   Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📄 Contenu:', responseText);
    
    if (response.status === 401) {
      console.log('\n✅ SUCCÈS ! L\'API fonctionne maintenant !');
      console.log('🔐 Elle demande une signature (normal)');
      console.log('🚀 Plus d\'erreur 500 !');
      console.log('\n🎯 MAINTENANT TESTONS LE WEBHOOK COMPLET !');
    } else if (response.status === 500) {
      console.log('\n❌ L\'API plante encore - problème persistant');
    } else {
      console.log('\n📊 Statut inattendu:', response.status);
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
}

testApiFixed();
