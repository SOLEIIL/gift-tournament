const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://gquyvmelpkgnddvefpwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzMv2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Gestionnaire d'inventaire Supabase - ADAPTÉ À VOTRE STRUCTURE ACTUELLE
class SupabaseInventoryManager {
  
  // Créer ou récupérer un utilisateur
  static async getOrCreateUser(telegramData) {
    try {
      const { telegram_id, telegram_username } = telegramData;
      
      console.log(`🔄 Synchronisation utilisateur: @${telegram_username} (${telegram_id})`);
      
      // Vérifier si l'utilisateur existe déjà
      let { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegram_id)
        .single();
      
      if (existingUser) {
        console.log(`✅ Utilisateur existant trouvé: ${existingUser.telegram_id}`);
        
        // Mettre à jour les informations si nécessaire
        if (existingUser.username !== telegram_username) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              username: telegram_username
            })
            .eq('telegram_id', telegram_id);
          
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
          username: telegram_username
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      console.log(`✅ Nouvel utilisateur créé: ${newUser.telegram_id}`);
      return newUser;
      
    } catch (error) {
      console.error('❌ Erreur lors de la gestion de l\'utilisateur:', error);
      throw error;
    }
  }
  
  // Créer ou récupérer un gift (utilise directement la table gifts comme inventaire)
  static async getOrCreateGift(giftData) {
    try {
      const { 
        collectibleId, 
        giftName,
        userId,
        username
      } = giftData;
      
      console.log(`🔄 Synchronisation gift: ${giftName} (${collectibleId})`);
      
      // Vérifier si le gift existe déjà pour cet utilisateur
      let { data: existingGift, error: selectError } = await supabase
        .from('gifts')
        .select('*')
        .eq('collectible_id', collectibleId)
        .eq('telegram_id', userId)
        .single();
      
      if (existingGift) {
        console.log(`✅ Gift existant trouvé: ${existingGift.collectible_id}`);
        return existingGift;
      }
      
      // Créer un nouveau gift (ajout à l'inventaire)
      const { data: newGift, error: insertError } = await supabase
        .from('gifts')
        .insert([{
          collectible_id: collectibleId,
          telegram_id: userId, // Télégram ID de l'utilisateur
          username: username // Username de l'utilisateur
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      console.log(`✅ Nouveau gift ajouté à l'inventaire: ${newGift.collectible_id}`);
      return newGift;
      
    } catch (error) {
      console.error('❌ Erreur lors de la gestion du gift:', error);
      throw error;
    }
  }
  
  // Ajouter un gift à l'inventaire d'un utilisateur (utilise directement la table gifts)
  static async addToInventory(userId, giftId, telegramMessageId, giftData) {
    try {
      console.log(`🔄 Ajout à l'inventaire: User ${userId}, Gift ${giftId}`);
      
      // Vérifier si le gift n'est pas déjà dans l'inventaire
      const { data: existingItem, error: checkError } = await supabase
        .from('gifts')
        .select('*')
        .eq('telegram_id', userId)
        .eq('collectible_id', giftData.collectibleId)
        .single();
      
      if (existingItem) {
        console.log('⚠️ Gift déjà dans l\'inventaire de l\'utilisateur');
        return existingItem;
      }
      
      // Ajouter à l'inventaire (table gifts)
      const { data: inventoryItem, error: insertError } = await supabase
        .from('gifts')
        .insert([{
          collectible_id: giftData.collectibleId,
          telegram_id: userId,
          username: giftData.username
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      console.log(`✅ Gift ajouté à l'inventaire: ${inventoryItem.collectible_id}`);
      return inventoryItem;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout à l\'inventaire:', error);
      throw error;
    }
  }
  
  // Retirer un gift de l'inventaire d'un utilisateur (supprime de la table gifts)
  static async removeFromInventory(userId, giftId, telegramMessageId, giftData) {
    try {
      console.log(`🔄 Retrait de l'inventaire: User ${userId}, Gift ${giftId}`);
      
      // Vérifier si le gift est dans l'inventaire
      const { data: existingItem, error: checkError } = await supabase
        .from('gifts')
        .select('*')
        .eq('telegram_id', userId)
        .eq('collectible_id', giftData.collectibleId)
        .single();
      
      if (!existingItem) {
        console.log('⚠️ Gift non trouvé dans l\'inventaire');
        return null;
      }
      
      // Supprimer le gift de l'inventaire
      const { error: deleteError } = await supabase
        .from('gifts')
        .delete()
        .eq('telegram_id', userId)
        .eq('collectible_id', giftData.collectibleId);
      
      if (deleteError) throw deleteError;
      
      console.log(`✅ Gift retiré de l'inventaire: ${giftData.collectibleId}`);
      return { deleted: true, collectible_id: giftData.collectibleId };
      
    } catch (error) {
      console.error('❌ Erreur lors du retrait de l\'inventaire:', error);
      throw error;
    }
  }
  
  // Enregistrer une transaction (optionnel - peut être commenté si pas de table transactions)
  static async recordTransaction(userId, giftId, transactionType, telegramMessageId, giftData) {
    try {
      // Pour l'instant, on log juste la transaction
      console.log(`📝 Transaction: ${transactionType} - User ${userId}, Gift ${giftId}`);
      
      // Si vous voulez créer la table transactions plus tard, décommentez ceci:
      /*
      const { error: insertError } = await supabase
        .from('transactions')
        .insert([{
          telegram_id: userId,
          collectible_id: giftData.collectibleId,
          transaction_type: transactionType,
          telegram_message_id: telegramMessageId
        }]);
      
      if (insertError) throw insertError;
      */
      
      console.log(`✅ Transaction enregistrée: ${transactionType} pour User ${userId}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de la transaction:', error);
      // Ne pas faire échouer le processus principal
    }
  }
  
  // Obtenir l'inventaire d'un utilisateur (utilise directement la table gifts)
  static async getUserInventory(telegramId) {
    try {
      console.log(`🔄 Récupération inventaire pour: ${telegramId}`);
      
      // Récupérer directement depuis la table gifts
      const { data: inventory, error: inventoryError } = await supabase
        .from('gifts')
        .select('*')
        .eq('telegram_id', telegramId)
        .order('collectible_id', { ascending: true });
      
      if (inventoryError) throw inventoryError;
      
      console.log(`✅ Inventaire récupéré: ${inventory.length} gifts`);
      
      // Transformer les données pour correspondre au format attendu
      const transformedInventory = inventory.map(item => ({
        id: item.id || item.collectible_id,
        gift_id: item.collectible_id,
        gift_name: item.collectible_id, // Utilise collectible_id comme nom
        gift_value: 25, // Valeur par défaut
        collectible_model: 'Modèle standard',
        collectible_backdrop: 'Arrière-plan standard',
        collectible_symbol: 'Symbole standard',
        status: 'active',
        received_at: new Date().toISOString(),
        withdrawn_at: null
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
      const { data: gifts, error: giftsError } = await supabase
        .from('gifts')
        .select('*');
      
      if (giftsError) throw giftsError;
      
      return gifts.length;
      
    } catch (error) {
      console.error('❌ Erreur lors du comptage des gifts actifs:', error);
      return 0;
    }
  }
  
  // Synchroniser l'inventaire virtuel avec Supabase (utilise la table gifts)
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
            telegram_username: userInventory.username || 'unknown'
          });
          
          // Synchroniser chaque gift
          for (const gift of userInventory.gifts) {
            try {
              // Créer ou récupérer le gift (ajoute directement à l'inventaire)
              const giftRecord = await this.getOrCreateGift({
                collectibleId: gift.collectibleId,
                giftName: gift.giftName || gift.collectibleId,
                userId: telegramId,
                username: userInventory.username || 'unknown'
              });
              
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
