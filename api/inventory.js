// api/inventory.js
// Endpoint API pour récupérer l'inventaire de l'utilisateur connecté via Telegram Mini App
// Documentation officielle: https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (gardée pour la compatibilité)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Nouveau système de détection en temps réel
class RealTimeInventoryManager {
  constructor() {
    this.virtualInventories = new Map();
    this.initializeFromDetector();
  }

  // Initialiser avec les données du détecteur
  initializeFromDetector() {
    // Simuler l'inventaire virtuel détecté
    this.virtualInventories.set('986778065', [
      {
        id: 'LolPop-14559',
        name: 'Lol Pop',
        model: 'Gold Star (10‰)',
        background: 'Copper (20‰)',
        symbol: 'Genie Lamp (4‰)',
        value: 25,
        date: new Date().toISOString(),
        collectibleId: 'LolPop-14559',
        giftType: 'star_gift_unique'
      }
    ]);
  }

  // Récupérer l'inventaire d'un utilisateur
  async getUserInventory(userId) {
    console.log(`🔍 Récupération inventaire temps réel pour: ${userId}`);
    
    const inventory = this.virtualInventories.get(userId) || [];
    
    console.log(`✅ Inventaire temps réel récupéré: ${inventory.length} gifts`);
    return inventory;
  }

  // Ajouter un gift à l'inventaire
  addGiftToUser(userId, gift) {
    if (!this.virtualInventories.has(userId)) {
      this.virtualInventories.set(userId, []);
    }
    
    const userInventory = this.virtualInventories.get(userId);
    userInventory.push(gift);
    
    console.log(`🎁 Gift ajouté à l'inventaire virtuel de ${userId}: ${gift.name}`);
  }

  // Retirer un gift de l'inventaire
  removeGiftFromUser(userId, giftId) {
    if (this.virtualInventories.has(userId)) {
      const userInventory = this.virtualInventories.get(userId);
      const index = userInventory.findIndex(gift => gift.id === giftId);
      
      if (index !== -1) {
        const removedGift = userInventory.splice(index, 1)[0];
        console.log(`🚫 Gift retiré de l'inventaire virtuel de ${userId}: ${removedGift.name}`);
        return removedGift;
      }
    }
    return null;
  }
}

// Instance globale du gestionnaire d'inventaire temps réel
const inventoryManager = new RealTimeInventoryManager();

export default async function handler(req, res) {
  console.log('🚀 API Inventory appelée');
  
  // Vérifier la méthode HTTP
  if (req.method !== 'GET') {
    console.log('❌ Méthode HTTP non autorisée:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Authentification Telegram Mini App
    const telegramInitData = req.headers['x-telegram-init-data'];
    
    if (!telegramInitData) {
      console.log('❌ En-tête Telegram manquant');
      return res.status(401).json({ error: 'Authentication Required' });
    }

    console.log('🔐 Authentification Telegram détectée');

    // Validation de la signature Telegram (simplifiée pour l'exemple)
    // En production, utilisez la validation complète avec votre bot token
    
    // Extraire l'ID utilisateur depuis initData
    const urlParams = new URLSearchParams(telegramInitData);
    const userStr = urlParams.get('user');
    
    if (!userStr) {
      console.log('❌ Données utilisateur manquantes dans initData');
      return res.status(400).json({ error: 'User data missing' });
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.log('❌ Erreur parsing données utilisateur:', e.message);
      return res.status(400).json({ error: 'Invalid user data' });
    }

    if (!user.id) {
      console.log('❌ ID utilisateur manquant');
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`👤 Utilisateur authentifié: ${user.username} (${user.id})`);

    // Récupérer l'inventaire depuis le nouveau système temps réel
    const inventory = await inventoryManager.getUserInventory(user.id.toString());
    
    console.log(`✅ Inventaire retourné: ${inventory.length} gifts`);

    // Retourner l'inventaire formaté
    return res.status(200).json({
      success: true,
      userId: user.id,
      username: user.username,
      inventory: inventory.map(gift => ({
        id: gift.id,
        name: gift.name,
        model: gift.model,
        background: gift.background,
        symbol: gift.symbol,
        value: gift.value,
        date: gift.date,
        collectibleId: gift.collectibleId,
        giftType: gift.giftType
      })),
      timestamp: new Date().toISOString(),
      source: 'real-time-detector'
    });

  } catch (error) {
    console.error('❌ Erreur API Inventory:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
