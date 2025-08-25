import { useState, useEffect, useCallback } from 'react';
import { useTelegram } from './useTelegram';
import DepositService from '../services/depositService';
import { 
  DepositConfig, 
  DepositTransfer, 
  UserInventory, 
  DepositAccount 
} from '../types/deposit';

// Configuration du compte de dépôt @WxyzCrypto
const DEFAULT_DEPOSIT_CONFIG: DepositConfig = {
  depositAccountUsername: 'WxyzCrypto',
  depositAccountPhone: '+1234567890', // À remplacer par votre vrai numéro
  webhookUrl: 'https://gift-tournament-git-main-soleiils-projects.vercel.app/api/deposit-webhook',
  apiKey: process.env.REACT_APP_DEPOSIT_API_KEY || 'wxyz-crypto-secure-key-2024',
  minTransferValue: 1,
  maxTransferValue: 10000,
  autoConfirm: true,
  confirmationDelay: 30
};

export const useDeposit = () => {
  const { user, isTelegram } = useTelegram();
  const [depositService, setDepositService] = useState<DepositService | null>(null);
  const [userInventory, setUserInventory] = useState<UserInventory | null>(null);
  const [depositAccount, setDepositAccount] = useState<DepositAccount | null>(null);
  const [pendingTransfers, setPendingTransfers] = useState<DepositTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialiser le service de dépôt
  const initializeDepositService = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const service = new DepositService(DEFAULT_DEPOSIT_CONFIG);
      await service.initialize();
      
      setDepositService(service);
      
      // Charger les données initiales
      if (user?.id) {
        await loadUserInventory(user.id);
        await loadDepositAccountStats();
      }
      
      console.log('✅ Service de dépôt initialisé');
    } catch (err) {
      console.error('❌ Erreur lors de l\'initialisation du service de dépôt:', err);
      setError('Impossible d\'initialiser le service de dépôt');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Charger l'inventaire de l'utilisateur
  const loadUserInventory = useCallback(async (userId: string) => {
    if (!depositService) return;

    try {
      const inventory = await depositService.getUserInventory(userId);
      setUserInventory(inventory);
    } catch (err) {
      console.error('❌ Erreur lors du chargement de l\'inventaire:', err);
      setError('Impossible de charger l\'inventaire');
    }
  }, [depositService]);

  // Charger les statistiques du compte de dépôt
  const loadDepositAccountStats = useCallback(async () => {
    if (!depositService) return;

    try {
      const stats = await depositService.getDepositAccountStats();
      setDepositAccount(stats);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des stats du compte:', err);
    }
  }, [depositService]);

  // Traiter un webhook de dépôt
  const processDepositWebhook = useCallback(async (webhookData: any) => {
    if (!depositService) return;

    try {
      await depositService.processWebhook(webhookData);
      
      // Recharger l'inventaire si l'utilisateur est concerné
      if (user?.id && webhookData.data?.fromUserId === user.id) {
        await loadUserInventory(user.id);
      }
    } catch (err) {
      console.error('❌ Erreur lors du traitement du webhook:', err);
    }
  }, [depositService, user?.id, loadUserInventory]);

  // Vérifier les transferts en attente
  const checkPendingTransfers = useCallback(async () => {
    if (!depositService || !user?.id) return;

    try {
      const history = await depositService.getUserTransferHistory(user.id);
      const pending = history.filter(transfer => transfer.status === 'pending');
      setPendingTransfers(pending);
    } catch (err) {
      console.error('❌ Erreur lors de la vérification des transferts:', err);
    }
  }, [depositService, user?.id]);

  // Rafraîchir les données
  const refreshData = useCallback(async () => {
    if (!user?.id) return;

    await Promise.all([
      loadUserInventory(user.id),
      loadDepositAccountStats(),
      checkPendingTransfers()
    ]);
  }, [user?.id, loadUserInventory, loadDepositAccountStats, checkPendingTransfers]);

  // Initialiser le service au montage du composant
  useEffect(() => {
    if (isTelegram && user?.id) {
      initializeDepositService();
    }
  }, [isTelegram, user?.id, initializeDepositService]);

  // Vérifier périodiquement les transferts en attente
  useEffect(() => {
    if (!depositService || !user?.id) return;

    const interval = setInterval(checkPendingTransfers, 10000); // Vérifier toutes les 10 secondes

    return () => clearInterval(interval);
  }, [depositService, user?.id, checkPendingTransfers]);

  return {
    // État
    userInventory,
    depositAccount,
    pendingTransfers,
    isLoading,
    error,
    config: DEFAULT_DEPOSIT_CONFIG,
    
    // Actions
    refreshData,
    processDepositWebhook,
    checkPendingTransfers,
    
    // Utilitaires
    hasPendingTransfers: pendingTransfers.length > 0,
    totalInventoryValue: userInventory?.totalValue || 0,
    totalInventoryGifts: userInventory?.gifts.length || 0
  };
};
