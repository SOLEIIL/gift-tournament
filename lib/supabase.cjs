const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://gquyvmelpkgnddvefpwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzMv2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Gestionnaire d'inventaire Supabase
class SupabaseInventoryManager {
  
  // Créer ou récupérer un utilisateur
  static async getOrCreateUser(telegramData) {
    try {
      const { telegram_id, telegram_username, telegram_first_name, telegram_last_name } = telegramData;
      
      console.log(`🔄 Synchronisation utilisateur: @${telegram_username} (${telegram_id})`);
      
      // Vérifier si l'utilisateur existe déjà
      let { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegram_id)
        .single();
      
      if (existingUser) {
        console.log(`✅ Utilisateur existant trouvé: ${existingUser.id}`);
        
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
          console.log(`🔄 Username mis à jour: ${telegram_username}`);
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
          telegram_last_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      console.log(`✅ Nouvel utilisateur créé: ${newUser.id}`);
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
        collectibleId, 
        giftName, 
        collectibleModel, 
        collectibleBackdrop, 
        collectibleSymbol, 
        giftValue 
      } = giftData;
      
      console.log(`🔄 Synchronisation gift: ${giftName} (${collectibleId})`);
      
      // Vérifier si le gift existe déjà
      let { data: existingGift, error: selectError } = await supabase
        .from('gifts')
        .select('*')
        .eq('collectible_id', collectibleId)
        .single();
      
      if (existingGift) {
        console.log(`✅ Gift existant trouvé: ${existingGift.id}`);
        return existingGift;
      }
      
      // Créer un nouveau gift
      const { data: newGift, error: insertError } = await supabase
        .from('gifts')
        .insert([{
          gift_id: collectibleId, // Utiliser collectibleId comme gift_id
          collectible_id: collectibleId,
          gift_name: giftName,
          collectible_model: collectibleModel,
          collectible_backdrop: collectibleBackdrop,
          collectible_symbol: collectibleSymbol,
          gift_value: giftValue,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      console.log(`✅ Nouveau gift créé: ${newGift.id}`);
      return newGift;
      
    } catch (error) {
      console.error('❌ Erreur lors de la gestion du gift:', error);
      throw error;
    }
  }
  
  // Ajouter un gift à l'inventaire d'un utilisateur
  static async addToInventory(userId, giftId, telegramMessageId, giftData) {
    try {
      console.log(`🔄 Ajout à l'inventaire: User ${userId}, Gift ${giftId}`);
      
      // Vérifier si le gift n'est pas déjà dans l'inventaire actif
      const { data: existingItem, error: checkError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('gift_id', giftId)
        .eq('status', 'active')
        .single();
      
      if (existingItem) {
        console.log('⚠️ Gift déjà dans l\'inventaire actif de l\'utilisateur');
        return existingItem;
      }
      
      // Ajouter à l'inventaire
      const { data: inventoryItem, error: insertError } = await supabase
        .from('inventory')
        .insert([{
          user_id: userId,
          gift_id: giftId,
          status: 'active',
          received_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Enregistrer la transaction
      await this.recordTransaction(userId, giftId, 'deposit', telegramMessageId, giftData);
      
      console.log(`✅ Gift ajouté à l'inventaire: ${inventoryItem.id}`);
      return inventoryItem;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout à l\'inventaire:', error);
      throw error;
    }
  }
  
  // Retirer un gift de l'inventaire d'un utilisateur
  static async removeFromInventory(userId, giftId, telegramMessageId, giftData) {
    try {
      console.log(`🔄 Retrait de l'inventaire: User ${userId}, Gift ${giftId}`);
      
      // Vérifier si le gift est dans l'inventaire actif
      const { data: existingItem, error: checkError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('gift_id', giftId)
        .eq('status', 'active')
        .single();
      
      if (!existingItem) {
        console.log('⚠️ Gift non trouvé dans l\'inventaire actif');
        return null;
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
      await this.recordTransaction(userId, giftId, 'withdraw', telegramMessageId, giftData);
      
      console.log(`✅ Gift retiré de l'inventaire: ${updatedItem.id}`);
      return updatedItem;
      
    } catch (error) {
      console.error('❌ Erreur lors du retrait de l\'inventaire:', error);
      throw error;
    }
  }
  
  // Enregistrer une transaction
  static async recordTransaction(userId, giftId, transactionType, telegramMessageId, giftData) {
    try {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          gift_id: giftId,
          transaction_type: transactionType,
          created_at: new Date().toISOString()
        }]);
      
      if (insertError) throw insertError;
      
      console.log(`✅ Transaction enregistrée: ${transactionType} pour User ${userId}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de la transaction:', error);
      throw error;
    }
  }
  
  // Obtenir l'inventaire d'un utilisateur
  static async getUserInventory(telegramId) {
    try {
      console.log(`🔄 Récupération inventaire pour: ${telegramId}`);
      
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
      
      console.log(`✅ Inventaire récupéré: ${inventory.length} gifts actifs`);
      
      // Transformer les données pour correspondre au format attendu par le bot
      const transformedInventory = inventory.map(item => ({
        id: item.id,
        gift_id: item.gifts?.collectible_id || item.gift_id,
        gift_name: item.gifts?.gift_name || 'Gift inconnu',
        gift_value: item.gifts?.gift_value || 25,
        collectible_model: item.gifts?.collectible_model || 'Modèle inconnu',
        collectible_backdrop: item.gifts?.collectible_backdrop || 'Arrière-plan inconnu',
        collectible_symbol: item.gifts?.collectible_symbol || 'Symbole inconnu',
        status: item.status,
        received_at: item.received_at,
        withdrawn_at: item.withdrawn_at
      }));
      
      return transformedInventory;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'inventaire:', error);
      throw error;
    }
  }
  
  // Compter tous les gifts actifs dans la base
  static async getTotalActiveGifts() {
    try {
      const { data: inventory, error: inventoryError } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('status', 'active');
      
      if (inventoryError) throw inventoryError;
      
      return inventory.length;
      
    } catch (error) {
      console.error('❌ Erreur lors du comptage des gifts actifs:', error);
      return 0; // Retourner 0 en cas d'erreur
    }
  }
  
  // Synchroniser l'inventaire virtuel avec Supabase
  static async syncVirtualInventory(virtualInventory) {
    try {
      console.log('🔄 Début de la synchronisation avec Supabase...');
      
      const allInventories = virtualInventory.getAllInventories();
      let syncCount = 0;
      
      for (const [telegramId, userInventory] of allInventories) {
        try {
          console.log(`🔄 Synchronisation utilisateur: ${telegramId}`);
          
          // Créer ou récupérer l'utilisateur
          const user = await this.getOrCreateUser({
            telegram_id: telegramId,
            telegram_username: userInventory.username || 'unknown',
            telegram_first_name: userInventory.username || 'Unknown',
            telegram_last_name: ''
          });
          
          // Synchroniser chaque gift
          for (const gift of userInventory.gifts) {
            try {
              // Créer ou récupérer le gift
              const giftRecord = await this.getOrCreateGift({
                collectibleId: gift.collectibleId,
                giftName: gift.giftName,
                collectibleModel: gift.collectibleModel,
                collectibleBackdrop: gift.collectibleBackdrop,
                collectibleSymbol: gift.collectibleSymbol,
                giftValue: gift.giftValue
              });
              
              // Ajouter à l'inventaire
              await this.addToInventory(user.id, giftRecord.id, gift.telegramMessageId || 'unknown', gift);
              syncCount++;
              
            } catch (giftError) {
              console.error(`❌ Erreur lors de la synchronisation du gift ${gift.collectibleId}:`, giftError.message);
            }
          }
          
        } catch (userError) {
          console.error(`❌ Erreur lors de la synchronisation de l'utilisateur ${telegramId}:`, userError.message);
        }
      }
      
      console.log(`✅ Synchronisation terminée: ${syncCount} gifts synchronisés`);
      return syncCount;
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation globale:', error);
      throw error;
    }
  }
}

module.exports = { SupabaseInventoryManager, supabase };
