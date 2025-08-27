// delete-with-transactions.js
// Script qui supprime d'abord les transactions avant les autres données

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://gquyvmelpkgnddvefpwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzMv2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deleteWithTransactions() {
  try {
    console.log('🗑️  SUPPRESSION AVEC GESTION DES TRANSACTIONS');
    console.log('=====================================');
    
    // 1. Vérifier l'état initial de TOUTES les tables
    console.log('\n🔍 ÉTAT INITIAL DE TOUTES LES TABLES:');
    
    // Vérifier les transactions
    const { data: initialTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*');
    
    if (transactionsError) {
      console.log('⚠️  Table transactions non trouvée ou inaccessible');
    } else {
      console.log(`💰 ${initialTransactions?.length || 0} transaction(s) trouvée(s)`);
    }
    
    // Vérifier l'inventaire
    const { data: initialInventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*');
    
    if (inventoryError) {
      console.error('❌ Erreur inventory:', inventoryError);
      return;
    }
    
    console.log(`📦 ${initialInventory.length} entrée(s) d'inventaire trouvée(s)`);
    
    // Vérifier les gifts
    const { data: initialGifts, error: giftsError } = await supabase
      .from('gifts')
      .select('*');
    
    if (giftsError) {
      console.error('❌ Erreur gifts:', giftsError);
      return;
    }
    
    console.log(`🎁 ${initialGifts.length} gift(s) trouvé(s)`);
    
    // Vérifier les utilisateurs
    const { data: initialUsers, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Erreur users:', usersError);
      return;
    }
    
    console.log(`👥 ${initialUsers.length} utilisateur(s) trouvé(s)`);
    
    // 2. SUPPRESSION DANS L'ORDRE CORRECT (contraintes de clés étrangères)
    console.log('\n🗑️  SUPPRESSION DANS L\'ORDRE CORRECT:');
    
    // ÉTAPE 1: Supprimer les transactions (référencent users)
    if (initialTransactions && initialTransactions.length > 0) {
      console.log('\n   💰 ÉTAPE 1: Suppression des transactions...');
      
      for (const transaction of initialTransactions) {
        console.log(`   🗑️  Suppression de la transaction ID ${transaction.id}...`);
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', transaction.id);
        
        if (deleteError) {
          console.error(`   ❌ Erreur suppression transaction ${transaction.id}:`, deleteError);
        } else {
          console.log(`   ✅ Transaction ID ${transaction.id} supprimée !`);
        }
      }
    } else {
      console.log('   ✅ Aucune transaction à supprimer');
    }
    
    // ÉTAPE 2: Supprimer l'inventaire (référence users et gifts)
    if (initialInventory.length > 0) {
      console.log('\n   📦 ÉTAPE 2: Suppression de l\'inventaire...');
      
      for (const item of initialInventory) {
        console.log(`   🗑️  Suppression de l'entrée d'inventaire ID ${item.id}...`);
        const { error: deleteError } = await supabase
          .from('inventory')
          .delete()
          .eq('id', item.id);
        
        if (deleteError) {
          console.error(`   ❌ Erreur suppression inventory ${item.id}:`, deleteError);
        } else {
          console.log(`   ✅ Entrée d'inventaire ID ${item.id} supprimée !`);
        }
      }
    } else {
      console.log('   ✅ Aucune entrée d\'inventaire à supprimer');
    }
    
    // ÉTAPE 3: Supprimer les gifts (référencés par inventory)
    if (initialGifts.length > 0) {
      console.log('\n   🎁 ÉTAPE 3: Suppression des gifts...');
      
      for (const gift of initialGifts) {
        console.log(`   🗑️  Suppression du gift ID ${gift.id} (${gift.gift_name})...`);
        const { error: deleteError } = await supabase
          .from('gifts')
          .delete()
          .eq('id', gift.id);
        
        if (deleteError) {
          console.error(`   ❌ Erreur suppression gift ${gift.id}:`, deleteError);
        } else {
          console.log(`   ✅ Gift ID ${gift.id} supprimé !`);
        }
      }
    } else {
      console.log('   ✅ Aucun gift à supprimer');
    }
    
    // ÉTAPE 4: Supprimer les utilisateurs (maintenant que rien ne les référence)
    if (initialUsers.length > 0) {
      console.log('\n   👥 ÉTAPE 4: Suppression des utilisateurs...');
      
      for (const user of initialUsers) {
        console.log(`   🗑️  Suppression de l'utilisateur ID ${user.id} (@${user.telegram_username})...`);
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);
        
        if (deleteError) {
          console.error(`   ❌ Erreur suppression user ${user.id}:`, deleteError);
        } else {
          console.log(`   ✅ Utilisateur ID ${user.id} supprimé !`);
        }
      }
    } else {
      console.log('   ✅ Aucun utilisateur à supprimer');
    }
    
    // 3. Vérifier le résultat final
    console.log('\n🔍 VÉRIFICATION FINALE:');
    
    const { data: finalTransactions, error: finalTransactionsError } = await supabase
      .from('transactions')
      .select('*');
    
    if (finalTransactionsError) {
      console.log('💰 Transactions: Table non accessible');
    } else {
      console.log(`💰 ${finalTransactions?.length || 0} transaction(s) restante(s)`);
    }
    
    const { data: finalInventory, error: finalInventoryError } = await supabase
      .from('inventory')
      .select('*');
    
    if (finalInventoryError) {
      console.error('❌ Erreur vérification inventory:', finalInventoryError);
    } else {
      console.log(`📦 ${finalInventory.length} entrée(s) d'inventaire restante(s)`);
    }
    
    const { data: finalGifts, error: finalGiftsError } = await supabase
      .from('gifts')
      .select('*');
    
    if (finalGiftsError) {
      console.error('❌ Erreur vérification gifts:', finalGiftsError);
    } else {
      console.log(`🎁 ${finalGifts.length} gift(s) restant(s)`);
    }
    
    const { data: finalUsers, error: finalUsersError } = await supabase
      .from('users')
      .select('*');
    
    if (finalUsersError) {
      console.error('❌ Erreur vérification users:', finalUsersError);
    } else {
      console.log(`👥 ${finalUsers.length} utilisateur(s) restant(s)`);
    }
    
    console.log('\n=====================================');
    console.log('🗑️  SUPPRESSION AVEC TRANSACTIONS TERMINÉE !');
    
    const totalRemaining = (finalTransactions?.length || 0) + (finalInventory?.length || 0) + (finalGifts?.length || 0) + (finalUsers?.length || 0);
    
    if (totalRemaining === 0) {
      console.log('✅ Base de données complètement vide !');
      console.log('🎯 Prêt pour la synchronisation automatique avec le détecteur');
      console.log('\n🚀 RELANCEZ MAINTENANT LE DÉTECTEUR !');
    } else {
      console.log(`⚠️  ${totalRemaining} élément(s) n'ont pas pu être supprimés`);
      console.log('🔍 Vérifiez les contraintes de la base de données');
    }
    
  } catch (error) {
    console.error('💥 Erreur lors de la suppression avec transactions:', error);
  }
}

// Exécuter la suppression
deleteWithTransactions();
