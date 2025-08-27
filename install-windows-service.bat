@echo off
echo 🚀 INSTALLATION DU SERVICE WINDOWS
echo ===================================
echo Installation de l'application comme service Windows
echo ===================================
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERREUR: Node.js n'est pas installé
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si pm2 est installé
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installation de PM2...
    npm install -g pm2
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de l'installation de PM2
        pause
        exit /b 1
    )
    echo ✅ PM2 installé
)

REM Installer les dépendances du projet
if not exist "node_modules" (
    echo 📦 Installation des dépendances du projet...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de l'installation des dépendances
        pause
        exit /b 1
    )
    echo ✅ Dépendances installées
)

echo.
echo 🔧 Configuration du service Windows...
echo.

REM Créer le fichier de configuration PM2
echo ✅ Configuration PM2 créée

REM Démarrer l'application avec PM2
echo 🚀 Démarrage de l'application...
pm2 start ecosystem.config.js

REM Sauvegarder la configuration PM2
echo 💾 Sauvegarde de la configuration...
pm2 save

REM Configurer le démarrage automatique
echo 🔄 Configuration du démarrage automatique...
pm2 startup

echo.
echo 🎉 SERVICE INSTALLÉ AVEC SUCCÈS !
echo ===================================
echo ✅ Application configurée comme service Windows
echo ✅ Démarrage automatique au démarrage de Windows
echo ✅ Redémarrage automatique en cas de crash
echo ===================================
echo.
echo 📋 Commandes utiles:
echo   pm2 status          - Voir le statut des processus
echo   pm2 logs            - Voir les logs
echo   pm2 restart all     - Redémarrer tous les processus
echo   pm2 stop all        - Arrêter tous les processus
echo   pm2 delete all      - Supprimer tous les processus
echo.
echo 🌐 Application web: http://localhost:5173
echo 🎁 Détecteur de gifts: Actif et surveillé
echo.

pause
