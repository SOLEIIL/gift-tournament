// test-database-sync.js
// Script de test pour vérifier la synchronisation avec la base de données

require('dotenv').config();
const DatabaseSyncService = require('./services/databaseSyncService.cjs');

async function testDatabaseSync() {
  try {
    console.log('🧪 Test de synchronisation avec la base de données...');
    
    // Initialiser le service
    const dbSync = new DatabaseSyncService();
    
    // Test de création d'utilisateur
    console.log('\n1️⃣ Test de création d\'utilisateur...');
    const testUser = await dbSync.getOrCreateUser({
      fromUserId: '123456789',
      fromUsername: 'testuser'
    });
    console.log('✅ Utilisateur créé/récupéré:', testUser);
    
    // Test de création de gift
    console.log('\n2️⃣ Test de création de gift...');
    const testGift = await dbSync.getOrCreateGift({
      giftName: 'Test Gift',
      collectibleId: 'TestGift-001',
      collectibleModel: 'Test Model (5‰)',
      collectibleBackdrop: 'Test Backdrop (10‰)',
      collectibleSymbol: 'Test Symbol (15‰)',
      giftValue: 25
    });
    console.log('✅ Gift créé/récupéré:', testGift);
    
    // Test d'ajout à l'inventaire
    console.log('\n3️⃣ Test d\'ajout à l\'inventaire...');
    const inventoryItem = await dbSync.addToInventory(
      testUser.id,
      testGift.id,
      'test_message_123',
      {
        giftName: 'Test Gift',
        collectibleId: 'TestGift-001'
      }
    );
    console.log('✅ Gift ajouté à l\'inventaire:', inventoryItem);
    
    // Test de récupération d'inventaire
    console.log('\n4️⃣ Test de récupération d\'inventaire...');
    const userInventory = await dbSync.getUserInventoryByTelegramId('123456789');
    console.log('✅ Inventaire récupéré:', userInventory);
    
    console.log('\n🎉 Tous les tests de synchronisation sont réussis !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Exécuter le test
testDatabaseSync();
