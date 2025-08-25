# 🧪 Guide de Test - Système de Dépôt @WxyzCrypto

## 🎯 Objectif

Ce guide vous aide à tester le système de dépôt de gifts en utilisant le compte `@WxyzCrypto` comme compte de dépôt.

## 📋 Prérequis

1. **Compte Telegram** : Votre compte personnel pour envoyer les gifts
2. **Compte de dépôt** : `@WxyzCrypto` (déjà configuré)
3. **Mini App** : Votre application déployée sur Vercel
4. **Gifts de test** : Quelques gifts de faible valeur pour les tests

## 🚀 Étapes de Test

### Étape 1 : Accéder à l'Inventaire

1. **Ouvrir votre Mini App** dans Telegram
2. **Naviguer vers l'onglet "Inventory"**
3. **Vérifier** que le bouton "Déposer des Gifts" est visible

### Étape 2 : Ouvrir les Instructions de Dépôt

1. **Cliquer sur "Déposer des Gifts"**
2. **Vérifier** que la modal s'ouvre avec :
   - Le nom d'utilisateur `@WxyzCrypto`
   - Les 4 étapes d'instructions
   - Le bouton "Ouvrir dans Telegram"

### Étape 3 : Tester la Copie du Nom d'Utilisateur

1. **Cliquer sur l'icône de copie** à côté de `@WxyzCrypto`
2. **Vérifier** que l'icône change en coche verte
3. **Coller** dans un message pour vérifier que c'est bien copié

### Étape 4 : Ouvrir Telegram

1. **Cliquer sur "Ouvrir dans Telegram"**
2. **Vérifier** que Telegram s'ouvre sur le chat avec `@WxyzCrypto`
3. **Confirmer** que vous pouvez voir le profil du compte

### Étape 5 : Envoyer un Gift de Test

1. **Dans Telegram**, envoyer un gift à `@WxyzCrypto`
2. **Attendre** la confirmation automatique (30 secondes)
3. **Vérifier** que le gift apparaît dans votre inventaire

## 🔍 Points de Vérification

### Interface Utilisateur

- [ ] Le bouton "Déposer des Gifts" est visible
- [ ] La modal s'ouvre correctement
- [ ] Le nom `@WxyzCrypto` est affiché
- [ ] La copie fonctionne
- [ ] Le lien Telegram fonctionne

### Fonctionnalités

- [ ] Les instructions sont claires
- [ ] Les valeurs min/max sont affichées
- [ ] Le délai de confirmation est indiqué
- [ ] Les informations de sécurité sont présentes

### Intégration

- [ ] Le hook `useDeposit` se charge
- [ ] La configuration est correcte
- [ ] Les états de chargement fonctionnent
- [ ] Les erreurs sont gérées

## 🐛 Dépannage

### Problème : Le bouton ne s'affiche pas

**Solution :**
```javascript
// Vérifier que le hook est bien importé
import { useDeposit } from '../hooks/useDeposit';

// Vérifier que la configuration est chargée
const { config, isLoading } = useDeposit();
```

### Problème : La modal ne s'ouvre pas

**Solution :**
```javascript
// Vérifier l'état du modal
const [showDepositInstructions, setShowDepositInstructions] = useState(false);

// Vérifier que le composant est bien importé
import { DepositInstructions } from './DepositInstructions';
```

### Problème : Erreur de configuration

**Solution :**
```javascript
// Vérifier le fichier de configuration
// src/config/deposit.ts
export const DEPOSIT_CONFIG: DepositConfig = {
  depositAccountUsername: 'WxyzCrypto', // ✅ Correct
  // ...
};
```

## 📱 Test sur Mobile

### Test sur Android

1. **Ouvrir Telegram** sur votre téléphone Android
2. **Accéder à votre Mini App**
3. **Tester** toutes les fonctionnalités
4. **Vérifier** que les liens s'ouvrent correctement

### Test sur iOS

1. **Ouvrir Telegram** sur votre iPhone
2. **Accéder à votre Mini App**
3. **Tester** toutes les fonctionnalités
4. **Vérifier** que les liens s'ouvrent correctement

## 🔒 Test de Sécurité

### Test de Validation

1. **Essayer d'envoyer** un gift de 0 TON (doit être rejeté)
2. **Essayer d'envoyer** un gift de 15000 TON (doit être rejeté)
3. **Vérifier** que seuls les gifts valides sont acceptés

### Test de Doublons

1. **Envoyer le même gift** deux fois rapidement
2. **Vérifier** que le système détecte les doublons
3. **Confirmer** que seul le premier transfert est traité

## 📊 Métriques de Test

### Temps de Réponse

- **Ouverture de la modal** : < 500ms
- **Copie du nom d'utilisateur** : < 200ms
- **Ouverture de Telegram** : < 1000ms

### Utilisabilité

- **Nombre de clics** pour déposer : ≤ 3
- **Temps de lecture** des instructions : < 30 secondes
- **Taux de réussite** : > 95%

## 🎯 Scénarios de Test

### Scénario 1 : Utilisateur Nouveau

1. **Première visite** de l'inventaire
2. **Découverte** du bouton de dépôt
3. **Suivi** des instructions
4. **Premier dépôt** réussi

### Scénario 2 : Utilisateur Expérimenté

1. **Accès rapide** aux instructions
2. **Dépôt multiple** de gifts
3. **Vérification** de l'inventaire
4. **Utilisation** des fonctionnalités avancées

### Scénario 3 : Gestion d'Erreur

1. **Tentative de dépôt** invalide
2. **Affichage** du message d'erreur
3. **Correction** et nouvelle tentative
4. **Succès** du dépôt

## 📝 Rapport de Test

### Template de Rapport

```markdown
# Rapport de Test - [Date]

## ✅ Tests Réussis
- [ ] Interface utilisateur
- [ ] Fonctionnalités de base
- [ ] Intégration Telegram
- [ ] Gestion des erreurs

## ❌ Problèmes Détectés
- [ ] Description du problème
- [ ] Étapes pour reproduire
- [ ] Impact sur l'utilisateur

## 🔧 Améliorations Suggérées
- [ ] Suggestion 1
- [ ] Suggestion 2
- [ ] Suggestion 3

## 📊 Métriques
- Temps de réponse moyen : X ms
- Taux de réussite : X%
- Nombre d'erreurs : X

## 🎯 Conclusion
Résumé des tests et recommandations
```

## 🚀 Prochaines Étapes

1. **Tester** tous les scénarios ci-dessus
2. **Documenter** les problèmes trouvés
3. **Implémenter** les corrections nécessaires
4. **Retester** après les corrections
5. **Déployer** en production

---

**💡 Conseil** : Testez d'abord avec des gifts de faible valeur avant de passer aux tests avec des valeurs plus importantes !
