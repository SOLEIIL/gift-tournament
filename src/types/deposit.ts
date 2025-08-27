export interface DepositTransfer {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toDepositAccount: string;
  giftId: string;
  giftName: string;
  giftValue: number;
  giftType: 'sticker' | 'gif' | 'document' | 'emoji' | 'text' | 'unknown';
  mediaType: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed' | 'processed';
  transactionHash?: string;
  telegramMessageId?: string;
  messageText?: string;
}

export interface DepositAccount {
  id: string;
  username: string;
  phoneNumber: string;
  isActive: boolean;
  lastActivity: Date;
  totalDeposits: number;
  totalValue: number;
}

export interface UserInventory {
  userId: string;
  username: string;
  gifts: GiftItem[];
  totalValue: number;
  lastUpdated: Date;
}

export interface GiftItem {
  id: string;
  name: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  depositDate: Date;
  transferId: string;
  isActive: boolean;
}

export interface DepositWebhook {
  type: 'transfer_received' | 'transfer_confirmed' | 'transfer_failed';
  data: DepositTransfer;
  signature: string;
  timestamp: number;
}

export interface DepositConfig {
  depositAccountUsername: string;
  depositAccountPhone: string;
  webhookUrl: string;
  apiKey: string;
  minTransferValue: number;
  maxTransferValue: number;
  autoConfirm: boolean;
  confirmationDelay: number; // en secondes
}
