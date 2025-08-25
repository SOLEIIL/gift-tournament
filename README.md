# Gift Tournament - Telegram Mini App Game

A clean, production-ready prototype for a Telegram Mini App game called "Gift Tournament" built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui components.

## 🎮 Game Overview

Gift Tournament is a competitive NFT-based tournament game where players deposit their NFT gifts into a pot and compete for the grand prize. The game features:

- **Lobby Phase**: Players connect wallets and deposit NFTs
- **Tournament Phase**: Animated elimination rounds with weighted random selection
- **Victory Screen**: Winner celebration with confetti animation

## ✨ Features

### Core Gameplay
- **Telegram Integration**: Automatic user detection and gift inventory loading
- **NFT Management**: Add gifts individually or use quick deposit for the cheapest available
- **Tournament Mechanics**: Weighted elimination based on NFT values
- **Real-time Updates**: Live countdown, elimination logs, and pot tracking

### UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Theme**: Modern dark interface with TON blockchain accent colors
- **Smooth Animations**: Circle shrinking, NFT elimination effects, confetti
- **Interactive Elements**: Modal dialogs, sorting, filtering, and real-time feedback

### Technical Features
- **TypeScript**: Full type safety and modern JavaScript features
- **Telegram API Integration**: Automatic user detection and gift inventory management
- **State Management**: Custom hooks with React state management
- **Seeded RNG**: Deterministic elimination for testing and fairness
- **Component Architecture**: Modular, reusable components

## 🚀 Production Deployment

### Live Application
- **Frontend:** https://gift-tournament.vercel.app
- **Backend:** https://gift-tournament-backend.railway.app
- **Bot Telegram:** @testnftbuybot

### Quick Start
```bash
# Clone and install
git clone <repository-url>
cd gift-tournament
npm install

# Start development
npm run dev
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Lobby.tsx       # Main lobby interface
│   ├── AddGiftsModal.tsx # NFT selection modal
│   ├── QuickDeposit.tsx  # One-click deposit
│   ├── Round.tsx       # Tournament gameplay
│   └── Victory.tsx     # Winner celebration
├── hooks/              # Custom React hooks
│   └── useTournamentState.ts # Main game state
├── types/              # TypeScript definitions
│   └── index.ts        # Game interfaces
├── utils/              # Utility functions
│   ├── telegramService.ts # Telegram integration
│   ├── mockData.ts     # Sample data
│   ├── rng.ts          # Seeded random number generator
│   └── weightedPick.ts # Weighted selection logic
├── lib/                # Library utilities
│   └── utils.ts        # Class name utilities
├── App.tsx             # Main application component
├── main.tsx            # React entry point
└── index.css           # Global styles and Tailwind
```

## 🎯 Game Mechanics

### Tournament Flow
1. **Lobby**: Players deposit NFTs (15-second countdown)
2. **Running**: Circle shrinks, NFTs eliminated randomly
3. **Finalized**: Winner determined, victory screen shown

### Elimination Algorithm
- **Weighted Selection**: Players with higher total NFT values have higher elimination probability
- **Random NFT Removal**: From selected player, one NFT is randomly eliminated
- **Progressive Delays**: Elimination timing increases as tournament progresses

### Win Probability
- **Calculation**: `(Player Total Value / Pot Total) × 100`
- **Real-time Updates**: Chances update after each deposit/elimination

## 🎨 Customization

### Colors and Themes
The game uses CSS custom properties for easy theming:
- Primary colors: TON blockchain blue (#0088CC)
- Rarity colors: Common (gray), Rare (blue), Epic (purple), Legendary (yellow)
- Dark theme with accent colors

### Animations
Custom CSS animations defined in `tailwind.config.js`:
- `shrink`: Circle shrinking effect
- `eliminate`: NFT elimination animation
- `confetti`: Victory celebration particles

## 🔧 Development

### Adding New Features
1. **New Components**: Create in `src/components/`
2. **State Logic**: Extend `useTournamentState` hook
3. **Types**: Add interfaces in `src/types/index.ts`
4. **Utilities**: Place helper functions in `src/utils/`

### Testing
- **Deterministic RNG**: Use seeded random for consistent test results
- **State Management**: Test state transitions between game phases
- **Component Props**: Verify component interfaces and prop types

### Performance
- **Memoization**: Use `useMemo` and `useCallback` for expensive calculations
- **Lazy Loading**: Consider code splitting for larger components
- **Animation Optimization**: Use CSS transforms for smooth 60fps animations

## 🤖 Telegram Integration

### Bot Setup
1. **Create a Telegram Bot**
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Use `/newbot` command to create a new bot
   - Save the bot token provided

2. **Configure Environment Variables**
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Add your bot token
   VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```

3. **Bot API Endpoints**
   The application expects these custom bot endpoints:
   - `getUserGifts`: Retrieve user's gift inventory
   - `sendGift`: Transfer gift between users
   - `canTransferGift`: Check if gift can be transferred

### User Detection
- **Automatic Detection**: User ID and profile automatically detected via Telegram WebApp
- **Fallback Mode**: Uses mock data when not running in Telegram environment
- **Real-time Updates**: Gift inventory refreshes automatically

### Gift Management
- **Inventory Loading**: Automatically loads user's gifts on app initialization
- **Transfer System**: Send gifts to other users via Telegram
- **Ownership Validation**: Verifies gift ownership before transfers

## 🚀 Deployment

### Build Optimization
```bash
npm run build
```

The build process:
- Minifies JavaScript and CSS
- Optimizes assets and images
- Generates static files in `dist/` directory

### Hosting
- **Static Hosting**: Deploy `dist/` folder to any static host
- **CDN**: Use Cloudflare, AWS CloudFront, or similar
- **Telegram Mini App**: Deploy to Telegram's Mini App platform

### Production Deployment
```bash
# Deploy backend to Railway
npm run deploy:backend

# Deploy frontend to Vercel
npm run deploy:frontend
```

## 🔮 Future Enhancements

### Blockchain Integration
- **TON Wallet**: Real wallet connection and transaction signing
- **Smart Contracts**: On-chain tournament execution
- **NFT Verification**: Blockchain-based NFT ownership validation

### Advanced Features
- **Tournament Types**: Different elimination modes and rules
- **Social Features**: Player profiles, leaderboards, chat
- **Rewards System**: Token rewards, achievements, and progression

### Performance Improvements
- **WebGL Animations**: Hardware-accelerated graphics
- **Real-time Updates**: WebSocket integration for live multiplayer
- **Offline Support**: Service worker for offline gameplay

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or support:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Happy Gaming! 🎁🏆**
