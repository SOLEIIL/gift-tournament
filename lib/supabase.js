import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonctions utilitaires pour la base de données
class InventoryManager {
  
  // Créer ou récupérer un utilisateur
  static async getOrCreateUser(telegramData) {
    try {
      const { telegram_id, telegram_username, telegram_first_name, telegram_last_name } = telegramData;
      
      // Vérifier si l'utilisateur existe déjà
      let { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegram_id)
        .single();
      
      if (existingUser) {
        // Mettre à jour les informations si nécessaire
        if (existingUser.telegram_username !== telegram_username) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              telegram_username, 
              telegram_first_name, 
              telegram_last_name,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.id);
          
          if (updateError) throw updateError;
        }
        return existingUser;
      }
      
      // Créer un nouvel utilisateur
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          telegram_id,
          telegram_username,
          telegram_first_name,
          telegram_last_name
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      return newUser;
      
    } catch (error) {
      console.error('❌ Erreur lors de la gestion de l\'utilisateur:', error);
      throw error;
    }
  }
  
  // Créer ou récupérer un gift
  static async getOrCreateGift(giftData) {
    try {
      const { 
        giftId, 
        giftName, 
        collectibleId, 
        collectibleModel, 
        collectibleBackdrop, 
        collectibleSymbol, 
        giftValue 
      } = giftData;
      
      // Vérifier si le gift existe déjà
      let { data: existingGift, error: selectError } = await supabase
        .from('gifts')
        .select('*')
        .eq('gift_id', giftId)
        .single();
      
      if (existingGift) {
        return existingGift;
      }
      
      // Créer un nouveau gift
      const { data: newGift, error: insertError } = await supabase
        .from('gifts')
        .insert([{
          gift_id: giftId,
          gift_name: giftName,
          collectible_id: collectibleId,
          collectible_model: collectibleModel,
          collectible_backdrop: collectibleBackdrop,
          collectible_symbol: collectibleSymbol,
          gift_value: giftValue
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      return newGift;
      
    } catch (error) {
      console.error('❌ Erreur lors de la gestion du gift:', error);
      throw error;
    }
  }
  
  // Ajouter un gift à l'inventaire d'un utilisateur
  static async addToInventory(userId, giftId, telegramMessageId) {
    try {
      // Vérifier si le gift n'est pas déjà dans l'inventaire
      const { data: existingItem, error: checkError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('gift_id', giftId)
        .single();
      
      if (existingItem) {
        console.log('⚠️ Gift déjà dans l\'inventaire de l\'utilisateur');
        return existingItem;
      }
      
      // Ajouter à l'inventaire
      const { data: inventoryItem, error: insertError } = await supabase
        .from('inventory')
        .insert([{
          user_id: userId,
          gift_id: giftId,
          status: 'active'
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Enregistrer la transaction
      await this.recordTransaction(userId, giftId, 'deposit', telegramMessageId);
      
      return inventoryItem;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout à l\'inventaire:', error);
      throw error;
    }
  }
  
  // Retirer un gift de l'inventaire d'un utilisateur
  static async removeFromInventory(userId, giftId, telegramMessageId) {
    try {
      // Vérifier si le gift est dans l'inventaire
      const { data: existingItem, error: checkError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('gift_id', giftId)
        .eq('status', 'active')
        .single();
      
      if (!existingItem) {
        throw new Error('Gift non trouvé dans l\'inventaire actif');
      }
      
      // Marquer comme retiré
      const { data: updatedItem, error: updateError } = await supabase
        .from('inventory')
        .update({
          status: 'withdrawn',
          withdrawn_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Enregistrer la transaction
      await this.recordTransaction(userId, giftId, 'withdraw', telegramMessageId);
      
      return updatedItem;
      
    } catch (error) {
      console.error('❌ Erreur lors du retrait de l\'inventaire:', error);
      throw error;
    }
  }
  
  // Enregistrer une transaction
  static async recordTransaction(userId, giftId, transactionType, telegramMessageId) {
    try {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          gift_id: giftId,
          transaction_type: transactionType,
          telegram_message_id: telegramMessageId
        }]);
      
      if (insertError) throw insertError;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de la transaction:', error);
      throw error;
    }
  }
  
  // Obtenir l'inventaire d'un utilisateur
  static async getUserInventory(telegramId) {
    try {
      // Récupérer l'utilisateur
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', telegramId)
        .single();
      
      if (userError || !user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Récupérer l'inventaire avec les détails des gifts
      const { data: inventory, error: inventoryError } = await supabase
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
        .eq('status', 'active')
        .order('received_at', { ascending: false });
      
      if (inventoryError) throw inventoryError;
      
      return inventory;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'inventaire:', error);
      throw error;
    }
  }
}

export { InventoryManager, supabase };
