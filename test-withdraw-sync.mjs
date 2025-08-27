#!/usr/bin/env node

// Test de la synchronisation des retraits avec Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gquyvmelpkgnddvefpwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzMv2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Données de test pour un retrait
const testWithdrawData = {
  id: 'withdraw_test_123',
  fromDepositAccount: '@WxyzCrypto',
  toUserId: '986778065', // Votre ID Telegram
  toUsername: 'drole',
  giftId: 'test_gift_123',
  giftName: 'Test Gift Withdraw',
  giftValue: 25,
  giftType: 'star_gift_unique',
  mediaType: 'star_gift_unique',
  collectibleId: 'test-collectible-123',
  collectibleModel: 'Test Model',
  collectibleBackdrop: 'Test Backdrop',
  collectibleSymbol: '🎁',
  timestamp: new Date().toISOString(),
  status: 'withdrawn',
  telegramMessageId: '123456',
  messageText: 'Test withdraw message',
  isWithdraw: true
};

async function testWithdrawSync() {
  try {
    console.log('🧪 Test de synchronisation des retraits avec Supabase');
    console.log('==================================================');
    
    // 1. Vérifier la connexion Supabase
    console.log('🔗 Test de connexion Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      throw new Error(`Erreur de connexion Supabase: ${testError.message}`);
    }
    console.log('✅ Connexion Supabase réussie');
    
    // 2. Vérifier si l'utilisateur de test existe
    console.log('👤 Vérification de l\'utilisateur de test...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('telegram_id, username')
      .eq('telegram_id', testWithdrawData.toUserId)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', userError);
      return;
    }
    
    if (!user) {
      console.log('👤 Création de l\'utilisateur de test...');
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          telegram_id: testWithdrawData.toUserId,
          username: testWithdrawData.toUsername
        })
        .select('telegram_id, username')
        .single();
      
      if (createError) {
        throw new Error(`Erreur lors de la création de l'utilisateur: ${createError.message}`);
      }
      
      console.log('✅ Utilisateur créé:', newUser.username);
    } else {
      console.log('✅ Utilisateur existant trouvé:', user.username);
    }
    
    // 3. Créer l'entrée dans la table gifts
    console.log('🎁 Création de l\'entrée gift...');
    const { error: giftError } = await supabase
      .from('gifts')
      .insert({
        collectible_id: testWithdrawData.collectibleId,
        telegram_id: testWithdrawData.toUserId,
        username: testWithdrawData.toUsername
      });
    
    if (giftError) {
      if (giftError.code === '23505') { // Violation de contrainte unique
        console.log('ℹ️ Gift déjà existant, continuation...');
      } else {
        throw new Error(`Erreur lors de la création du gift: ${giftError.message}`);
      }
    } else {
      console.log('✅ Gift créé avec succès');
    }
    
    // 4. Ajouter à l'inventaire
    console.log('📦 Ajout à l\'inventaire...');
    const { error: inventoryError } = await supabase
      .from('inventory')
      .insert({
        telegram_id: testWithdrawData.toUserId,
        collectible_id: testWithdrawData.collectibleId,
        username: testWithdrawData.toUsername
      });
    
    if (inventoryError) {
      if (inventoryError.code === '23505') { // Violation de contrainte unique
        console.log('ℹ️ Gift déjà dans l\'inventaire, continuation...');
      } else {
        throw new Error(`Erreur lors de l'ajout à l'inventaire: ${inventoryError.message}`);
      }
    } else {
      console.log('✅ Gift ajouté à l\'inventaire');
    }
    
    // 5. Vérifier que tout est bien synchronisé
    console.log('🔍 Vérification de la synchronisation...');
    const { data: inventory, error: checkError } = await supabase
      .from('inventory')
      .select(`
        *,
        gifts (
          collectible_id,
          telegram_id,
          username
        )
      `)
      .eq('telegram_id', testWithdrawData.toUserId)
      .eq('collectible_id', testWithdrawData.collectibleId);
    
    if (checkError) {
      throw new Error(`Erreur lors de la vérification: ${checkError.message}`);
    }
    
    if (inventory && inventory.length > 0) {
      console.log('✅ Synchronisation réussie !');
      console.log('📊 Données synchronisées:');
      console.log('   👤 Utilisateur:', inventory[0].username);
      console.log('   🎁 Collectible ID:', inventory[0].collectible_id);
      console.log('   🆔 Telegram ID:', inventory[0].telegram_id);
    } else {
      console.log('❌ Synchronisation échouée - données non trouvées');
    }
    
    console.log('==================================================');
    console.log('🎯 Test terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer le test
testWithdrawSync();
