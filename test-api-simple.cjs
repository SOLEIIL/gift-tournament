// test-api-simple.cjs
// Test simple de l'API sans signature pour identifier le problème
const fetch = require('node-fetch').default;

async function testApiSimple() {
  try {
    console.log('🧪 TEST SIMPLE DE L\'API');
    console.log('==========================');
    
    const url = 'https://gift-tournament-git-main-soleiils-projects.vercel.app/api/inventory-webhook';
    
    console.log('📡 Test de:', url);
    console.log('📤 Méthode: POST (sans signature)');
    
    const response = await fetch(url, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': 'J7ycuRhEZVd72UKna9XRx64n2eQ2Cz27'
      },
      body: JSON.stringify({ test: 'simple' })
    });
    
    console.log('📥 Réponse:');
    console.log('   Status:', response.status, response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Contenu:', responseText);
    
    if (response.status === 401) {
      console.log('✅ API accessible mais signature requise (normal)');
    } else if (response.status === 500) {
      console.log('❌ Erreur interne de l\'API - problème dans le code');
    } else {
      console.log('📊 Statut inattendu');
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
}

testApiSimple();
