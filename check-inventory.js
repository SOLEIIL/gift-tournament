// check-inventory.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Présent' : '❌ Manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkInventory() {
  try {
    console.log('🔍 Vérification de l\'inventaire Supabase...');
    console.log('==================================================');
    
    // Vérifier les utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
    } else {
      console.log(`✅ Utilisateurs trouvés: ${users.length}`);
      users.forEach(user => {
        console.log(`   - @${user.telegram_username} (ID: ${user.id}, Telegram: ${user.telegram_id})`);
      });
    }
    
    console.log('--------------------------------------------------');
    
    // Vérifier les gifts
    const { data: gifts, error: giftsError } = await supabase
      .from('gifts')
      .select('*');
    
    if (giftsError) {
      console.error('❌ Erreur lors de la récupération des gifts:', giftsError);
    } else {
      console.log(`✅ Gifts trouvés: ${gifts.length}`);
      gifts.forEach(gift => {
        console.log(`   - ${gift.gift_name} (ID: ${gift.id}, Collectible: ${gift.collectible_id})`);
      });
    }
    
    console.log('--------------------------------------------------');
    
    // Vérifier l'inventaire
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        *,
        users!inner(telegram_username),
        gifts!inner(gift_name)
      `);
    
    if (inventoryError) {
      console.error('❌ Erreur lors de la récupération de l\'inventaire:', inventoryError);
    } else {
      console.log(`✅ Items d'inventaire trouvés: ${inventory.length}`);
      inventory.forEach(item => {
        console.log(`   - @${item.users.telegram_username} possède: ${item.gifts.gift_name} (ID: ${item.id})`);
      });
    }
    
    console.log('--------------------------------------------------');
    
    // Vérifier les transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*');
    
    if (transactionsError) {
      console.error('❌ Erreur lors de la récupération des transactions:', transactionsError);
    } else {
      console.log(`✅ Transactions trouvées: ${transactions.length}`);
      transactions.forEach(tx => {
        console.log(`   - ${tx.transaction_type}: ${tx.gift_id} (Message: ${tx.telegram_message_id})`);
      });
    }
    
    console.log('==================================================');
    
    if (users.length === 0) {
      console.log('⚠️  Aucun utilisateur trouvé - le webhook n\'a pas encore fonctionné');
    }
    
    if (inventory.length === 0) {
      console.log('⚠️  Aucun item d\'inventaire trouvé - les gifts ne sont pas encore ajoutés');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

checkInventory();
