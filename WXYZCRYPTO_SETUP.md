# 🚀 Configuration du Compte de Dépôt @WxyzCrypto

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer votre compte Telegram @WxyzCrypto comme compte de dépôt pour les gifts de votre Mini App.

## 🎯 Étapes de Configuration

### **Étape 1 : Obtenir les Clés API Telegram**

1. **Contacter @BotFather sur Telegram**
   - Ouvrez Telegram et cherchez @BotFather
   - Envoyez `/start` puis `/newapp`
   - Suivez les instructions pour créer une nouvelle application

2. **Récupérer vos clés**
   - **API_ID** : Numéro d'identification de votre application
   - **API_HASH** : Hash de sécurité de votre application
   - **BOT_TOKEN** : Token de votre bot (si vous en créez un)

### **Étape 2 : Créer le Fichier .env**

Créez un fichier `.env` à la racine de votre projet avec ce contenu :

```bash
# Configuration du Service de Dépôt @WxyzCrypto

# COMPTE DE DÉPÔT TELEGRAM
DEPOSIT_ACCOUNT_USERNAME=WxyzCrypto
DEPOSIT_ACCOUNT_PHONE=+VOTRE_NUMERO_TELEPHONE

# API TELEGRAM
TELEGRAM_API_ID=VOTRE_API_ID
TELEGRAM_API_HASH=VOTRE_API_HASH
TELEGRAM_SESSION_STRING=VOTRE_SESSION_STRING

# WEBHOOK ET SÉCURITÉ
WEBHOOK_URL=https://gift-tournament-git-main-soleiils-projects.vercel.app/api/deposit-webhook
WEBHOOK_SECRET=wxyz-webhook-secret-2024
DEPOSIT_API_KEY=wxyz-crypto-secure-key-2024

# LIMITES ET CONFIGURATION
MIN_TRANSFER_VALUE=1
MAX_TRANSFER_VALUE=10000
AUTO_CONFIRM=true
CONFIRMATION_DELAY=30

# LOGGING
LOG_LEVEL=info
DEBUG=false
```

### **Étape 3 : Générer la Session String Telegram**

1. **Installer les dépendances**
   ```bash
   npm install telegram dotenv
   ```

2. **Créer un script de génération de session**
   ```javascript
   // generate-session.js
   const { TelegramClient } = require('telegram');
   const { StringSession } = require('telegram/sessions');
   require('dotenv').config();

   async function generateSession() {
     const client = new TelegramClient(
       new StringSession(''),
       process.env.TELEGRAM_API_ID,
       process.env.TELEGRAM_API_HASH
     );

     await client.start();
     
     console.log('✅ Session générée avec succès !');
     console.log('Session String:', client.session.save());
     
     await client.disconnect();
   }

   generateSession().catch(console.error);
   ```

3. **Exécuter le script**
   ```bash
   node generate-session.js
   ```

4. **Copier la session string dans votre .env**

### **Étape 4 : Tester la Configuration**

1. **Démarrer le service de dépôt**
   ```bash
   node start-deposit-service.js
   ```

2. **Vérifier les logs**
   - Le service doit afficher "✅ Service de dépôt démarré avec succès"
   - Le moniteur Telegram doit être actif

3. **Tester avec un gift**
   - Envoyez un fichier .gift à @WxyzCrypto
   - Vérifiez que le webhook est reçu

## 🔒 Sécurité

### **Clés de Sécurité**

- **WEBHOOK_SECRET** : Clé secrète pour vérifier les webhooks
- **DEPOSIT_API_KEY** : Clé API pour signer les webhooks
- **TELEGRAM_SESSION_STRING** : Session sécurisée de votre compte

### **Protection des Webhooks**

- Vérification de signature HMAC-SHA256
- Timestamp de validation (5 minutes max)
- Headers de sécurité obligatoires

### **Limites de Transfert**

- **Valeur minimale** : 1 TON
- **Valeur maximale** : 10,000 TON
- **Confirmation automatique** : 30 secondes

## 📱 Interface Utilisateur

### **Instructions de Dépôt**

Vos utilisateurs verront ces instructions :

1. **Ouvrir Telegram**
2. **Contacter @WxyzCrypto**
3. **Envoyer le gift** (fichier .gift, .ton, .crypto, .nft)
4. **Attendre la confirmation** (30 secondes)

### **Notifications Automatiques**

- **Transfert reçu** : "🎁 Gift reçu ! En cours de traitement..."
- **Transfert confirmé** : "✅ Votre gift a été ajouté à votre inventaire !"
- **Transfert échoué** : "❌ Le transfert a échoué. Veuillez réessayer."

## 🚀 Déploiement

### **1. Variables d'Environnement Vercel**

Ajoutez ces variables dans votre projet Vercel :

```bash
DEPOSIT_API_KEY=wxyz-crypto-secure-key-2024
WEBHOOK_SECRET=wxyz-webhook-secret-2024
```

### **2. Redéploiement Automatique**

Vercel redéploiera automatiquement votre API webhook.

### **3. Test de Production**

1. Envoyez un petit gift à @WxyzCrypto
2. Vérifiez les logs Vercel
3. Confirmez que l'inventaire est mis à jour

## 🔍 Monitoring

### **Logs Vercel**

- Accédez à votre projet Vercel
- Section "Functions" → "api/deposit-webhook"
- Vérifiez les logs en temps réel

### **Métriques**

- Transferts reçus
- Transferts confirmés
- Transferts échoués
- Temps de traitement

## 🚨 Dépannage

### **Erreurs Communes**

1. **"Signature invalide"**
   - Vérifiez WEBHOOK_SECRET et DEPOSIT_API_KEY
   - Redémarrez le service

2. **"Session expirée"**
   - Régénérez TELEGRAM_SESSION_STRING
   - Redémarrez le service

3. **"Webhook failed"**
   - Vérifiez l'URL du webhook
   - Vérifiez les variables d'environnement Vercel

### **Support**

- Vérifiez les logs Vercel
- Testez avec de petits transferts
- Contactez l'équipe technique

## 🎯 Prochaines Étapes

1. **Configurer la base de données** pour stocker les transferts
2. **Ajouter des notifications push** via Telegram Bot API
3. **Mettre en place le monitoring** en temps réel
4. **Configurer les alertes** pour les transferts échoués

---

**⚠️ Important** : Ce système gère de l'argent réel. Testez exhaustivement avant la mise en production !

**🔐 Sécurité** : Ne partagez jamais vos clés API ou secrets !
