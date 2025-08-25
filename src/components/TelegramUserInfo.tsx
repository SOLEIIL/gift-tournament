import { TelegramUser } from '../types/telegram';

interface TelegramUserInfoProps {
  user: TelegramUser | null;
  isTelegram: boolean;
}

export const TelegramUserInfo: React.FC<TelegramUserInfoProps> = ({ user, isTelegram }) => {
  if (!isTelegram || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg backdrop-blur-sm">
      {user.photo_url && (
        <img 
          src={user.photo_url} 
          alt={user.first_name}
          className="w-10 h-10 rounded-full border-2 border-white/20"
        />
      )}
      <div className="flex-1">
        <div className="text-white font-semibold">
          {user.first_name} {user.last_name}
        </div>
        {user.username && (
          <div className="text-white/70 text-sm">
            @{user.username}
          </div>
        )}
        {user.is_premium && (
          <div className="text-yellow-400 text-xs flex items-center gap-1">
            <span>⭐</span>
            <span>Premium</span>
          </div>
        )}
      </div>
      <div className="text-white/50 text-xs">
        Telegram
      </div>
    </div>
  );
};
