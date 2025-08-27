@echo off
echo 🚀 DÉMARRAGE DE L'APPLICATION COMPLÈTE
echo ========================================
echo 🌐 Application web + 🎁 Détecteur de gifts
echo ========================================
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERREUR: Node.js n'est pas installé ou pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si npm est installé
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERREUR: npm n'est pas installé
    pause
    exit /b 1
)

echo ✅ Node.js et npm détectés
echo.

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de l'installation des dépendances
        pause
        exit /b 1
    )
    echo ✅ Dépendances installées
    echo.
)

REM Démarrer l'application complète
echo 🚀 Lancement de l'application...
npm run start:full

pause
