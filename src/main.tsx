import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

console.log('🚀 main.tsx - Démarrage...');

try {
  const rootElement = document.getElementById('root');
  console.log('🔍 Root element trouvé:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element non trouvé');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ Root créé avec succès');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('✅ App rendue avec succès');
  
} catch (error) {
  console.error('❌ Erreur dans main.tsx:', error);
  
  // Fallback en cas d'erreur
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      background-color: #1a1a1a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
    ">
      <div>
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">🎁 Gifts Casino</h1>
        <p style="margin-bottom: 1rem;">Erreur de chargement React</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">Voir la console pour les détails</p>
        <button 
          onclick="window.location.reload()" 
          style="
            margin-top: 1rem;
            padding: 10px 20px;
            background-color: #0088CC;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          "
        >
          🔄 Recharger
        </button>
      </div>
    </div>
  `;
}
