# 🚀 Guide de Déploiement Automatique - Gift Tournament

## 📋 Configuration Automatique

### 1. Variables d'Environnement Vercel

Dans votre dashboard Vercel, configurez automatiquement :

```bash
# Variables d'environnement à ajouter
VITE_TELEGRAM_BOT_TOKEN=7516841125:AAH_jkU6wLOEoApkwu8afeXbZr58bBqiIrU
VITE_API_BASE_URL=https://gift-tournament-backend.railway.app
VITE_DEV_MODE=false
```

### 2. Déploiement Backend Railway

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter à Railway
railway login

# Initialiser le projet
railway init

# Déployer
railway up
```

### 3. Configuration Webhook Telegram

```bash
# Configurer le webhook automatiquement
curl -X POST "https://api.telegram.org/bot7516841125:AAH_jkU6wLOEoApkwu8afeXbZr58bBqiIrU/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://gift-tournament-backend.railway.app/webhook"}'
```

## 🔧 Scripts de Déploiement Automatique

### Déploiement Complet

```bash
# Déployer le backend
npm run deploy:backend

# Déployer le frontend
npm run deploy:frontend

# Configurer les webhooks
npm run setup:webhooks
```

### Mise à Jour des Variables

```bash
# Mettre à jour Vercel
vercel env add VITE_TELEGRAM_BOT_TOKEN
vercel env add VITE_API_BASE_URL
vercel env add VITE_DEV_MODE

# Redéployer
vercel --prod
```

## 📊 URLs de Production

- **Frontend Vercel:** https://gift-tournament.vercel.app
- **Backend Railway:** https://gift-tournament-backend.railway.app
- **Bot Telegram:** @testnftbuybot

## 🔄 Mise à Jour Automatique

### 1. Variables d'Environnement

Le fichier `vercel.json` configure automatiquement :
- Headers de sécurité
- Rewrites pour SPA
- Variables d'environnement

### 2. Configuration Railway

Le fichier `railway.json` configure automatiquement :
- Build et déploiement
- Health checks
- Restart policies

### 3. Scripts NPM

Les scripts dans `package.json` permettent :
- `npm run deploy:backend` - Déploiement Railway
- `npm run deploy:frontend` - Déploiement Vercel
- `npm start` - Démarrage local

## 🎯 Configuration Post-Déploiement

### 1. Vérifier le Déploiement

```bash
# Tester le backend
curl https://gift-tournament-backend.railway.app/

# Tester le frontend
curl https://gift-tournament.vercel.app/
```

### 2. Tester l'Intégration

```bash
# Tester l'API
curl -X POST https://gift-tournament-backend.railway.app/bot:token/getUserGifts \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123456789}'
```

### 3. Monitoring

- **Vercel Analytics:** https://vercel.com/soleiils-projects/gift-tournament/analytics
- **Railway Logs:** https://railway.app/project/[project-id]/deployments
- **Telegram Bot:** @testnftbuybot

## 🔒 Sécurité Automatique

### Headers Configurés

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Variables Sécurisées

- Token Telegram dans les variables d'environnement
- URLs d'API configurées automatiquement
- Mode développement désactivé en production

## 📱 Intégration Telegram

### Configuration Automatique

1. **Bot Token:** Configuré automatiquement
2. **Webhook URL:** Pointé vers Railway
3. **API Endpoints:** Accessibles publiquement

### Test Automatique

```bash
# Tester la configuration
node test-telegram-bot.js

# Tester l'intégration complète
node test-integration.js
```

## 🎉 Déploiement Terminé

Votre application est maintenant :
- ✅ **Déployée sur Vercel** - Frontend accessible
- ✅ **Backend sur Railway** - API fonctionnelle
- ✅ **Bot Telegram configuré** - Intégration active
- ✅ **Variables d'environnement** - Configurées automatiquement
- ✅ **Sécurité** - Headers et politiques configurés

**URL de Production:** https://gift-tournament.vercel.app

---

**🎁 Votre application Gift Tournament est maintenant prête pour les utilisateurs ! 🏆**
