// api/telegram-inventory.js
// Endpoint spécial pour la Mini App Telegram

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // Vérifier la méthode HTTP
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('📱 API Telegram Inventory - Démarrage');

    // Créer le client Supabase
    const supabase = createClient(
      'https://gquyvmelpkgnddvefpwd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzMv2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0'
    );

    // Récupérer l'inventaire de l'utilisateur par défaut (drole)
    const userId = '986778065'; // ID par défaut pour votre Mini App
    
    console.log(`📱 API Telegram Inventory - Récupération pour l'utilisateur: ${userId}`);

    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', userId)
      .single();

    if (userError || !user) {
      console.log(`⚠️ Utilisateur non trouvé: ${userId}`);
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé',
        userId: userId
      });
    }

    // Récupérer l'inventaire avec JOIN sur les gifts
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        *,
        gifts (
          collectible_id,
          gift_name,
          gift_value,
          collectible_model,
          collectible_backdrop,
          collectible_symbol
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (inventoryError) {
      console.error('❌ Erreur récupération inventaire:', inventoryError);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur récupération inventaire',
        details: inventoryError.message
      });
    }

    // Transformer les données pour la Mini App
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

    console.log(`✅ API Telegram Inventory - ${transformedInventory.length} gifts récupérés`);

    // Retourner l'inventaire au format JSON pour la Mini App
    res.status(200).json({
      success: true,
      userId: userId,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username
      },
      inventory: transformedInventory,
      count: transformedInventory.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Telegram Inventory - Erreur:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

