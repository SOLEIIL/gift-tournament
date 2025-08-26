
import { useState, useEffect } from 'react';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log('🚀 App.tsx - Démarrage...');
      setIsLoaded(true);
      console.log('✅ App.tsx - Chargé avec succès');
    } catch (err) {
      console.error('❌ Erreur dans App.tsx:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center">
        <div className="text-white text-center p-8">
          <h1 className="text-2xl font-bold mb-4">❌ Erreur de chargement</h1>
          <p className="text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            🔄 Recharger
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Chargement de l'app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-6">🎁 Gifts Casino</h1>
          <p className="text-xl mb-8">Tournoi de gifts Telegram</p>
          
          <div className="bg-slate-800 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">✅ App chargée avec succès !</h2>
            <p className="text-slate-300 mb-4">
              L'application fonctionne maintenant correctement.
            </p>
            
            <div className="space-y-4">
              <div className="bg-slate-700 rounded p-4">
                <h3 className="font-semibold mb-2">🎯 Prochaines étapes :</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Intégrer l'inventaire des gifts</li>
                  <li>• Connecter l'API Telegram</li>
                  <li>• Activer le système de tournois</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded p-4">
                <h3 className="font-semibold mb-2">🔧 Test API :</h3>
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/inventory-status');
                      const data = await response.json();
                      console.log('📊 API Response:', data);
                      alert('API fonctionne ! Voir la console pour les détails.');
                    } catch (err) {
                      console.error('❌ Erreur API:', err);
                      alert('Erreur API - voir la console');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                  🧪 Tester l'API
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
