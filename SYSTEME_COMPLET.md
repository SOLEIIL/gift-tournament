# 🚀 SYSTÈME COMPLET - GIFT TOURNAMENT

## 🎯 **Vue d'ensemble du Système**

Votre application est maintenant **100% automatisée** et démarre automatiquement :
- 🌐 **Application web** (interface utilisateur)
- 🎁 **Détecteur de gifts Telegram** (surveillance @WxyzCrypto)
- 📱 **Synchronisation Supabase** (base de données en temps réel)
- 🔄 **Redémarrage automatique** (gestion des erreurs)

## 🚀 **Démarrage Automatique**

### **Option 1 : Démarrage Simple (Recommandé)**
```bash
# Double-cliquez sur start-app.bat (Windows)
# Ou exécutez dans le terminal :
npm run start:full
```

### **Option 2 : Démarrage Séparé**
```bash
# Application web uniquement
npm run start:web

# Détecteur de gifts uniquement  
npm run start:gifts
```

### **Option 3 : Service Windows (Production)**
```bash
# Double-cliquez sur install-windows-service.bat
# L'application devient un service Windows qui démarre automatiquement
```

## 📱 **Fonctionnalités Automatiques**

### **🎁 Détection des Gifts**
- ✅ Surveillance automatique de @WxyzCrypto
- ✅ Détection en temps réel des gifts Telegram
- ✅ Synchronisation immédiate avec Supabase
- ✅ Mise à jour automatique des inventaires

### **📊 Monitoring et Santé**
- ✅ Health checks toutes les 30 secondes
- ✅ Redémarrage automatique en cas de crash
- ✅ Logs détaillés en temps réel
- ✅ Gestion des erreurs robuste

### **🔄 Synchronisation**
- ✅ Base de données Supabase en temps réel
- ✅ Inventaires des joueurs synchronisés
- ✅ Historique des transactions
- ✅ Gestion des utilisateurs automatique

## 🛠️ **Scripts Disponibles**

| Script | Description | Commande |
|--------|-------------|----------|
| `start-app.cjs` | 🚀 Démarrage complet automatique | `npm start` |
| `start-production.cjs` | 🎁 Système de production optimisé | `npm run start:gifts` |
| `start-gift-system.cjs` | 🎯 Système de base des gifts | `node start-gift-system.cjs` |
| `deploy-vercel.cjs` | 🌐 Déploiement automatique Vercel | `npm run deploy` |

## 🖥️ **Scripts Windows**

| Script | Description | Utilisation |
|--------|-------------|-------------|
| `start-app.bat` | 🚀 Démarrage simple | Double-clic |
| `start-app.ps1` | 🚀 Démarrage avancé | PowerShell |
| `install-windows-service.bat` | 🔧 Service Windows | Double-clic |

## 🌐 **Déploiement Vercel**

### **Déploiement Automatique**
```bash
# Déployer vers Vercel
npm run deploy

# Vérifier le statut
npm run deploy:status
```

### **Configuration Vercel**
- ✅ `vercel.json` configuré pour le déploiement
- ✅ Build automatique de l'application web
- ✅ Démarrage automatique du détecteur
- ✅ Routes API configurées

## 📊 **Monitoring et Logs**

### **Health Checks Automatiques**
- ⏱️ Vérification toutes les 30 secondes
- 🎁 Statut du détecteur de gifts
- 🤖 Statut du bot d'inventaire
- 🗄️ Connexion Supabase
- 📱 Nombre total de gifts

### **Logs en Temps Réel**
- 🎁 Détection des gifts
- 📱 Synchronisation Supabase
- 🤖 Commandes du bot
- ❌ Erreurs et exceptions

## 🔧 **Configuration**

### **Variables d'Environnement**
```bash
# Telegram API
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_SESSION_STRING=your_session_string

# Bot Token
BOT_TOKEN=your_bot_token

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Webhook
WEBHOOK_URL=your_webhook_url
WEBHOOK_SECRET=your_webhook_secret
```

### **Fichiers de Configuration**
- `config.cjs` - Configuration principale
- `ecosystem.config.js` - Configuration PM2
- `vercel.json` - Configuration Vercel

## 🚨 **Gestion des Erreurs**

### **Redémarrage Automatique**
- ✅ Crash du détecteur → Redémarrage automatique
- ✅ Crash du bot → Redémarrage automatique
- ✅ Perte de connexion → Reconnexion automatique
- ✅ Erreurs Supabase → Retry automatique

### **Logs d'Erreurs**
- 📝 Erreurs détaillées dans la console
- 🔍 Stack traces complets
- ⏰ Horodatage des erreurs
- 📊 Statistiques d'erreurs

## 📱 **Utilisation**

### **1. Démarrage**
```bash
npm run start:full
```

### **2. Test**
- Envoyez un gift à @WxyzCrypto
- Vérifiez la détection en temps réel
- Consultez l'inventaire via @testnftbuybot

### **3. Monitoring**
- Surveillez les logs en temps réel
- Vérifiez les health checks
- Contrôlez le statut des services

### **4. Arrêt**
- `Ctrl+C` dans le terminal
- Ou fermez le terminal
- Arrêt propre automatique

## 🎉 **Résultat Final**

Votre système est maintenant **100% automatisé** :
- 🚀 **Démarre automatiquement** au lancement
- 🎁 **Surveille les gifts** 24/7
- 📱 **Synchronise en temps réel** avec Supabase
- 🔄 **Se redémarre automatiquement** en cas de problème
- 🌐 **Déploie automatiquement** sur Vercel

**Envoyez un gift à @WxyzCrypto pour tester !** 🎁✨
