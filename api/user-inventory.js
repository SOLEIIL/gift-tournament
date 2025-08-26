// api/user-inventory.js
import { InventoryManager } from '../../lib/supabase.js';

// Configuration sécurisée
const INVENTORY_CONFIG = {
  apiKey: process.env.INVENTORY_API_KEY || 'inventory-secure-key-2024'
};

// Middleware de vérification de clé API
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== INVENTORY_CONFIG.apiKey) {
    return res.status(401).json({ 
      error: 'Clé API invalide',
      code: 'INVALID_API_KEY'
    });
  }
  
  next();
};

// Obtenir l'inventaire d'un utilisateur
const getUserInventory = async (req, res) => {
  try {
    const { telegramId } = req.query;
    
    if (!telegramId) {
      return res.status(400).json({
        error: 'ID Telegram manquant',
        code: 'MISSING_TELEGRAM_ID'
      });
    }
    
    console.log(`🔍 Récupération de l'inventaire pour l'utilisateur ${telegramId}`);
    
    const inventory = await InventoryManager.getUserInventory(telegramId);
    
    console.log(`✅ Inventaire récupéré: ${inventory.length} gifts`);
    
    return res.status(200).json({
      success: true,
      telegramId: parseInt(telegramId),
      inventory,
      count: inventory.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'inventaire:', error);
    
    if (error.message === 'Utilisateur non trouvé') {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
        message: error.message
      });
    }
    
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
};

// Obtenir les statistiques d'un utilisateur
const getUserStats = async (req, res) => {
  try {
    const { telegramId } = req.query;
    
    if (!telegramId) {
      return res.status(400).json({
        error: 'ID Telegram manquant',
        code: 'MISSING_TELEGRAM_ID'
      });
    }
    
    console.log(`📊 Récupération des statistiques pour l'utilisateur ${telegramId}`);
    
    const inventory = await InventoryManager.getUserInventory(telegramId);
    
    // Calculer les statistiques
    const stats = {
      totalGifts: inventory.length,
      totalValue: inventory.reduce((sum, item) => sum + (item.gifts?.gift_value || 0), 0),
      uniqueGifts: [...new Set(inventory.map(item => item.gifts?.gift_name))].length,
      rarestGift: inventory.reduce((rarest, item) => {
        const rarity = item.gifts?.collectible_model || '';
        if (rarity.includes('‰')) {
          const rarityValue = parseFloat(rarity.match(/(\d+(?:\.\d+)?)/)?.[1] || '100');
          if (!rarest || rarityValue < parseFloat(rarest.match(/(\d+(?:\.\d+)?)/)?.[1] || '100')) {
            return rarity;
          }
        }
        return rarest;
      }, null)
    };
    
    console.log(`✅ Statistiques calculées pour l'utilisateur ${telegramId}`);
    
    return res.status(200).json({
      success: true,
      telegramId: parseInt(telegramId),
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
};

// Rechercher des gifts dans l'inventaire
const searchInventory = async (req, res) => {
  try {
    const { telegramId, query } = req.query;
    
    if (!telegramId || !query) {
      return res.status(400).json({
        error: 'ID Telegram ou requête manquant',
        code: 'MISSING_PARAMETERS'
      });
    }
    
    console.log(`🔍 Recherche "${query}" dans l'inventaire de l'utilisateur ${telegramId}`);
    
    const inventory = await InventoryManager.getUserInventory(telegramId);
    
    // Filtrer les résultats
    const filteredInventory = inventory.filter(item => {
      const gift = item.gifts;
      const searchTerm = query.toLowerCase();
      
      return (
        gift.gift_name.toLowerCase().includes(searchTerm) ||
        gift.collectible_id.toLowerCase().includes(searchTerm) ||
        (gift.collectible_model && gift.collectible_model.toLowerCase().includes(searchTerm)) ||
        (gift.collectible_backdrop && gift.collectible_backdrop.toLowerCase().includes(searchTerm)) ||
        (gift.collectible_symbol && gift.collectible_symbol.toLowerCase().includes(searchTerm))
      );
    });
    
    console.log(`✅ Recherche terminée: ${filteredInventory.length} résultats`);
    
    return res.status(200).json({
      success: true,
      telegramId: parseInt(telegramId),
      query,
      results: filteredInventory,
      count: filteredInventory.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error);
    
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
};

// API endpoint principal
export default async function handler(req, res) {
  // Vérifier la clé API
  verifyApiKey(req, res, async () => {
    const { action } = req.query;
    
    try {
      switch (action) {
        case 'inventory':
          return await getUserInventory(req, res);
          
        case 'stats':
          return await getUserStats(req, res);
          
        case 'search':
          return await searchInventory(req, res);
          
        default:
          return res.status(400).json({
            error: 'Action non reconnue',
            code: 'UNKNOWN_ACTION',
            availableActions: ['inventory', 'stats', 'search']
          });
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement de la requête:', error);
      
      return res.status(500).json({
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        message: error.message
      });
    }
  });
}
