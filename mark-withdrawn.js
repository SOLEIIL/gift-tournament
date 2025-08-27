// mark-withdrawn.js
// Script pour marquer tous les gifts actifs comme "withdrawn"

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://gquyvmelpkgnddvefpwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzMv2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function markAllWithdrawn() {
  try {
    console.log('🚫 MARQUAGE DE TOUS LES GIFTS ACTIFS COMME "WITHDRAWN"');
    console.log('=====================================');
    
    // 1. Identifier tous les gifts actifs
    console.log('\n🔍 IDENTIFICATION DE TOUS LES GIFTS ACTIFS:');
    const { data: allActive, error: searchError } = await supabase
      .from('inventory')
      .select(`
        *,
        users (telegram_username, telegram_id),
        gifts (gift_name, collectible_id)
      `)
      .eq('status', 'active');
    
    if (searchError) {
      console.error('❌ Erreur lors de la recherche:', searchError);
      return;
    }
    
    console.log(`🎁 ${allActive.length} gift(s) actif(s) trouvé(s):`);
    allActive.forEach((item, index) => {
      const user = item.users;
      const gift = item.gifts;
      console.log(`   ${index + 1}. ID: ${item.id}`);
      console.log(`      👤 Utilisateur: @${user?.telegram_username || 'Unknown'} (${user?.telegram_id || 'Unknown'})`);
      console.log(`      🎁 Gift: ${gift?.gift_name || 'Unknown'} (${gift?.collectible_id || 'Unknown'})`);
      console.log(`      📅 Reçu: ${item.received_at || 'Unknown'}`);
    });
    
    // 2. Marquer TOUS les gifts actifs comme "withdrawn"
    console.log('\n🚫 MARQUAGE DE TOUS LES GIFTS COMME "WITHDRAWN":');
    for (const item of allActive) {
      console.log(`   🚫 Marquage du gift ID ${item.id} (${item.gifts?.gift_name || 'Unknown'}) comme withdrawn...`);
      const { error: updateError } = await supabase
        .from('inventory')
        .update({
          status: 'withdrawn',
          withdrawn_at: new Date().toISOString()
        })
        .eq('id', item.id);
      
      if (updateError) {
        console.error(`❌ Erreur lors du marquage du gift ${item.id}:`, updateError);
      } else {
        console.log(`   ✅ Gift ID ${item.id} marqué comme withdrawn !`);
      }
    }
    
    console.log('✅ Tous les gifts actifs ont été marqués comme withdrawn !');
    
    // 3. Vérifier le résultat
    console.log('\n🔍 VÉRIFICATION POST-MARQUAGE:');
    const { data: remainingActive, error: checkError } = await supabase
      .from('inventory')
      .select(`
        *,
        users (telegram_username, telegram_id),
        gifts (gift_name, collectible_id)
      `)
      .eq('status', 'active');
    
    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError);
      return;
    }
    
    console.log(`✅ ${remainingActive.length} gift(s) actif(s) restant(s):`);
    if (remainingActive.length === 0) {
      console.log('   🎉 Aucun gift actif - Base nettoyée !');
    } else {
      remainingActive.forEach(item => {
        const user = item.users;
        const gift = item.gifts;
        console.log(`   - ID: ${item.id}`);
        console.log(`     👤 Utilisateur: @${user?.telegram_username || 'Unknown'} (${user?.telegram_id || 'Unknown'})`);
        console.log(`     🎁 Gift: ${gift?.gift_name || 'Unknown'} (${gift?.collectible_id || 'Unknown'})`);
        console.log(`     📅 Reçu: ${item.received_at || 'Unknown'}`);
      });
    }
    
    console.log('\n=====================================');
    console.log('🚫 MARQUAGE TERMINÉ AVEC SUCCÈS !');
    console.log('✅ Supabase devrait maintenant avoir 0 gift actif');
    console.log('🎯 L\'inventaire virtuel sera la source de vérité');
    
  } catch (error) {
    console.error('💥 Erreur lors du marquage:', error);
  }
}

// Exécuter le marquage
markAllWithdrawn();
