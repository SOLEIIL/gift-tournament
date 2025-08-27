// debug-database.cjs
// Script pour examiner la structure de la base de données Supabase

const { SupabaseInventoryManager, supabase } = require('./lib/supabase.cjs');

async function debugDatabase() {
  try {
    console.log('🔍 DEBUG DE LA BASE DE DONNÉES SUPABASE');
    console.log('========================================');
    
    // 1. Examiner la structure de la table users
    console.log('\n👥 1. Structure de la table users:');
    const { data: usersSample, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    if (usersError) {
      console.log('❌ Erreur users:', usersError.message);
    } else {
      console.log('✅ Users sample:', JSON.stringify(usersSample, null, 2));
    }
    
    // 2. Examiner la structure de la table gifts
    console.log('\n🎁 2. Structure de la table gifts:');
    const { data: giftsSample, error: giftsError } = await supabase
      .from('gifts')
      .select('*')
      .limit(3);
    
    if (giftsError) {
      console.log('❌ Erreur gifts:', giftsError.message);
    } else {
      console.log('✅ Gifts sample:', JSON.stringify(giftsSample, null, 2));
    }
    
    // 3. Examiner la structure de la table inventory
    console.log('\n📦 3. Structure de la table inventory:');
    const { data: inventorySample, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .limit(3);
    
    if (inventoryError) {
      console.log('❌ Erreur inventory:', inventoryError.message);
    } else {
      console.log('✅ Inventory sample:', JSON.stringify(inventorySample, null, 2));
    }
    
    // 4. Examiner la structure de la table transactions
    console.log('\n📊 4. Structure de la table transactions:');
    const { data: transactionsSample, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(3);
    
    if (transactionsError) {
      console.log('❌ Erreur transactions:', transactionsError.message);
    } else {
      console.log('✅ Transactions sample:', JSON.stringify(transactionsSample, null, 2));
    }
    
    // 5. Test de la requête d'inventaire avec JOIN
    console.log('\n🔗 5. Test de la requête d\'inventaire avec JOIN:');
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', '986778065')
        .single();
      
      if (userError || !user) {
        console.log('❌ Utilisateur non trouvé');
      } else {
        console.log('✅ Utilisateur trouvé:', user.id);
        
        // Test de la requête JOIN
        const { data: inventoryJoin, error: joinError } = await supabase
          .from('inventory')
          .select(`
            *,
            gifts (
              gift_name,
              collectible_id,
              collectible_model,
              collectible_backdrop,
              collectible_symbol,
              gift_value
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        if (joinError) {
          console.log('❌ Erreur JOIN:', joinError.message);
        } else {
          console.log('✅ Résultat JOIN:', JSON.stringify(inventoryJoin, null, 2));
        }
      }
    } catch (error) {
      console.log('❌ Erreur lors du test JOIN:', error.message);
    }
    
    console.log('\n🎯 DEBUG TERMINÉ');
    console.log('==================');
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
  }
}

// Exécuter le debug
debugDatabase();
