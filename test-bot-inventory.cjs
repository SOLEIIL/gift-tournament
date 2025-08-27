// test-bot-inventory.cjs
// Test de l'inventaire vu par le bot

const { SupabaseInventoryManager } = require('./lib/supabase.cjs');

async function testBotInventory() {
  try {
    console.log('🧪 TEST DE L\'INVENTAIRE DU BOT');
    console.log('==================================');
    
    const userId = '986778065';
    
    // Test 1: Inventaire Supabase
    console.log('\n📱 Test 1: Inventaire Supabase...');
    try {
      const supabaseInventory = await SupabaseInventoryManager.getUserInventory(userId);
      console.log(`✅ Supabase: ${supabaseInventory.length} gifts`);
      
      if (supabaseInventory.length > 0) {
        console.log('\n🎁 Gifts dans Supabase:');
        supabaseInventory.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.gift_name} (${item.gift_id})`);
        });
      }
    } catch (error) {
      console.log('❌ Erreur Supabase:', error.message);
    }
    
    // Test 2: Simulation de la commande /inventory
    console.log('\n🤖 Test 2: Simulation commande /inventory...');
    try {
      // Simuler ce que fait le bot
      const userInventory = await SupabaseInventoryManager.getUserInventory(userId);
      
      if (userInventory && userInventory.length > 0) {
        console.log('✅ Bot devrait voir:', userInventory.length, 'gifts');
        
        // Format pour le bot
        const botFormat = userInventory.map(item => ({
          id: item.id,
          gift_name: item.gift_name,
          gift_id: item.gift_id,
          gift_value: item.gift_value,
          collectible_model: item.collectible_model,
          collectible_backdrop: item.collectible_backdrop,
          collectible_symbol: item.collectible_symbol,
          status: item.status,
          received_at: item.received_at
        }));
        
        console.log('\n📱 Format pour le bot:');
        console.log(JSON.stringify(botFormat, null, 2));
        
      } else {
        console.log('⚠️ Bot voit un inventaire vide');
      }
      
    } catch (error) {
      console.log('❌ Erreur simulation bot:', error.message);
    }
    
    console.log('\n🎯 TEST TERMINÉ');
    console.log('================');
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
  }
}

// Exécuter le test
testBotInventory();
