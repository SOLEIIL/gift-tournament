# Configuration du Bot Telegram

## Étapes pour configurer votre bot Telegram Mini App

### 1. Créer un bot avec @BotFather

1. Ouvrez Telegram et recherchez `@BotFather`
2. Envoyez `/newbot`
3. Suivez les instructions pour créer votre bot
4. Notez le token de votre bot

### 2. Configurer la Mini App

1. Envoyez `/newapp` à @BotFather
2. Sélectionnez votre bot
3. Donnez un nom à votre Mini App (ex: "Gifts Casino")
4. Ajoutez une description courte
5. Uploadez une photo pour l'icône (512x512px recommandé)
6. Notez l'URL de votre Mini App

### 3. Configurer l'URL de la Mini App

Une fois votre application déployée sur Vercel, vous devrez :

1. Retourner à @BotFather
2. Envoyer `/myapps`
3. Sélectionner votre Mini App
4. Choisir "Edit App"
5. Modifier l'URL pour pointer vers votre déploiement Vercel

### 4. Variables d'environnement

Créez un fichier `.env.local` dans votre projet :

```env
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_BOT_USERNAME=your_bot_username_here
```

### 5. Déploiement

1. Poussez votre code sur GitHub
2. Connectez votre repository à Vercel
3. Déployez l'application
4. Mettez à jour l'URL de votre Mini App dans @BotFather

### 6. Test de la Mini App

1. Ouvrez votre bot dans Telegram
2. Tapez `/start`
3. Cliquez sur le bouton "Start App" ou utilisez le menu
4. Votre Mini App devrait s'ouvrir dans Telegram

## Fonctionnalités intégrées

- ✅ Détection automatique de l'environnement Telegram
- ✅ Adaptation automatique aux thèmes Telegram (clair/sombre)
- ✅ Support des couleurs personnalisées du thème
- ✅ Haptic feedback pour les interactions
- ✅ Gestion des utilisateurs Telegram
- ✅ Compatible avec le développement local et la production

## Développement local

Pour tester localement :

1. Lancez `npm run dev`
2. Ouvrez http://localhost:3000
3. L'application fonctionnera en mode "mock" avec des données de test

## Production

Pour déployer en production :

1. `npm run build`
2. Déployez sur Vercel
3. Configurez l'URL dans @BotFather

## Notes importantes

- L'application s'adapte automatiquement à l'environnement Telegram
- Les couleurs suivent le thème de l'utilisateur Telegram
- Le haptic feedback fonctionne uniquement dans Telegram
- L'application peut fonctionner en mode standalone pour les tests
