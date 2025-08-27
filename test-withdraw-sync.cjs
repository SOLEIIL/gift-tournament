// test-withdraw-sync.cjs
// Script de test pour vérifier la synchronisation des retraits en temps réel

const { SupabaseInventoryManager, supabase } = require('./lib/supabase.cjs');

async function testWithdrawSync() {
  try {
    console.log('🧪 TEST DE SYNCHRONISATION DES RETRAITS');
    console.log('=======================================');
    
    // 1. Vérifier l'inventaire actuel de l'utilisateur de test
    console.log('\n1️⃣ Vérification de l\'inventaire actuel...');
    const currentInventory = await SupabaseInventoryManager.getUserInventory('123456789');
    console.log(`📦 Inventaire actuel: ${currentInventory.length} gifts actifs`);
    
    if (currentInventory.length === 0) {
      console.log('❌ Aucun gift actif trouvé pour le test');
      return;
    }
    
    // 2. Sélectionner un gift à retirer
    const giftToWithdraw = currentInventory[0];
    console.log(`🎁 Gift sélectionné pour le retrait: ${giftToWithdraw.gifts.gift_name}`);
    console.log(`   ID: ${giftToWithdraw.id}, Gift ID: ${giftToWithdraw.gift_id}`);
    
    // 3. Simuler le retrait du gift
    console.log('\n2️⃣ Simulation du retrait du gift...');
    const withdrawResult = await SupabaseInventoryManager.removeFromInventory(
      giftToWithdraw.user_id,
      giftToWithdraw.gift_id,
      'test_withdraw_message',
      {
        giftName: giftToWithdraw.gifts.gift_name,
        collectibleId: giftToWithdraw.gifts.collectible_id,
        giftValue: giftToWithdraw.gifts.gift_value
      }
    );
    
    if (withdrawResult) {
      console.log('✅ Gift retiré avec succès !');
      console.log(`   Nouveau statut: ${withdrawResult.status}`);
      console.log(`   Date de retrait: ${withdrawResult.withdrawn_at}`);
    } else {
      console.log('⚠️ Gift non trouvé dans l\'inventaire actif');
    }
    
    // 4. Vérifier l'inventaire après le retrait
    console.log('\n3️⃣ Vérification de l\'inventaire après retrait...');
    const updatedInventory = await SupabaseInventoryManager.getUserInventory('123456789');
    console.log(`📦 Inventaire après retrait: ${updatedInventory.length} gifts actifs`);
    
    // 5. Vérifier les transactions
    console.log('\n4️⃣ Vérification des transactions...');
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', giftToWithdraw.user_id)
      .eq('gift_id', giftToWithdraw.gift_id)
      .eq('transaction_type', 'withdraw')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (transactions && transactions.length > 0) {
      console.log('✅ Transaction de retrait enregistrée !');
      console.log(`   Type: ${transactions[0].transaction_type}`);
      console.log(`   Date: ${transactions[0].created_at}`);
    } else {
      console.log('❌ Transaction de retrait non trouvée');
    }
    
    // 6. Vérifier l'état de l'inventaire dans la table inventory
    console.log('\n5️⃣ Vérification de l\'état dans la table inventory...');
    const { data: inventoryItem, error: invError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', giftToWithdraw.id)
      .single();
    
    if (inventoryItem) {
      console.log('✅ État de l\'inventaire mis à jour !');
      console.log(`   Statut: ${inventoryItem.status}`);
      console.log(`   Date de retrait: ${inventoryItem.withdrawn_at}`);
    } else {
      console.log('❌ Élément d\'inventaire non trouvé');
    }
    
    console.log('\n🎉 TEST DE SYNCHRONISATION TERMINÉ !');
    console.log('=====================================');
    
    // 7. Résumé final
    console.log('\n📊 RÉSUMÉ FINAL:');
    console.log(`   • Gifts actifs avant: ${currentInventory.length}`);
    console.log(`   • Gifts actifs après: ${updatedInventory.length}`);
    console.log(`   • Gift retiré: ${giftToWithdraw.gifts.gift_name}`);
    console.log(`   • Synchronisation: ${updatedInventory.length < currentInventory.length ? '✅ RÉUSSIE' : '❌ ÉCHEC'}`);
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
}

// Exécuter le test
testWithdrawSync();
