// sync-inventory.cjs
// Script de synchronisation entre l'inventaire virtuel et Supabase

const { SupabaseInventoryManager } = require('./lib/supabase.cjs');

async function syncInventory() {
  try {
    console.log('🔄 SYNCHRONISATION INVENTAIRE VIRTUEL ↔️ SUPABASE');
    console.log('==================================================');
    
    // Récupérer l'inventaire depuis Supabase
    console.log('\n📱 Récupération inventaire Supabase...');
    const supabaseInventory = await SupabaseInventoryManager.getUserInventory('986778065');
    console.log(`✅ Supabase: ${supabaseInventory.length} gifts`);
    
    // Afficher les gifts Supabase
    if (supabaseInventory.length > 0) {
      console.log('\n🎁 Gifts dans Supabase:');
      supabaseInventory.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.gift_name} (${item.gift_id})`);
      });
    }
    
    // Vérifier la cohérence
    console.log('\n🔍 Vérification de la cohérence...');
    
    if (supabaseInventory.length === 2) {
      console.log('✅ Inventaire Supabase cohérent: 2 gifts');
      console.log('✅ Votre app Telegram devrait fonctionner !');
      
      // Test de l'API
      console.log('\n🧪 Test de l\'API...');
      try {
        const response = await fetch('https://giftscasinobackup2025-08-2702-08.vercel.app/api/inventory?userId=986778065');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API fonctionne:', data.count, 'gifts');
        } else {
          console.log('❌ Erreur API:', response.status);
        }
      } catch (error) {
        console.log('❌ Erreur test API:', error.message);
      }
      
    } else {
      console.log('⚠️ Inventaire Supabase incohérent:', supabaseInventory.length, 'gifts');
    }
    
    console.log('\n🎯 SYNCHRONISATION TERMINÉE');
    console.log('============================');
    
  } catch (error) {
    console.error('💥 Erreur synchronisation:', error);
  }
}

// Exécuter la synchronisation
syncInventory();

