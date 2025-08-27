# start-app.ps1
# Script PowerShell pour démarrer l'application complète

param(
    [switch]$WebOnly,
    [switch]$GiftsOnly,
    [switch]$Full
)

# Configuration des couleurs
$Host.UI.RawUI.ForegroundColor = "White"

Write-Host "🚀 DÉMARRAGE DE L'APPLICATION COMPLÈTE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🌐 Application web + 🎁 Détecteur de gifts" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js non trouvé"
    }
} catch {
    Write-Host "❌ ERREUR: Node.js n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Node.js depuis https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

# Vérifier si npm est installé
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ npm détecté: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm non trouvé"
    }
} catch {
    Write-Host "❌ ERREUR: npm n'est pas installé" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

Write-Host ""

# Installer les dépendances si nécessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour continuer"
        exit 1
    }
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
    Write-Host ""
}

# Démarrer l'application selon les paramètres
if ($WebOnly) {
    Write-Host "🌐 Démarrage de l'application web uniquement..." -ForegroundColor Blue
    npm run start:web
} elseif ($GiftsOnly) {
    Write-Host "🎁 Démarrage du système de gifts uniquement..." -ForegroundColor Blue
    npm run start:gifts
} elseif ($Full) {
    Write-Host "🚀 Démarrage de l'application complète..." -ForegroundColor Blue
    npm run start:full
} else {
    # Mode interactif
    Write-Host "Choisissez le mode de démarrage:" -ForegroundColor Cyan
    Write-Host "1. Application web uniquement" -ForegroundColor White
    Write-Host "2. Système de gifts uniquement" -ForegroundColor White
    Write-Host "3. Application complète (recommandé)" -ForegroundColor Green
    Write-Host ""
    
    do {
        $choice = Read-Host "Votre choix (1-3)"
    } while ($choice -notmatch "^[1-3]$")
    
    switch ($choice) {
        "1" { 
            Write-Host "🌐 Démarrage de l'application web..." -ForegroundColor Blue
            npm run start:web
        }
        "2" { 
            Write-Host "🎁 Démarrage du système de gifts..." -ForegroundColor Blue
            npm run start:gifts
        }
        "3" { 
            Write-Host "🚀 Démarrage de l'application complète..." -ForegroundColor Blue
            npm run start:full
        }
    }
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
