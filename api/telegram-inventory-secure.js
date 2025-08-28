// api/telegram-inventory-secure.js
// API SÉCURISÉE pour la Mini App Telegram avec authentification

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Configuration Supabase
const supabaseUrl = 'https://gquyvmelpkgnddvefpwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzMv2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0';

// Token de votre bot Telegram (à mettre dans les variables d'environnement)
const BOT_TOKEN = '7516841125:AAH_jkU6wLOEoApkwu8afeXbZr58bBqiIrU';

// Fonction de vérification de l'authentification Telegram
function verifyTelegramAuth(initData) {
  try {
    if (!initData) {
      console.log('❌ InitData manquant');
      return { isValid: false, error: 'InitData manquant' };
    }

    // Parser l'InitData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      console.log('❌ Hash manquant dans InitData');
      return { isValid: false, error: 'Hash manquant' };
    }

    // Supprimer le hash pour la vérification
    params.delete('hash');
    
    // Trier les paramètres par ordre alphabétique
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Créer le secret pour la vérification
    const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    
    // Calculer le hash attendu
    const expectedHash = crypto.createHmac('sha256', secret).update(sortedParams).digest('hex');
    
    // Comparer les hashes
    if (hash === expectedHash) {
      console.log('✅ Authentification Telegram vérifiée');
      return { isValid: true, userData: Object.fromEntries(params) };
    } else {
      console.log('❌ Hash invalide - authentification échouée');
      return { isValid: false, error: 'Authentification échouée' };
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return { isValid: false, error: 'Erreur de vérification' };
  }
}

// Fonction pour extraire l'ID utilisateur Telegram
function extractTelegramUserId(userData) {
  try {
    // L'ID utilisateur est dans user.id
    if (userData.user) {
      const user = JSON.parse(userData.user);
      // Convertir en string pour la cohérence avec la base de données
      return user.id.toString();
    }
    return null;
  } catch (error) {
    console.error('❌ Erreur extraction ID utilisateur:', error);
    return null;
  }
}

export default async function handler(req, res) {
  try {
    // Vérifier la méthode HTTP
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false,
        error: 'Method not allowed' 
      });
    }

    console.log('🔐 API Telegram Inventory Sécurisée - Démarrage');

    // Récupérer l'InitData depuis les headers
    const initData = req.headers['x-telegram-init-data'];
    
    if (!initData) {
      console.log('❌ Header X-Telegram-Init-Data manquant');
      return res.status(401).json({
        success: false,
        error: 'Authentification requise',
        message: 'Header X-Telegram-Init-Data manquant'
      });
    }

    // Vérifier l'authentification Telegram
    const authResult = verifyTelegramAuth(initData);
    
    if (!authResult.isValid) {
      console.log('❌ Authentification échouée:', authResult.error);
      return res.status(401).json({
        success: false,
        error: 'Authentification échouée',
        message: authResult.error
      });
    }

    // Extraire l'ID utilisateur Telegram
    const telegramUserId = extractTelegramUserId(authResult.userData);
    
    if (!telegramUserId) {
      console.log('❌ Impossible d\'extraire l\'ID utilisateur');
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur invalide',
        message: 'Impossible d\'extraire l\'ID utilisateur Telegram'
      });
    }

    console.log(`🔐 Utilisateur authentifié: ${telegramUserId}`);

    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Récupérer l'utilisateur par son Telegram ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUserId)
      .single();

    if (userError || !user) {
      console.log(`⚠️ Utilisateur non trouvé: ${telegramUserId}`);
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé',
        message: 'Votre compte n\'est pas encore enregistré dans notre système',
        telegramUserId: telegramUserId
      });
    }

    console.log(`✅ Utilisateur trouvé: @${user.username} (${user.telegram_id})`);

    // Récupérer l'inventaire PRIVÉ de l'utilisateur authentifié
    // Utilise directement la table gifts comme inventaire (après nettoyage)
    const { data: gifts, error: inventoryError } = await supabase
      .from('gifts')
      .select('*')
      .eq('telegram_id', telegramUserId); // SÉCURITÉ : uniquement l'inventaire de l'utilisateur connecté

    if (inventoryError) {
      console.error('❌ Erreur récupération inventaire:', inventoryError);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur récupération inventaire',
        details: inventoryError.message
      });
    }

    // Transformer les données pour la Mini App
    const transformedInventory = gifts.map((gift, index) => ({
      id: `${gift.telegram_id}_${gift.collectible_id}`, // ID unique basé sur la clé composite
      collectible_id: gift.collectible_id,
      username: gift.username,
      // Formatage selon vos préférences (GiftName #1, #2, etc.)
      display_name: `${gift.collectible_id} #${index + 1}`,
      received_at: new Date().toISOString() // Timestamp actuel
    }));

    console.log(`✅ Inventaire sécurisé récupéré: ${transformedInventory.length} gifts pour ${user.username}`);

    // Retourner l'inventaire PRIVÉ au format JSON pour la Mini App
    res.status(200).json({
      success: true,
      user: {
        telegram_id: user.telegram_id,
        username: user.username
      },
      inventory: transformedInventory,
      count: transformedInventory.length,
      timestamp: new Date().toISOString(),
      security: {
        authenticated: true,
        method: 'telegram_init_data',
        user_verified: true
      }
    });

  } catch (error) {
    console.error('❌ API Telegram Inventory Sécurisée - Erreur:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
