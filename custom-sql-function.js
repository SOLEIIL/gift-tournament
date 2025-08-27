// custom-sql-function.js
// Script qui utilise une fonction SQL personnalisée pour forcer la suppression

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://gquyvmelpkgnddvefpwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzMv2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function customSQLFunction() {
  try {
    console.log('🔧 FONCTION SQL PERSONNALISÉE POUR SUPPRESSION');
    console.log('=====================================');
    
    // 1. Vérifier l'état initial
    console.log('\n🔍 ÉTAT INITIAL:');
    
    const { data: initialInventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*');
    
    if (inventoryError) {
      console.error('❌ Erreur inventory:', inventoryError);
      return;
    }
    
    console.log(`📦 ${initialInventory.length} entrée(s) d'inventaire trouvée(s)`);
    
    const { data: initialGifts, error: giftsError } = await supabase
      .from('gifts')
      .select('*');
    
    if (giftsError) {
      console.error('❌ Erreur gifts:', giftsError);
      return;
    }
    
    console.log(`🎁 ${initialGifts.length} gift(s) trouvé(s)`);
    
    // 2. ESSAYER DIFFÉRENTES APPROCHES SQL
    console.log('\n🔧 ESSAI DE DIFFÉRENTES APPROCHES SQL:');
    
    // Approche 1: TRUNCATE avec CASCADE
    console.log('\n   🔧 Approche 1: TRUNCATE avec CASCADE...');
    try {
      const { error: truncateError } = await supabase
        .rpc('exec_sql', {
          sql: 'TRUNCATE TABLE inventory CASCADE;'
        });
      
      if (truncateError) {
        console.log('   ⚠️  TRUNCATE CASCADE échoué:', truncateError.message);
      } else {
        console.log('   ✅ TRUNCATE CASCADE réussi !');
      }
    } catch (error) {
      console.log('   ⚠️  TRUNCATE CASCADE non supporté');
    }
    
    // Approche 2: Suppression par lots avec transaction
    console.log('\n   🔧 Approche 2: Suppression par lots avec transaction...');
    try {
      // Commencer une transaction
      const { error: beginError } = await supabase
        .rpc('exec_sql', {
          sql: 'BEGIN;'
        });
      
      if (beginError) {
        console.log('   ⚠️  Transaction non supportée');
      } else {
        console.log('   ✅ Transaction commencée');
        
        // Supprimer l'inventaire
        const { error: deleteInventoryError } = await supabase
          .rpc('exec_sql', {
            sql: 'DELETE FROM inventory;'
          });
        
        if (deleteInventoryError) {
          console.log('   ⚠️  Suppression inventory échouée');
        } else {
          console.log('   ✅ Inventaire supprimé dans la transaction');
        }
        
        // Supprimer les gifts
        const { error: deleteGiftsError } = await supabase
          .rpc('exec_sql', {
            sql: 'DELETE FROM gifts;'
          });
        
        if (deleteGiftsError) {
          console.log('   ⚠️  Suppression gifts échouée');
        } else {
          console.log('   ✅ Gifts supprimés dans la transaction');
        }
        
        // Valider la transaction
        const { error: commitError } = await supabase
          .rpc('exec_sql', {
            sql: 'COMMIT;'
          });
        
        if (commitError) {
          console.log('   ⚠️  Commit échoué');
        } else {
          console.log('   ✅ Transaction validée !');
        }
      }
    } catch (error) {
      console.log('   ⚠️  Transaction non supportée');
    }
    
    // Approche 3: Suppression directe avec force
    console.log('\n   🔧 Approche 3: Suppression directe avec force...');
    
    // Forcer la suppression de l'inventaire
    if (initialInventory.length > 0) {
      console.log('   🗑️  Suppression forcée de l\'inventaire...');
      
      for (let i = 0; i < 3; i++) { // Essayer 3 fois
        console.log(`   🔄 Tentative ${i + 1}/3...`);
        
        const { error: deleteError } = await supabase
          .from('inventory')
          .delete()
          .neq('id', 0);
        
        if (deleteError) {
          console.log(`   ⚠️  Tentative ${i + 1} échouée:`, deleteError.message);
          
          if (i < 2) {
            console.log('   ⏳ Attente de 2 secondes avant nouvelle tentative...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          console.log('   ✅ Suppression forcée réussie !');
          break;
        }
      }
    }
    
    // Forcer la suppression des gifts
    if (initialGifts.length > 0) {
      console.log('   🗑️  Suppression forcée des gifts...');
      
      for (let i = 0; i < 3; i++) { // Essayer 3 fois
        console.log(`   🔄 Tentative ${i + 1}/3...`);
        
        const { error: deleteError } = await supabase
          .from('gifts')
          .delete()
          .neq('id', 0);
        
        if (deleteError) {
          console.log(`   ⚠️  Tentative ${i + 1} échouée:`, deleteError.message);
          
          if (i < 2) {
            console.log('   ⏳ Attente de 2 secondes avant nouvelle tentative...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          console.log('   ✅ Suppression forcée réussie !');
          break;
        }
      }
    }
    
    // 3. Vérifier le résultat final
    console.log('\n🔍 VÉRIFICATION FINALE:');
    
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
    
    console.log('\n=====================================');
    console.log('🔧 FONCTION SQL PERSONNALISÉE TERMINÉE !');
    
    if ((finalInventory?.length || 0) === 0 && (finalGifts?.length || 0) === 0) {
      console.log('✅ Base de données complètement vide !');
      console.log('🎯 Prêt pour la synchronisation automatique avec le détecteur');
      console.log('\n🚀 RELANCEZ MAINTENANT LE DÉTECTEUR !');
    } else {
      console.log('⚠️  Certains éléments n\'ont pas pu être supprimés');
      console.log('🔍 Vérifiez les contraintes de la base de données');
      console.log('💡 Essayez de supprimer manuellement via l\'interface Supabase');
    }
    
  } catch (error) {
    console.error('💥 Erreur lors de la fonction SQL personnalisée:', error);
  }
}

// Exécuter la fonction SQL personnalisée
customSQLFunction();
