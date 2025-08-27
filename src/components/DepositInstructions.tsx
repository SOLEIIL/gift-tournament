import React, { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Check, ExternalLink, Gift, User, Clock } from 'lucide-react';
import { DepositConfig } from '../types/deposit';

interface DepositInstructionsProps {
  config: DepositConfig;
  onClose: () => void;
}

export const DepositInstructions: React.FC<DepositInstructionsProps> = ({
  config,
  onClose
}) => {
  const [copiedUsername, setCopiedUsername] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const openTelegram = () => {
    window.open(`https://t.me/${config.depositAccountUsername}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Déposer des Gifts</h2>
              <p className="text-sm text-muted-foreground">Instructions de transfert</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <span className="text-xl">×</span>
          </Button>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          {/* Étape 1 */}
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-2">Ouvrir Telegram</h3>
                <p className="text-sm text-muted-foreground">
                  Ouvrez l'application Telegram sur votre téléphone
                </p>
              </div>
            </div>
          </div>

          {/* Étape 2 */}
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-2">Contacter le compte de dépôt</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Nom d'utilisateur:</span>
                  </div>
                  <div className="flex items-center gap-2 bg-background rounded-lg p-2">
                    <span className="text-sm font-mono text-white">@{config.depositAccountUsername}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`@${config.depositAccountUsername}`)}
                      className="h-6 w-6 p-0"
                    >
                      {copiedUsername ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openTelegram}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir dans Telegram
                  </Button>
                </div>
              </div>
            </div>
          </div>

                     {/* Étape 3 */}
           <div className="bg-muted/20 rounded-lg p-4">
             <div className="flex items-start gap-3">
               <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                 <span className="text-white text-xs font-bold">3</span>
               </div>
               <div className="flex-1">
                                   <h3 className="font-medium text-white mb-2">Envoyer votre gift natif Telegram</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Envoyez un gift natif Telegram au compte de dépôt :
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-2">
                      <li>• 🎁 Gifts natifs Telegram (stickers, emojis)</li>
                      <li>• 💎 NFTs et tokens de valeur</li>
                      <li>• 🌟 Messages avec "5 TON" ou "gift 10"</li>
                      <li>• ✨ Objets virtuels de collection</li>
                    </ul>
                    <p className="text-xs text-amber-400 mt-2">
                      ⚠️ Seuls les gifts natifs Telegram sont acceptés (pas les stickers de chat)
                    </p>
                  </div>
               </div>
             </div>
           </div>

          {/* Étape 4 */}
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-2">Attendre la confirmation</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Le gift sera automatiquement ajouté à votre inventaire dans {config.confirmationDelay} secondes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations importantes */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <h4 className="font-medium text-amber-400 mb-2">⚠️ Informations importantes</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Seuls les gifts envoyés à ce compte seront acceptés</li>
            <li>• Valeur minimale: {config.minTransferValue} TON</li>
            <li>• Valeur maximale: {config.maxTransferValue} TON</li>
            <li>• Les transferts sont traités automatiquement</li>
            <li>• Vous recevrez une notification de confirmation</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Fermer
          </Button>
          <Button
            onClick={openTelegram}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir Telegram
          </Button>
        </div>
      </div>
    </div>
  );
};
