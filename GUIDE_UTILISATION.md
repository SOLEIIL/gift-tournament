# 🎮 Guide d'Utilisation - Gift Tournament avec Intégration Telegram

## 🚀 Démarrage Rapide

### 1. Démarrer les Services

```bash
# Terminal 1 - Serveur Backend
node server.js

# Terminal 2 - Application Frontend
npm run dev
```

### 2. Accéder à l'Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Bot Telegram:** @testnftbuybot

## 🎯 Fonctionnement de l'Application

### Mode Développement (Actuel)

L'application fonctionne actuellement en **mode développement** avec :

- ✅ **Détection automatique** de l'utilisateur Telegram (simulée)
- ✅ **Chargement automatique** de l'inventaire des gifts
- ✅ **Transfert de gifts** entre utilisateurs
- ✅ **Tournoi de gifts** avec élimination aléatoire

### Utilisateur de Test

- **ID:** 123456789
- **Gifts disponibles:** 5 gifts (valeur totale: 60 TON)
- **Types:** Common, Rare, Epic

## 🎮 Comment Jouer

### 1. Page d'Accueil (Lobby)

1. **Voir votre inventaire** - Vos gifts sont automatiquement chargés
2. **Ajouter des gifts au tournoi** - Cliquez sur "Add Gifts" ou "Quick"
3. **Attendre d'autres joueurs** - Le tournoi démarre automatiquement avec 2+ joueurs

### 2. Pendant le Tournoi

1. **Élimination automatique** - Les gifts sont éliminés un par un
2. **Probabilité basée sur la valeur** - Plus de valeur = plus de chance de gagner
3. **Logs en temps réel** - Suivez les éliminations

### 3. Victoire

1. **Dernier gift survivant** - Le propriétaire gagne le pot total
2. **Écran de victoire** - Animation de confetti
3. **Statistiques** - Historique des parties

## 🔧 Fonctionnalités Avancées

### Transfert de Gifts

```javascript
// Exemple de transfert via API
POST http://localhost:3001/bot:token/sendGift
{
  "from_user_id": 123456789,
  "to_user_id": 987654321,
  "gift_id": "gift_001"
}
```

### Vérification de Transfert

```javascript
// Vérifier si un gift peut être transféré
POST http://localhost:3001/bot:token/canTransferGift
{
  "user_id": 123456789,
  "gift_id": "gift_001"
}
```

### Récupération d'Inventaire

```javascript
// Récupérer les gifts d'un utilisateur
POST http://localhost:3001/bot:token/getUserGifts
{
  "user_id": 123456789
}
```

## 🤖 Intégration Telegram

### Détection Automatique

L'application détecte automatiquement :
- **ID utilisateur** Telegram
- **Nom d'utilisateur** et profil
- **Langue** préférée

### Fallback Mode

Si Telegram n'est pas disponible :
- Utilise les données mock
- Fonctionne en mode développement
- Permet de tester toutes les fonctionnalités

## 📊 API Endpoints

### Backend (http://localhost:3001)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/` | GET | Informations de l'API |
| `/bot:token/getUserGifts` | POST | Récupérer l'inventaire |
| `/bot:token/sendGift` | POST | Transférer un gift |
| `/bot:token/canTransferGift` | POST | Vérifier le transfert |
| `/api/addGift` | POST | Ajouter un gift (test) |
| `/api/gifts` | GET | Lister tous les gifts |
| `/api/users` | GET | Lister tous les utilisateurs |

### Frontend (http://localhost:5173)

| Page | Description |
|------|-------------|
| `/` | Lobby principal |
| `/inventory` | Inventaire personnel |
| `/rolls` | Page des lancers (à venir) |
| `/shop` | Boutique (à venir) |
| `/earn` | Gagner des gifts (à venir) |

## 🎨 Interface Utilisateur

### Thème
- **Couleur principale:** TON Blue (#0088CC)
- **Thème:** Dark mode
- **Design:** Mobile-first, responsive

### Composants Principaux
- **Lobby:** Interface principale du tournoi
- **Inventory:** Gestion des gifts personnels
- **AddGiftsModal:** Sélection de gifts à déposer
- **QuickDeposit:** Dépôt rapide du gift le moins cher
- **Round:** Animation du tournoi
- **Victory:** Écran de victoire

## 🔍 Debug et Tests

### Scripts de Test

```bash
# Test du bot Telegram
node test-telegram-bot.js

# Test de l'intégration complète
node test-integration.js
```

### Logs du Serveur

Le serveur affiche en temps réel :
- 📦 Récupération des gifts
- 🎁 Transferts effectués
- ➕ Nouveaux gifts ajoutés
- ⚠️ Erreurs et avertissements

### Variables d'Environnement

```bash
# .env
VITE_TELEGRAM_BOT_TOKEN=7516841125:AAH_jkU6wLOEoApkwu8afeXbZr58bBqiIrU
VITE_API_BASE_URL=http://localhost:3001
VITE_DEV_MODE=true
```

## 🚀 Déploiement en Production

### 1. Configuration Production

```bash
# .env.production
VITE_TELEGRAM_BOT_TOKEN=your_production_token
VITE_API_BASE_URL=https://your-domain.com
VITE_DEV_MODE=false
```

### 2. Serveur Backend

```bash
# Installer les dépendances
npm install express cors

# Démarrer en production
NODE_ENV=production node server.js
```

### 3. Frontend

```bash
# Build de production
npm run build

# Servir les fichiers statiques
npm run preview
```

## 🔒 Sécurité

### Validation des Données
- ✅ Vérification de propriété des gifts
- ✅ Validation des paramètres d'entrée
- ✅ Gestion des erreurs

### Rate Limiting
- ⏱️ Délai de transfert (24h)
- 🔄 Vérification des cooldowns
- 🛡️ Protection contre les abus

## 📱 Utilisation Mobile

### Telegram Mini App
- **Responsive design** optimisé mobile
- **Touch-friendly** interface
- **Performance** optimisée

### Navigation
- **Swipe gestures** supportés
- **Bottom navigation** accessible
- **Modal dialogs** adaptés mobile

## 🎯 Prochaines Étapes

### Améliorations Prévues
1. **Intégration TON Wallet** - Connexion vraie blockchain
2. **Smart Contracts** - Tournois on-chain
3. **Multiplayer temps réel** - WebSocket
4. **Leaderboards** - Classements
5. **Achievements** - Système de succès

### Fonctionnalités Avancées
- **Tournois privés** - Invitations
- **Différents modes** - Élimination, survie
- **Système de clans** - Équipes
- **Marketplace** - Échange de gifts

## 🆘 Support et Dépannage

### Problèmes Courants

**L'application ne charge pas les gifts :**
- Vérifier que le serveur backend tourne
- Contrôler les logs du serveur
- Tester l'API directement

**Erreur de connexion Telegram :**
- Vérifier le token du bot
- Contrôler la connectivité internet
- Tester avec le script de test

**Tournoi ne démarre pas :**
- Vérifier qu'il y a au moins 2 joueurs
- Contrôler les gifts déposés
- Redémarrer l'application

### Contact
- **Issues:** Créer une issue sur GitHub
- **Support:** Documentation dans `/docs`
- **Tests:** Scripts dans `/tests`

---

**🎉 Bon jeu et bonne chance dans vos tournois de gifts ! 🎁🏆**
