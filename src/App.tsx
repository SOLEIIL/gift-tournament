
import React from 'react';

function App() {
  console.log('🚀 App.tsx - Démarrage...');
  
  React.useEffect(() => {
    console.log('✅ App.tsx - useEffect exécuté');
  }, []);

  console.log('🔄 App.tsx - Rendu...');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁 Gifts Casino</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
        Tournoi de gifts Telegram
      </p>
      
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '2rem',
        borderRadius: '10px',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅ App chargée !</h2>
        <p style={{ marginBottom: '1rem' }}>
          L'application fonctionne maintenant correctement.
        </p>
        
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>🎯 Prochaines étapes :</h3>
          <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
            <li>• Intégrer l'inventaire des gifts</li>
            <li>• Connecter l'API Telegram</li>
            <li>• Activer le système de tournois</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>🔧 Test API :</h3>
          <button 
            onClick={async () => {
              try {
                console.log('🧪 Test API en cours...');
                const response = await fetch('/api/inventory-status');
                const data = await response.json();
                console.log('📊 API Response:', data);
                alert('API fonctionne ! Voir la console pour les détails.');
              } catch (err) {
                console.error('❌ Erreur API:', err);
                alert('Erreur API - voir la console');
              }
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0088CC',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#00A3E6'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0088CC'}
          >
            🧪 Tester l'API
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
        <p>Version de test - Diagnostic page blanche</p>
        <p>Console ouverte pour debug</p>
      </div>
    </div>
  );
}

export default App;
