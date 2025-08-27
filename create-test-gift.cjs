// create-test-gift.cjs
// Script pour créer un gift de test dans l'inventaire

const { SupabaseInventoryManager, supabase } = require('./lib/supabase.cjs');

async function createTestGift() {
  try {
    console.log('🎁 CRÉATION D\'UN GIFT DE TEST');
    console.log('================================');
    
    // 1. Créer ou récupérer l'utilisateur de test
    console.log('\n1️⃣ Création de l\'utilisateur de test...');
    const user = await SupabaseInventoryManager.getOrCreateUser({
      telegram_id: '123456789',
      telegram_username: 'testuser',
      telegram_first_name: 'Test',
      telegram_last_name: 'User'
    });
    console.log(`✅ Utilisateur: ${user.id} (@${user.telegram_username})`);
    
    // 2. Créer un nouveau gift de test
    console.log('\n2️⃣ Création du gift de test...');
    const gift = await SupabaseInventoryManager.getOrCreateGift({
      collectibleId: 'LiveTestGift-' + Date.now(),
      giftName: 'Gift de Test Live',
      collectibleModel: 'Test Model (5‰)',
      collectibleBackdrop: 'Test Backdrop (10‰)',
      collectibleSymbol: 'Test Symbol (15‰)',
      giftValue: 50
    });
    console.log(`✅ Gift créé: ${gift.id} (${gift.gift_name})`);
    
    // 3. Ajouter le gift à l'inventaire
    console.log('\n3️⃣ Ajout à l\'inventaire...');
    const inventoryItem = await SupabaseInventoryManager.addToInventory(
      user.id,
      gift.id,
      'test_live_message_' + Date.now(),
      {
        giftName: gift.gift_name,
        collectibleId: gift.collectible_id,
        giftValue: gift.gift_value
      }
    );
    console.log(`✅ Gift ajouté à l'inventaire: ${inventoryItem.id}`);
    
    // 4. Vérifier l'inventaire final
    console.log('\n4️⃣ Vérification de l\'inventaire...');
    const finalInventory = await SupabaseInventoryManager.getUserInventory('123456789');
    console.log(`📦 Inventaire final: ${finalInventory.length} gifts actifs`);
    
    console.log('\n🎉 GIFT DE TEST CRÉÉ AVEC SUCCÈS !');
    console.log('=====================================');
    console.log('💡 Maintenant vous pouvez:');
    console.log('   1. Lancer le moniteur: node monitor-inventory-live.cjs');
    console.log('   2. Retirer le gift: node test-withdraw-sync.cjs');
    console.log('   3. Voir la synchronisation en temps réel !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  }
}

// Exécuter la création
createTestGift();
