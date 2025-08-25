# Gift Tournament - Demo Guide

## 🎮 Quick Start Demo

### 1. Launch the Game
```bash
npm run dev
```
Open your browser to `http://localhost:3000`

### 2. Demo Features

#### Initial State
- **Pre-loaded Players**: Alice and Bob already have some NFTs deposited
- **Total Pot**: 72 TON (Alice: 17 TON, Bob: 55 TON)
- **Win Chances**: Alice (23.6%), Bob (76.4%)

#### Game Flow Demo

1. **Lobby Phase**
   - View current deposits and player stats
   - Use "Quick Deposit" to add the cheapest available NFT
   - Click "+ Add Gifts" to open the selection modal
   - Filter by rarity (Common, Rare, Epic, Legendary)
   - Sort by price (ascending/descending)

2. **Start Tournament**
   - Click "Start Tournament" button
   - Watch the 15-second countdown
   - Game automatically transitions to tournament phase

3. **Tournament Phase**
   - Circle arena shows all NFTs positioned around the center
   - Watch elimination animations and logs
   - NFTs are eliminated based on weighted random selection
   - Higher value players have higher elimination probability

4. **Victory Screen**
   - Winner is crowned with confetti animation
   - View all prizes won
   - Click "Play Again" to reset the game

### 3. Testing Scenarios

#### Test Quick Deposit
- Click "Quick Deposit" multiple times
- Watch it always suggest the cheapest available NFT
- Verify deposits are added to your wallet

#### Test NFT Selection
- Open "Add Gifts" modal
- Filter by different rarities
- Sort by price in both directions
- Select multiple NFTs and confirm deposit

#### Test Tournament Logic
- Start with different NFT combinations
- Observe elimination patterns
- Check that win probabilities update correctly
- Verify the last player standing wins

### 4. Technical Features

#### State Management
- **useTournamentState**: Custom hook managing game state
- **Phase Transitions**: LOBBY → RUNNING → FINALIZED
- **Real-time Updates**: Live countdown, elimination logs

#### Animation System
- **Circle Shrinking**: CSS transform animations
- **NFT Elimination**: Fade + scale effects
- **Confetti**: Victory celebration particles

#### Random Number Generation
- **Seeded RNG**: Deterministic for testing
- **Weighted Selection**: Based on NFT values
- **Fair Elimination**: Higher stakes = higher risk

### 5. Customization

#### Colors and Themes
- TON blockchain blue (#0088CC)
- Rarity-based color coding
- Dark theme with accent colors

#### Game Settings
- Countdown duration: 15 seconds
- Phase delays: 2-4 seconds
- Elimination timing: Progressive delays

### 6. Performance Notes

- **Responsive Design**: Mobile-first approach
- **CSS Animations**: Hardware-accelerated transforms
- **State Optimization**: Memoized calculations
- **Bundle Size**: ~192KB gzipped

## 🚀 Next Steps

### Blockchain Integration
- Replace mock wallet with TON wallet
- Add real NFT verification
- Implement smart contract calls

### Advanced Features
- Multiplayer support
- Tournament types
- Social features
- Leaderboards

### Production Deployment
- Build optimization
- CDN deployment
- Telegram Mini App integration

---

**Enjoy the demo! 🎁🏆**
