// test-supabase-connection.cjs
// Test de connexion et récupération des gifts depuis Supabase

const { SupabaseInventoryManager } = require('./lib/supabase.cjs');

async function testSupabaseConnection() {
  try {
    console.log('🔍 TEST DE CONNEXION SUPABASE');
    console.log('================================');
    
    // Test 1: Récupérer l'inventaire de l'utilisateur drole
    console.log('\n📱 Test 1: Récupération de l\'inventaire de drole...');
    const userId = '986778065'; // ID de drole
    
    try {
      const inventory = await SupabaseInventoryManager.getUserInventory(userId);
      console.log('✅ Inventaire récupéré avec succès !');
      console.log(`📦 Nombre de gifts: ${inventory.length}`);
      
      if (inventory.length > 0) {
        console.log('\n🎁 Gifts dans l\'inventaire:');
        inventory.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.gift_name} (${item.gift_id})`);
          console.log(`      Status: ${item.status}`);
          console.log(`      Ajouté le: ${item.created_at}`);
        });
      } else {
        console.log('❌ Aucun gift trouvé dans l\'inventaire');
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la récupération de l\'inventaire:', error.message);
    }
    
    // Test 2: Récupérer tous les utilisateurs
    console.log('\n👥 Test 2: Récupération de tous les utilisateurs...');
    try {
      const users = await SupabaseInventoryManager.getAllUsers();
      console.log('✅ Utilisateurs récupérés avec succès !');
      console.log(`👥 Nombre d'utilisateurs: ${users.length}`);
      
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} (${user.telegram_id})`);
      });
      
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des utilisateurs:', error.message);
    }
    
    // Test 3: Récupérer tous les gifts
    console.log('\n🎁 Test 3: Récupération de tous les gifts...');
    try {
      const gifts = await SupabaseInventoryManager.getAllGifts();
      console.log('✅ Gifts récupérés avec succès !');
      console.log(`🎁 Nombre de gifts: ${gifts.length}`);
      
      gifts.forEach((gift, index) => {
        console.log(`   ${index + 1}. ${gift.gift_name} (${gift.gift_id})`);
        console.log(`      Type: ${gift.gift_type}`);
        console.log(`      Valeur: ${gift.gift_value}`);
      });
      
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des gifts:', error.message);
    }
    
    // Test 4: Vérifier les transactions
    console.log('\n📊 Test 4: Vérification des transactions...');
    try {
      const transactions = await SupabaseInventoryManager.getAllTransactions();
      console.log('✅ Transactions récupérées avec succès !');
      console.log(`📊 Nombre de transactions: ${transactions.length}`);
      
      if (transactions.length > 0) {
        console.log('\n📝 Dernières transactions:');
        transactions.slice(-5).forEach((tx, index) => {
          console.log(`   ${index + 1}. ${tx.transaction_type} - ${tx.gift_name}`);
          console.log(`      Utilisateur: ${tx.user_id}`);
          console.log(`      Date: ${tx.created_at}`);
        });
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des transactions:', error.message);
    }
    
    console.log('\n🎯 DIAGNOSTIC TERMINÉ');
    console.log('========================');
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
  }
}

// Exécuter le test
testSupabaseConnection();
