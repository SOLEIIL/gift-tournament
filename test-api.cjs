// test-api.cjs
// Test de l'API pour vérifier qu'elle fonctionne

const { SupabaseInventoryManager } = require('./lib/supabase.cjs');

async function testAPI() {
  try {
    console.log('🧪 TEST DE L\'API SUPABASE');
    console.log('==========================');
    
    // Test 1: Connexion Supabase
    console.log('\n🔗 Test 1: Connexion Supabase...');
    try {
      const inventory = await SupabaseInventoryManager.getUserInventory('986778065');
      console.log('✅ API Supabase fonctionne !');
      console.log(`📦 Inventaire récupéré: ${inventory.length} gifts`);
      
      if (inventory.length > 0) {
        console.log('\n🎁 Gifts disponibles:');
        inventory.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.gift_name} (${item.gift_id})`);
        });
      }
      
    } catch (error) {
      console.log('❌ Erreur API Supabase:', error.message);
      return;
    }
    
    // Test 2: Simulation d'une requête d'inventaire
    console.log('\n📱 Test 2: Simulation requête inventaire...');
    try {
      // Simuler ce que fait l'app mobile
      const userId = '986778065';
      const userInventory = await SupabaseInventoryManager.getUserInventory(userId);
      
      if (userInventory && userInventory.length > 0) {
        console.log('✅ Inventaire accessible pour l\'app mobile !');
        console.log(`📱 ${userInventory.length} gifts visibles pour l'utilisateur`);
        
        // Format pour l'app mobile
        const mobileFormat = userInventory.map(item => ({
          id: item.id,
          name: item.gift_name,
          collectibleId: item.gift_id,
          value: item.gift_value,
          model: item.collectible_model,
          backdrop: item.collectible_backdrop,
          symbol: item.collectible_symbol,
          status: item.status,
          receivedAt: item.received_at
        }));
        
        console.log('\n📱 Format pour l\'app mobile:');
        console.log(JSON.stringify(mobileFormat, null, 2));
        
      } else {
        console.log('⚠️ Aucun gift trouvé pour l\'utilisateur');
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la simulation:', error.message);
    }
    
    console.log('\n🎯 TEST TERMINÉ');
    console.log('================');
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
  }
}

// Exécuter le test
testAPI();

