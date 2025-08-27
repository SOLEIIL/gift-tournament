// server-local.js
// Serveur local pour tester l'API d'inventaire Telegram

import express from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3001;

// Middleware pour parser les en-têtes
app.use(express.json());

// Configuration Supabase
const supabase = createClient(
  'https://gquyvmelpkgnddvefpwd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdXl2bWVscGtnbmRkdmVmcHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTU1MDAsImV4cCI6MjA3MTc5MTUwMH0.rzMv2n_RyFDlMCxzqLt6B-UHS-OlcoJDXEOWs1-tTN0'
);

// Endpoint d'inventaire (copie de l'API Vercel)
app.get('/api/inventory', async (req, res) => {
  try {
    console.log('📱 API Inventory - Démarrage avec authentification Telegram');

    // Récupérer les données d'initialisation Telegram depuis l'en-tête
    const initData = req.headers['x-telegram-init-data'] || req.headers['X-Telegram-Init-Data'];
    
    if (!initData) {
      console.log('⚠️ Aucune donnée d\'initialisation Telegram détectée');
      return res.status(401).json({ 
        success: false, 
        error: 'Authentification Telegram requise',
        message: 'Cette API nécessite une authentification via Telegram Mini App'
      });
    }

    console.log('🔐 Données d\'initialisation reçues:', initData);

    // Valider la signature selon la documentation officielle Telegram
    const botToken = '7516841125:AAH_jkU6wLOEoApkwu8afeXbZr58bBqiIrU';
    
    // Créer la clé secrète selon la documentation officielle
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    
    // Parser les paramètres de l'URL
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      console.log('⚠️ Hash manquant dans les données Telegram');
      return res.status(401).json({ 
        success: false, 
        error: 'Hash manquant',
        message: 'Données Telegram invalides'
      });
    }
    
    // Supprimer le hash pour la validation
    urlParams.delete('hash');
    
    // Trier les paramètres par ordre alphabétique selon la documentation
    const params = Array.from(urlParams.entries()).sort(([a], [b]) => a.localeCompare(b));
    
    // Créer la chaîne de vérification selon la documentation officielle
    const dataCheckString = params.map(([key, value]) => `${key}=${value}`).join('\n');
    
    console.log('🔍 Chaîne de vérification:', dataCheckString);
    
    // Calculer le hash selon la documentation officielle
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    console.log('🔐 Hash reçu:', hash);
    console.log('🔐 Hash calculé:', calculatedHash);
    
    if (hash !== calculatedHash) {
      console.log('⚠️ Signature Telegram invalide');
      return res.status(401).json({ 
        success: false, 
        error: 'Signature invalide',
        message: 'Authentification Telegram échouée'
      });
    }

    console.log('✅ Signature Telegram validée avec succès');

    // Extraire l'ID utilisateur des paramètres validés
    const userParam = urlParams.get('user');
    let userId = null;
    
    if (userParam) {
      try {
        const userData = JSON.parse(userParam);
        userId = userData.id;
        console.log('👤 Utilisateur extrait:', userData);
      } catch (e) {
        console.log('⚠️ Erreur parsing utilisateur:', e);
      }
    }
    
    if (!userId) {
      console.log('⚠️ ID utilisateur non trouvé dans les données Telegram');
      return res.status(400).json({ 
        success: false, 
        error: 'ID utilisateur manquant',
        message: 'Impossible d\'identifier l\'utilisateur'
      });
    }

    console.log(`📱 API Inventory - Utilisateur Telegram authentifié: ${userId}`);

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

    // Transformer les données pour correspondre au format attendu
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

    console.log(`✅ API Inventory - ${transformedInventory.length} gifts récupérés pour l'utilisateur ${userId}`);

    // Retourner l'inventaire au format JSON
    res.status(200).json({
      success: true,
      telegramId: userId,
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
    console.error('❌ API Inventory - Erreur:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de test
app.get('/test', (req, res) => {
  res.json({ message: 'Serveur local fonctionne !' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur local démarré sur http://localhost:${PORT}`);
  console.log(`📱 API Inventory: http://localhost:${PORT}/api/inventory`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
});

