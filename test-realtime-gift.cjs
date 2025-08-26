const { spawn } = require('child_process');
const readline = require('readline');

console.log('🎁 TEST EN TEMPS RÉEL - DÉTECTION DE GIFTS TELEGRAM');
console.log('==================================================');
console.log('');

// Démarrer le détecteur de gifts
console.log('🚀 Démarrage du détecteur de gifts...');
const giftDetector = spawn('node', ['start-gift-detector.cjs'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Créer une interface de lecture pour les logs
const rl = readline.createInterface({
  input: giftDetector.stdout,
  terminal: false
});

// Surveiller les logs en temps réel
rl.on('line', (line) => {
  const logLine = line.toString();
  
  // Filtrer et afficher les informations importantes
  if (logLine.includes('🎁 VRAI GIFT TELEGRAM DÉTECTÉ')) {
    console.log('\n🎉🎉🎉 GIFT DÉTECTÉ EN TEMPS RÉEL ! 🎉🎉🎉');
    console.log('⏰ ' + new Date().toLocaleTimeString());
    console.log(logLine);
  }
  
  if (logLine.includes('📋 Informations du transfert:')) {
    console.log('\n📊 DÉTAILS DU GIFT DÉTECTÉ :');
  }
  
  if (logLine.includes('✅ Gift traité avec succès')) {
    console.log('✅ GIFT TRAITÉ AVEC SUCCÈS !');
  }
  
  if (logLine.includes('❌ Erreur lors de l\'envoi du webhook')) {
    console.log('⚠️  ERREUR WEBHOOK (à corriger plus tard)');
  }
  
  if (logLine.includes('💚 Service en cours d\'exécution')) {
    process.stdout.write('💚'); // Indicateur de survie
  }
});

// Gérer les erreurs
giftDetector.stderr.on('data', (data) => {
  const errorLine = data.toString();
  if (errorLine.includes('Error') || errorLine.includes('error')) {
    console.log('\n❌ ERREUR DÉTECTÉE :', errorLine.trim());
  }
});

// Gérer la fermeture
giftDetector.on('close', (code) => {
  console.log(`\n🔴 Détecteur fermé avec le code: ${code}`);
});

// Instructions pour l'utilisateur
console.log('📱 INSTRUCTIONS POUR TESTER :');
console.log('1. Ouvrez Telegram sur votre téléphone');
console.log('2. Contactez @WxyzCrypto');
console.log('3. Envoyez un VRAI gift Telegram (25+ stars)');
console.log('4. Regardez les logs ci-dessous en temps réel');
console.log('');
console.log('🎯 Le système détectera automatiquement votre gift !');
console.log('==================================================');
console.log('');

// Attendre que le détecteur soit prêt
setTimeout(() => {
  console.log('⏳ Attente de la détection de gifts...');
  console.log('💡 Envoyez un gift depuis Telegram maintenant !');
  console.log('');
}, 3000);

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du test en temps réel...');
  giftDetector.kill();
  process.exit();
});

