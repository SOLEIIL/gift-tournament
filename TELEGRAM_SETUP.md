# 🚀 Configuration Telegram Mini App - Gifts Casino

## 📋 Prérequis

- Un compte Telegram
- Un repository GitHub avec votre code
- Un compte Vercel (gratuit)

## 🔧 Étapes de Configuration

### 1. Créer le Bot Telegram

1. **Ouvrez Telegram** et recherchez `@BotFather`
2. **Envoyez** `/newbot`
3. **Donnez un nom** à votre bot (ex: "Gifts Casino Bot")
4. **Choisissez un username** (ex: "gifts_casino_bot")
5. **Notez le token** fourni par BotFather

### 2. Configurer la Mini App

1. **Envoyez** `/newapp` à @BotFather
2. **Sélectionnez** votre bot créé
3. **Nom de l'app** : "Gifts Casino"
4. **Description** : "Play exciting gift tournaments with TON rewards"
5. **Uploadez une icône** (512x512px recommandé)
6. **Notez l'URL** temporaire fournie

### 3. Déployer sur Vercel

1. **Poussez votre code** sur GitHub
2. **Allez sur** [vercel.com](https://vercel.com)
3. **Connectez** votre repository GitHub
4. **Configurez le projet** :
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Déployez** l'application

### 4. Configurer l'URL de la Mini App

1. **Retournez** à @BotFather
2. **Envoyez** `/myapps`
3. **Sélectionnez** votre Mini App
4. **Choisissez** "Edit App"
5. **Modifiez l'URL** pour pointer vers votre déploiement Vercel :
   ```
   https://votre-app.vercel.app
   ```

### 5. Variables d'Environnement (Optionnel)

Créez un fichier `.env.local` dans votre projet :

```env
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_BOT_USERNAME=your_bot_username_here
```

## 🧪 Test de la Mini App

### Test Local
```bash
npm run dev
# Ouvrez http://localhost:3000
```

### Test dans Telegram
1. **Ouvrez** votre bot dans Telegram
2. **Tapez** `/start`
3. **Cliquez** sur "Start App" ou utilisez le menu
4. **Vérifiez** que l'app s'ouvre correctement

## 🎨 Fonctionnalités Intégrées

### ✅ Détection Automatique
- L'app détecte automatiquement si elle tourne dans Telegram
- Mode "mock" pour le développement local
- Adaptation automatique aux thèmes Telegram

### ✅ Interface Utilisateur
- Affichage des informations utilisateur Telegram
- Adaptation aux couleurs du thème (clair/sombre)
- Support du haptic feedback
- Interface responsive pour mobile

### ✅ Intégration Complète
- Gestion des utilisateurs Telegram
- Support des thèmes personnalisés
- Compatible avec tous les appareils

## 🔒 Sécurité

### Headers de Sécurité
L'application inclut les headers nécessaires :
- `X-Frame-Options: ALLOWALL`
- `Content-Security-Policy: frame-ancestors 'self' https://web.telegram.org https://t.me`

### Validation des Données
- Validation des données utilisateur Telegram
- Protection contre les injections
- Gestion sécurisée des tokens

## 📱 Optimisations Mobile

### Performance
- Chargement rapide (< 3 secondes)
- Interface fluide et responsive
- Optimisation pour les connexions lentes

### UX Mobile
- Boutons de taille appropriée
- Navigation tactile intuitive
- Feedback visuel et haptique

## 🚨 Dépannage

### Problèmes Courants

**L'app ne s'ouvre pas dans Telegram**
- Vérifiez que l'URL est correcte dans @BotFather
- Assurez-vous que le déploiement Vercel est actif
- Vérifiez les logs Vercel pour les erreurs

**Les couleurs ne s'adaptent pas**
- Vérifiez que le script Telegram est chargé
- Assurez-vous que les variables CSS sont définies
- Testez avec différents thèmes Telegram

**Le haptic feedback ne fonctionne pas**
- Fonctionne uniquement dans Telegram
- Vérifiez que l'app tourne dans l'environnement Telegram
- Testez sur un appareil physique

### Logs de Débogage

Ajoutez dans la console du navigateur :
```javascript
console.log('Telegram WebApp:', window.Telegram?.WebApp);
console.log('User:', window.Telegram?.WebApp?.initDataUnsafe?.user);
console.log('Theme:', window.Telegram?.WebApp?.themeParams);
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs Vercel
2. Testez en mode développement local
3. Consultez la documentation Telegram Web App
4. Vérifiez la configuration @BotFather

## 🎯 Prochaines Étapes

Une fois la Mini App configurée, vous pouvez :
- Ajouter des fonctionnalités de paiement
- Intégrer des notifications push
- Ajouter des statistiques utilisateur
- Implémenter des tournois en temps réel
