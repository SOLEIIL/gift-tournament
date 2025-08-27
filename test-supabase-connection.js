// test-supabase-connection.js
// Script de test pour vérifier la connexion à Supabase

const { SupabaseInventoryManager, supabase } = require('./lib/supabase.cjs');

async function testSupabaseConnection() {
  try {
    console.log('🧪 TEST DE CONNEXION SUPABASE');
    console.log('================================');
    
    // Test 1: Connexion de base
    console.log('1️⃣ Test de connexion de base...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      return;
    }
    
    console.log('✅ Connexion Supabase réussie !');
    
    // Test 2: Vérifier les tables
    console.log('\n2️⃣ Vérification des tables...');
    
    // Test table users
    try {
      const { data: users, error: usersError } = await supabase.from('users').select('*').limit(1);
      if (usersError) throw usersError;
      console.log('✅ Table "users" accessible');
    } catch (error) {
      console.log('❌ Table "users" non accessible:', error.message);
    }
    
    // Test table gifts
    try {
      const { data: gifts, error: giftsError } = await supabase.from('gifts').select('*').limit(1);
      if (giftsError) throw giftsError;
      console.log('✅ Table "gifts" accessible');
    } catch (error) {
      console.log('❌ Table "gifts" non accessible:', error.message);
    }
    
    // Test table inventory
    try {
      const { data: inventory, error: inventoryError } = await supabase.from('inventory').select('*').limit(1);
      if (inventoryError) throw inventoryError;
      console.log('✅ Table "inventory" accessible');
    } catch (error) {
      console.log('❌ Table "inventory" non accessible:', error.message);
    }
    
    // Test table transactions
    try {
      const { data: transactions, error: transactionsError } = await supabase.from('transactions').select('*').limit(1);
      if (transactionsError) throw transactionsError;
      console.log('✅ Table "transactions" accessible');
    } catch (error) {
      console.log('❌ Table "transactions" non accessible:', error.message);
    }
    
    // Test 3: Test de création d'utilisateur
    console.log('\n3️⃣ Test de création d\'utilisateur...');
    try {
      const testUser = await SupabaseInventoryManager.getOrCreateUser({
        telegram_id: '123456789',
        telegram_username: 'testuser',
        telegram_first_name: 'Test',
        telegram_last_name: 'User'
      });
      console.log('✅ Utilisateur de test créé/récupéré:', testUser.id);
      
      // Test de création de gift
      console.log('\n4️⃣ Test de création de gift...');
      const testGift = await SupabaseInventoryManager.getOrCreateGift({
        collectibleId: 'TestGift-001',
        giftName: 'Test Gift',
        collectibleModel: 'Test Model (5‰)',
        collectibleBackdrop: 'Test Backdrop (10‰)',
        collectibleSymbol: 'Test Symbol (15‰)',
        giftValue: 25
      });
      console.log('✅ Gift de test créé/récupéré:', testGift.id);
      
      // Test d'ajout à l'inventaire
      console.log('\n5️⃣ Test d\'ajout à l\'inventaire...');
      const inventoryItem = await SupabaseInventoryManager.addToInventory(
        testUser.id,
        testGift.id,
        'test_message_123',
        {
          giftName: 'Test Gift',
          collectibleId: 'TestGift-001',
          giftValue: 25
        }
      );
      console.log('✅ Gift ajouté à l\'inventaire:', inventoryItem.id);
      
      // Test de récupération d'inventaire
      console.log('\n6️⃣ Test de récupération d\'inventaire...');
      const userInventory = await SupabaseInventoryManager.getUserInventory('123456789');
      console.log('✅ Inventaire récupéré:', userInventory.length, 'gifts');
      
      console.log('\n🎉 TOUS LES TESTS SUPABASE SONT RÉUSSIS !');
      console.log('==========================================');
      
    } catch (error) {
      console.log('❌ Erreur lors des tests:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
  }
}

// Exécuter le test
testSupabaseConnection();
