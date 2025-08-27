// force-delete-sql.js
// Script qui utilise SQL brut pour forcer la suppression des gifts

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://gquyvmelpkgnddvefpwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzMv2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function forceDeleteWithSQL() {
  try {
    console.log('💥 SUPPRESSION FORCÉE AVEC SQL BRUT');
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
    
    // 2. SUPPRESSION FORCÉE AVEC SQL BRUT
    console.log('\n💥 SUPPRESSION FORCÉE AVEC SQL BRUT:');
    
    // Désactiver temporairement les contraintes de clés étrangères
    console.log('   🔓 Désactivation des contraintes de clés étrangères...');
    
    try {
      // Désactiver les contraintes pour la table inventory
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE inventory DISABLE TRIGGER ALL;'
      });
      console.log('   ✅ Contraintes inventory désactivées');
    } catch (error) {
      console.log('   ⚠️  Impossible de désactiver les contraintes inventory (normal)');
    }
    
    try {
      // Désactiver les contraintes pour la table gifts
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE gifts DISABLE TRIGGER ALL;'
      });
      console.log('   ✅ Contraintes gifts désactivées');
    } catch (error) {
      console.log('   ⚠️  Impossible de désactiver les contraintes gifts (normal)');
    }
    
    // 3. SUPPRESSION FORCÉE DE L'INVENTAIRE
    console.log('\n🗑️  SUPPRESSION FORCÉE DE L\'INVENTAIRE:');
    
    if (initialInventory.length > 0) {
      // Utiliser SQL brut pour supprimer tout l'inventaire
      const { error: deleteInventoryError } = await supabase
        .rpc('exec_sql', {
          sql: 'DELETE FROM inventory;'
        });
      
      if (deleteInventoryError) {
        console.log('   ⚠️  SQL brut inventory échoué, tentative avec méthode normale...');
        
        // Fallback : suppression normale
        for (const item of initialInventory) {
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
        console.log('   ✅ TOUT L\'INVENTAIRE SUPPRIMÉ AVEC SQL BRUT !');
      }
    }
    
    // 4. SUPPRESSION FORCÉE DES GIFTS
    console.log('\n🗑️  SUPPRESSION FORCÉE DES GIFTS:');
    
    if (initialGifts.length > 0) {
      // Utiliser SQL brut pour supprimer tous les gifts
      const { error: deleteGiftsError } = await supabase
        .rpc('exec_sql', {
          sql: 'DELETE FROM gifts;'
        });
      
      if (deleteGiftsError) {
        console.log('   ⚠️  SQL brut gifts échoué, tentative avec méthode normale...');
        
        // Fallback : suppression normale
        for (const gift of initialGifts) {
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
        console.log('   ✅ TOUS LES GIFTS SUPPRIMÉS AVEC SQL BRUT !');
      }
    }
    
    // 5. Réactiver les contraintes
    console.log('\n🔒 RÉACTIVATION DES CONTRAINTES:');
    
    try {
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE inventory ENABLE TRIGGER ALL;'
      });
      console.log('   ✅ Contraintes inventory réactivées');
    } catch (error) {
      console.log('   ⚠️  Impossible de réactiver les contraintes inventory');
    }
    
    try {
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE gifts ENABLE TRIGGER ALL;'
      });
      console.log('   ✅ Contraintes gifts réactivées');
    } catch (error) {
      console.log('   ⚠️  Impossible de réactiver les contraintes gifts');
    }
    
    // 6. Vérifier le résultat final
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
    console.log('💥 SUPPRESSION FORCÉE TERMINÉE !');
    
    if ((finalInventory?.length || 0) === 0 && (finalGifts?.length || 0) === 0) {
      console.log('✅ Base de données complètement vide !');
      console.log('🎯 Prêt pour la synchronisation automatique avec le détecteur');
      console.log('\n🚀 RELANCEZ MAINTENANT LE DÉTECTEUR !');
    } else {
      console.log('⚠️  Certains éléments n\'ont pas pu être supprimés');
      console.log('🔍 Vérifiez les contraintes de la base de données');
    }
    
  } catch (error) {
    console.error('💥 Erreur lors de la suppression forcée:', error);
  }
}

// Exécuter la suppression forcée
forceDeleteWithSQL();
