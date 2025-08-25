import { DepositConfig } from '../types/deposit';

// Configuration du compte de dépôt @WxyzCrypto pour les tests
export const DEPOSIT_CONFIG: DepositConfig = {
  depositAccountUsername: 'WxyzCrypto',
  depositAccountPhone: '+1234567890', // À remplacer par le vrai numéro si nécessaire
  webhookUrl: 'https://your-domain.com/api/deposit-webhook',
  apiKey: 'your-secret-api-key',
  minTransferValue: 1,
  maxTransferValue: 10000,
  autoConfirm: true,
  confirmationDelay: 30
};

// Configuration pour différents environnements
export const getDepositConfig = (): DepositConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...DEPOSIT_CONFIG,
        depositAccountUsername: 'WxyzCrypto', // Compte de production
        webhookUrl: process.env.DEPOSIT_WEBHOOK_URL || DEPOSIT_CONFIG.webhookUrl,
        apiKey: process.env.DEPOSIT_API_KEY || DEPOSIT_CONFIG.apiKey,
      };
    
    case 'staging':
      return {
        ...DEPOSIT_CONFIG,
        depositAccountUsername: 'WxyzCrypto', // Compte de staging
        webhookUrl: process.env.STAGING_WEBHOOK_URL || DEPOSIT_CONFIG.webhookUrl,
        apiKey: process.env.STAGING_API_KEY || DEPOSIT_CONFIG.apiKey,
      };
    
    default: // development
      return {
        ...DEPOSIT_CONFIG,
        depositAccountUsername: 'WxyzCrypto', // Compte de test
        webhookUrl: 'http://localhost:3001/api/deposit-webhook',
        apiKey: 'dev-secret-key',
      };
  }
};
