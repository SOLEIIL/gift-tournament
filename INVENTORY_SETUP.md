# 🚀 DÉMARRAGE RAPIDE - Système d'Inventaire Gifts

## 🎯 **Objectif**
Créer un système d'inventaire synchronisé entre Telegram et votre bot @testnftbuybot qui :
- ✅ **Ajoute automatiquement** les gifts reçus par @WxyzCrypto à l'inventaire de l'expéditeur
- 🚫 **Retire automatiquement** les gifts withdrawés de l'inventaire de l'utilisateur
- 🔄 **Synchronise en temps réel** via webhooks sécurisés

## 🗄️ **Étape 1 : Créer la base de données Supabase**

### 1.1 Créer un projet Supabase
1. **Aller sur [supabase.com](https://supabase.com)**
2. **Créer un nouveau projet**
3. **Noter l'URL et la clé anonyme**

### 1.2 Configurer la base de données
1. **Aller dans l'éditeur SQL** de votre projet
2. **Copier et exécuter** le script `database/supabase-setup.sql`
3. **Vérifier** que les 4 tables sont créées :
   - `users` - Utilisateurs Telegram
   - `gifts` - Métadonnées des gifts
   - `inventory` - Inventaire des utilisateurs
   - `transactions` - Historique des opérations

## ⚙️ **Étape 2 : Configuration des variables d'environnement**

### 2.1 Copier le fichier de configuration
```bash
copy config-inventory.env .env
```

### 2.2 Éditer le fichier .env
```env
# Telegram API
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_SESSION_STRING=your_session_string

# Compte de dépôt
DEPOSIT_ACCOUNT_USERNAME=WxyzCrypto

# Webhook (IMPORTANT : utiliser inventory-webhook)
WEBHOOK_URL=https://your-project.vercel.app/api/inventory-webhook
WEBHOOK_SECRET=your_secret
API_KEY=your_api_key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
INVENTORY_API_KEY=inventory-secure-key-2024
```

## 🔧 **Étape 3 : Tester le système**

### 3.1 Démarrer le détecteur
```bash
node start-gift-detector.cjs
```

### 3.2 Tester un dépôt
1. **Envoyer un gift à @WxyzCrypto** depuis votre compte Telegram
2. **Vérifier dans le terminal** que le gift est détecté
3. **Vérifier dans Supabase** que :
   - L'utilisateur est créé dans la table `users`
   - Le gift est créé dans la table `gifts`
   - L'inventaire est mis à jour dans la table `inventory`
   - La transaction est enregistrée dans la table `transactions`

### 3.3 Tester un withdraw
1. **Demander un withdraw** via @testnftbuybot (à implémenter)
2. **Vérifier** que le gift disparaît de l'inventaire

## 📊 **API Endpoints disponibles**

### **Webhook d'inventaire** (automatique)
- `POST /api/inventory-webhook` - Reçoit les notifications du détecteur

### **API d'inventaire** (pour votre bot)
- `GET /api/user-inventory?action=inventory&telegramId=123` - Obtenir l'inventaire
- `GET /api/user-inventory?action=stats&telegramId=123` - Obtenir les statistiques
- `GET /api/user-inventory?action=search&telegramId=123&query=lol` - Rechercher

## 🔒 **Sécurité**

- **Signature HMAC-SHA256** pour les webhooks
- **Clés API** pour l'authentification
- **Row Level Security (RLS)** activé sur Supabase
- **Politiques d'accès** restrictives

## 🐛 **Dépannage**

### **Erreur "Signature invalide"**
- Vérifier que `WEBHOOK_SECRET` est identique dans le détecteur et l'API
- Vérifier que `INVENTORY_API_KEY` est correct

### **Erreur "Utilisateur non trouvé"**
- Vérifier que la base Supabase est bien configurée
- Vérifier les variables `SUPABASE_URL` et `SUPABASE_ANON_KEY`

### **Gift non ajouté à l'inventaire**
- Vérifier les logs du détecteur
- Vérifier les logs de l'API dans Vercel
- Vérifier que le webhook pointe vers `/inventory-webhook`

## 🎉 **Prochaines étapes**

1. **Créer le bot @testnftbuybot** avec gestion d'inventaire
2. **Implémenter l'interface** pour voir ses gifts
3. **Ajouter le bouton "Withdraw"** pour chaque gift
4. **Intégrer avec une marketplace** pour les prix

## 📞 **Support**

- **Logs détaillés** dans le terminal du détecteur
- **Logs Vercel** pour l'API
- **Dashboard Supabase** pour la base de données
- **Documentation complète** dans le README.md

---

**Votre système d'inventaire est maintenant prêt ! 🚀**

Testez avec un gift et vérifiez que tout fonctionne avant de passer à l'étape suivante.
