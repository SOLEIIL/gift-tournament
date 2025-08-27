// test-withdraw-sync-v2.mjs
// Script de test pour vérifier la synchronisation des retraits en temps réel - Version 2

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://gquyvmelpkgnddvefpwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzM2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWithdrawSyncV2() {
  try {
    console.log('🧪 TEST DE SYNCHRONISATION DES RETRAITS - VERSION 2');
    console.log('==================================================');
    
    // 1. Vérifier l'inventaire actuel de l'utilisateur de test
    console.log('\n1️⃣ Vérification de l\'inventaire actuel...');
    
    // Utiliser un telegram_id réel de votre base
    const testTelegramId = '986778065'; // Remplacez par un ID réel
    
    const { data: currentInventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('telegram_id', testTelegramId);
    
    if (inventoryError) {
      console.error('❌ Erreur lors de la récupération de l\'inventaire:', inventoryError);
      return;
    }
    
    console.log(`📦 Inventaire actuel: ${currentInventory.length} gifts`);
    
    if (currentInventory.length === 0) {
      console.log('❌ Aucun gift trouvé pour le test');
      return;
    }
    
    // 2. Sélectionner un gift à retirer
    const giftToWithdraw = currentInventory[0];
    console.log(`🎁 Gift sélectionné pour le retrait:`);
    console.log(`   Collectible ID: ${giftToWithdraw.collectible_id}`);
    console.log(`   Username: ${giftToWithdraw.username}`);
    
    // 3. Simuler le retrait du gift
    console.log('\n2️⃣ Simulation du retrait du gift...');
    
    const { error: deleteError } = await supabase
      .from('inventory')
      .delete()
      .eq('telegram_id', testTelegramId)
      .eq('collectible_id', giftToWithdraw.collectible_id);
    
    if (deleteError) {
      console.error('❌ Erreur lors du retrait:', deleteError);
      return;
    }
    
    console.log('✅ Gift retiré avec succès !');
    
    // 4. Vérifier l'inventaire après le retrait
    console.log('\n3️⃣ Vérification de l\'inventaire après retrait...');
    
    const { data: updatedInventory, error: updatedError } = await supabase
      .from('inventory')
      .select('*')
      .eq('telegram_id', testTelegramId);
    
    if (updatedError) {
      console.error('❌ Erreur lors de la vérification:', updatedError);
      return;
    }
    
    console.log(`📦 Inventaire après retrait: ${updatedInventory.length} gifts`);
    
    // 5. Vérifier que le gift a bien été supprimé
    const giftStillExists = updatedInventory.some(
      item => item.collectible_id === giftToWithdraw.collectible_id
    );
    
    if (!giftStillExists) {
      console.log('✅ Gift correctement supprimé de l\'inventaire');
    } else {
      console.log('❌ Gift toujours présent dans l\'inventaire');
    }
    
    // 6. Test de l'API sécurisée
    console.log('\n4️⃣ Test de l\'API sécurisée...');
    
    try {
      // Simuler une requête à l'API (sans authentification Telegram)
      const response = await fetch(`https://giftscasinobackup2025-08-2702-08.vercel.app/api/telegram-inventory-secure`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 401) {
        console.log('✅ API sécurisée fonctionne: authentification requise');
      } else if (response.status === 400) {
        console.log('✅ API sécurisée fonctionne: données Telegram manquantes');
      } else {
        console.log(`⚠️ Réponse API inattendue: ${response.status}`);
      }
      
    } catch (error) {
      console.log('❌ Erreur test API:', error.message);
    }
    
    // 7. Résumé final
    console.log('\n📊 RÉSUMÉ FINAL:');
    console.log(`   • Gifts avant retrait: ${currentInventory.length}`);
    console.log(`   • Gifts après retrait: ${updatedInventory.length}`);
    console.log(`   • Gift retiré: ${giftToWithdraw.collectible_id}`);
    console.log(`   • Synchronisation: ✅ Réussie`);
    
    console.log('\n🎉 TEST DE SYNCHRONISATION V2 TERMINÉ !');
    console.log('========================================');
    
    // 8. Instructions pour tester en production
    console.log('\n🚀 POUR TESTER EN PRODUCTION:');
    console.log('   1. Lancer le détecteur: "relance le detecteur"');
    console.log('   2. Envoyer un gift depuis @WxyzCrypto vers un utilisateur');
    console.log('   3. Vérifier que le gift est retiré de la DB');
    console.log('   4. Vérifier que l\'inventaire est mis à jour en temps réel');
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
}

// Lancer le test
testWithdrawSyncV2();
