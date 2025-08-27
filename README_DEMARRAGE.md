# 🚀 Guide de Démarrage - Application Complète

## 📋 **Vue d'ensemble**

Votre application est maintenant configurée pour démarrer **automatiquement** :
- 🌐 **Application web** (interface utilisateur)
- 🎁 **Détecteur de gifts** (surveillance Telegram)
- 📱 **Synchronisation Supabase** (base de données en temps réel)

## 🎯 **Modes de Démarrage Disponibles**

### 1. **🚀 Application Complète (Recommandé)**
Démarre TOUT en même temps : web + détecteur + Supabase
```bash
npm run start:full
# ou
npm start
```

### 2. **🌐 Application Web Uniquement**
Démarre seulement l'interface utilisateur
```bash
npm run start:web
# ou
npm run dev
```

### 3. **🎁 Système de Gifts Uniquement**
Démarre seulement le détecteur et la synchronisation
```bash
npm run start:gifts
```

## 🖥️ **Démarrage sur Windows**

### **Option A : Script Batch (Simple)**
Double-cliquez sur `start-app.bat`
- ✅ Vérification automatique de Node.js
- ✅ Installation automatique des dépendances
- ✅ Démarrage automatique

### **Option B : Script PowerShell (Avancé)**
Ouvrez PowerShell et exécutez :
```powershell
# Démarrage interactif
.\start-app.ps1

# Démarrage direct de l'app complète
.\start-app.ps1 -Full

# Démarrage web uniquement
.\start-app.ps1 -WebOnly

# Démarrage gifts uniquement
.\start-app.ps1 -GiftsOnly
```

## 🐧 **Démarrage sur Linux/Mac**

```bash
# Application complète
npm run start:full

# Ou directement
node start-app.cjs
```

## 📱 **Ce qui se passe au Démarrage**

1. **🔍 Validation de la configuration**
   - Vérification des clés Telegram
   - Vérification de la connexion Supabase

2. **🌐 Lancement de l'application web**
   - Serveur Vite sur http://localhost:5173
   - Interface utilisateur accessible

3. **🎁 Démarrage du détecteur de gifts**
   - Connexion à Telegram (@WxyzCrypto)
   - Surveillance des messages en temps réel
   - Synchronisation automatique avec Supabase

4. **📊 Monitoring et health checks**
   - Vérification toutes les 30 secondes
   - Logs en temps réel

## 🛑 **Arrêt de l'Application**

- **Ctrl+C** dans le terminal
- Ou fermez le terminal
- Arrêt propre et sécurisé automatique

## 🔧 **Dépannage**

### **Erreur "Node.js non trouvé"**
```bash
# Installer Node.js depuis https://nodejs.org/
# Redémarrer le terminal après installation
```

### **Erreur "npm non trouvé"**
```bash
# Node.js inclut npm, réinstallez Node.js
```

### **Erreur de dépendances**
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
```

### **Port déjà utilisé**
```bash
# L'application web utilise le port 5173
# Fermez les autres applications qui utilisent ce port
```

## 📊 **Vérification du Fonctionnement**

1. **Application web** : http://localhost:5173
2. **Logs du détecteur** : Vérifiez les messages dans le terminal
3. **Synchronisation Supabase** : Vérifiez les logs de connexion

## 🎉 **Prêt à Utiliser !**

Une fois démarrée, votre application :
- ✅ Surveille automatiquement les gifts Telegram
- ✅ Synchronise en temps réel avec Supabase
- ✅ Met à jour les inventaires des joueurs
- ✅ Fonctionne 24/7 sans intervention

**Envoyez un gift à @WxyzCrypto pour tester !** 🎁
