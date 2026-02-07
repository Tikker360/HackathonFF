# Fantasy Football Stock Market - Static MVP Build Plan

## Overview
This plan breaks down the static version build by user story. Each section shows what pages, components, and features we'll create to satisfy that story - without any real functionality yet.

---

## Initial Setup & Foundation

### Project Creation
```bash
npx create-next-app@latest fantasy-football-stocks
```
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- src/ directory: No
- App Router: Yes
- Import alias: No

### Base Layout Components
Before tackling user stories, we'll create the foundation:

1. **Navigation Bar** (`app/components/Navigation.js`)
   - Logo/App Name
   - Links: Market, Portfolio, Leaderboard
   - User info (team name, cash balance)

2. **Layout Wrapper** (`app/layout.js`)
   - Applies to all pages
   - Shows navigation and header on every page

---

## User Story 1: Create Account & Join League

**"As a player, I want to create an account and join the league so that I can start trading with my friends"**

### What We'll Build:

#### 1A. Login Page (`app/login/page.tsx`)
```
┌─────────────────────────────────┐
│      FF Stock Market Login      │
├─────────────────────────────────┤
│                                 │
│   Welcome to Fantasy Football   │
│        Stock Market            │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Continue with Google   │   │
│  │         🔍              │   │
│  └─────────────────────────┘   │
│                                 │
│   Secure login with your       │
│   Google account               │
│                                 │
└─────────────────────────────────┘
```

#### 1B. Team Name Setup Page (`app/setup/page.tsx`)
After Google login, one-time setup:
```
┌─────────────────────────────────┐
│    Complete Your Registration   │
├─────────────────────────────────┤
│  Welcome, John!                 │
│                                 │
│  Choose Your Team Name:         │
│  [_____________________]        │
│  (e.g. "Wall Street Warriors")  │
│                                 │
│  Starting Balance: $10,000      │
│                                 │
│  [Start Trading →]              │
└─────────────────────────────────┘
```

#### 1C. Components Needed
- `GoogleLoginButton` component
- `TeamNameForm` component
- Auth state management (mock for static)

**Static Implementation:**
- Google button shows loading state
- Always "succeeds" and goes to team setup
- Team name form redirects to market
- Store mock user in state

---

## User Story 2: View Market Prices

**"As a player, I want to view the current market prices of all NFL players so that I can make informed trading decisions"**

### What We'll Build:

#### 2A. Market Homepage (`app/page.tsx`)
```
┌────────────────────────────────────────────────────────────┐
│ Cash: $4,250 | Portfolio: $5,750 | Total: $10,000         │
├────────────────────────────────────────────────────────────┤
│ 🔍 Search players...         Filter: [Position ▼] [Team ▼] │
├────────────────────────────────────────────────────────────┤
│ Name              Position  Team   Price    Change   Mkt Cap│
│────────────────────────────────────────────────────────────│
│ Patrick Mahomes   QB       KC     $487    ↑5.2%    $487K  │
│ ▼ Expanded view when clicked:                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 24h High: $492  |  24h Low: $465  |  Volume: 1,234  │  │
│ │                                                      │  │
│ │ Shares to trade: [___5___] [-] [+]                  │  │
│ │                                                      │  │
│ │ [Buy $2,435]                    [Sell $2,435]       │  │
│ └──────────────────────────────────────────────────────┘  │
│────────────────────────────────────────────────────────────│
│ Justin Jefferson  WR       MIN    $423    ↓2.1%    $423K  │
│────────────────────────────────────────────────────────────│
│ C. McCaffrey      RB       SF     $398    ↑8.4%    $398K  │
│────────────────────────────────────────────────────────────│
│ Tyreek Hill       WR       MIA    $412    ↑4.6%    $412K  │
└────────────────────────────────────────────────────────────┘
```

#### 2B. Market Table Component (`app/components/MarketTable.tsx`)
Features:
- Sortable columns (click header to sort)
- Row hover effects
- Click row to expand
- Smooth expand/collapse animation

#### 2C. Expanded Row Component (`app/components/ExpandedPlayerRow.tsx`)
Shows when row is clicked:
- Additional stats (high/low/volume)
- Inline quantity selector
- Buy/Sell buttons with calculated totals
- Smooth slide-down animation

#### 2D. Table Features
- **Sorting**: Click column headers
- **Pagination**: Show 20 players per page
- **Sticky header**: Headers stay visible while scrolling
- **Responsive**: On mobile, show key columns only

**Static Implementation:**
- Clicking expands/collapses rows
- Quantity selector updates button totals
- All sorting/filtering client-side
- Smooth transitions

---

## User Story 3: Buy Shares

**"As a player, I want to buy shares of a player so that I can invest in players I think will perform well"**

### What We'll Build:

#### 3A. Inline Buy Experience
Since we're using expandable rows, buying happens right in the table:
```
When row is expanded:
┌──────────────────────────────────────────────────────────┐
│ Patrick Mahomes - Expanded Details                       │
├──────────────────────────────────────────────────────────┤
│ 24h High: $492  |  24h Low: $465  |  Volume: 1,234     │
│                                                          │
│ Shares to Buy: [___5___] [-] [+]   Max: 8 shares       │
│                                                          │
│ Total Cost: $2,435                                       │
│ Cash After: $1,815                                       │
│                                                          │
│ [Buy $2,435] ← Updates as quantity changes              │
└──────────────────────────────────────────────────────────┘
```

#### 3B. Purchase Confirmation Toast/Modal
After clicking Buy:
```
┌─────────────────────────────────────┐
│ ✓ Purchase Successful!              │
├─────────────────────────────────────┤
│ Bought 5 shares of Patrick Mahomes  │
│ at $487 per share                   │
│                                     │
│ Total: $2,435                       │
│                                     │
│ [View Portfolio]  [Dismiss]         │
└─────────────────────────────────────┘
```

#### 3C. Real-time Calculations
- Max shares = floor(cashBalance / price)
- Update button text with total
- Disable button if > cash available
- Show cash remaining

**Static Implementation:**
- Row expands smoothly
- Calculations update instantly
- Success toast appears
- Row collapses after purchase

---

## User Story 4: Sell Shares

**"As a player, I want to sell shares of a player I own so that I can cash out profits or cut losses"**

### What We'll Build:

#### 4A. Inline Sell Experience
In the expanded row (only shows if user owns shares):
```
When row is expanded (owned player):
┌──────────────────────────────────────────────────────────┐
│ Patrick Mahomes - Expanded Details                       │
├──────────────────────────────────────────────────────────┤
│ 24h High: $492  |  24h Low: $465  |  You Own: 5 shares │
│                                                          │
│ Shares to Sell: [___3___] [-] [+]   Max: 5 shares      │
│                                                          │
│ Sale Value: $1,461                                       │
│ Profit: +$72 (+5.2%)                                     │
│                                                          │
│ [Buy More]                    [Sell $1,461]             │
└──────────────────────────────────────────────────────────┘
```

#### 4B. Sell Confirmation Toast
Shows profit/loss clearly:
```
┌─────────────────────────────────────┐
│ ✓ Sale Successful!                  │
├─────────────────────────────────────┤
│ Sold 3 shares of Patrick Mahomes    │
│ at $487 per share                   │
│                                     │
│ Profit: +$72 (+5.2%)                │
│                                     │
│ [View Portfolio]  [Dismiss]         │
└─────────────────────────────────────┘
```

#### 4C. Sell Logic Display
- Show owned shares
- Calculate profit/loss in real-time
- Green text for profit, red for loss
- Update button with sale value

**Note:** In market view, only owned players show sell option

---

## User Story 5: View Portfolio

**"As a player, I want to view my portfolio so that I can track my investments and total value"**

### What We'll Build:

#### 5A. Portfolio Page (`app/portfolio/page.js`)
```
┌───────────────────────────────────────────────┐
│              My Portfolio                     │
│         Team: Wall Street Warriors            │
├───────────────────────────────────────────────┤
│ Cash Balance: $4,250                          │
│ Holdings Value: $5,750                        │
│ Total Value: $10,000                          │
│ Total Gain/Loss: $0 (0.0%)                    │
├───────────────────────────────────────────────┤
│ Player          | Shares | Value   | Gain/Loss│
│─────────────────┼────────┼─────────┼──────────│
│ Patrick Mahomes | 3      | $1,461  | +$96     │
│ QB - KC         |        |         | (+7.0%)  │
│─────────────────┼────────┼─────────┼──────────│
│ J. Jefferson    | 5      | $2,115  | -$47     │
│ WR - MIN        |        |         | (-2.2%)  │
│─────────────────┼────────┼─────────┼──────────│
│ C. McCaffrey    | 4      | $1,592  | +$203    │
│ RB - SF         |        |         | (+14.6%) │
└───────────────────────────────────────────────┘
```

#### 5B. Portfolio Summary Component
Shows key metrics:
- Pie chart of holdings
- Best/worst performers
- Portfolio diversity score

#### 5C. Holdings Table Component
- Sortable columns
- Click row → Player detail page
- Sell buttons inline

---

## User Story 6: See Leaderboard

**"As a player, I want to see the league leaderboard so that I know how I'm doing compared to my friends"**

### What We'll Build:

#### 6A. Leaderboard Page (`app/leaderboard/page.js`)
```
┌─────────────────────────────────────────────┐
│              League Standings               │
├─────────────────────────────────────────────┤
│ Rank | Team Name            | Value   | +/- │
│──────┼──────────────────────┼─────────┼─────│
│ 🥇 1 | Dynasty Destroyers   | $12,487 |+24.9│
│ 🥈 2 | TD Traders           | $11,932 |+19.3│
│ 🥉 3 | Gridiron Gamblers    | $11,205 |+12.1│
│ 4    | Wall Street Warriors | $10,000 | 0.0 │
│      | (You)                |         |     │
│ 5    | Fourth Down Fund     | $9,834  |-1.7 │
│ 6    | Hail Mary Holdings   | $9,521  |-4.8 │
└─────────────────────────────────────────────┘
```

#### 6B. Leaderboard Entry Component
For each user shows:
- Rank (with medal emojis for top 3)
- Team name
- Total portfolio value
- % change from start
- Highlight current user

#### 6C. Leaderboard Stats
Additional stats section:
- Average portfolio value
- Total trades today
- Most owned player

---

## User Story 7: Search and Filter

**"As a player, I want to search and filter players so that I can quickly find specific players or positions"**

### What We'll Build:

#### 7A. Search Bar Component (`app/components/SearchBar.js`)
- Real-time search as you type
- Shows suggestions dropdown
- Clear button

#### 7B. Filter Controls Component (`app/components/FilterControls.js`)
```
Position: [All ▼] [QB] [RB] [WR] [TE]
Team: [All Teams ▼]
Price: [Any ▼] Under $100 | $100-300 | Over $300
Sort: [Trending ▼] Price ↑ | Price ↓ | % Change
```

#### 7C. Search Results View
- Shows filtered results
- "X players found" counter
- "Clear filters" button

**Static Implementation:**
- Filters update the displayed cards
- Search works on dummy data
- All client-side filtering

---

## Additional Pages & Components

### Player Detail Page (`app/player/[id]/page.js`)
Full page for each player with:
- Large price display
- Price chart (static image/placeholder)
- Buy/Sell buttons
- Recent "performance" (dummy data)
- Similar players section

### Transaction History Component
Shows on portfolio page:
- Recent buys/sells
- Timestamp, player, quantity, price
- Profit/loss on sells

### Error States
- Empty portfolio state
- No search results
- "Market closed" banner (for show)

---

## Phase 1: Foundation Implementation

### Completed Steps:
1. ✅ Project setup (`fantasy_mvp_v1`)
2. ✅ Cleaned up starter files (globals.css, page.tsx)
3. ✅ Created TypeScript type definitions (app/types/index.ts)
4. ✅ Created dummy data (app/data/dummyData.ts)

### Next Steps:
5. Create Navigation component
6. Create Header component  
7. Update Layout to use Navigation and Header
8. Test foundation

### Phase 2: Core Pages (Day 3-5)
1. Market page with player cards
2. Portfolio page with holdings
3. Leaderboard page
4. Player detail pages

### Phase 3: Interactions (Day 6-7)
1. Buy/Sell modals
2. Search and filters
3. Success/error states
4. Polish and transitions

### Phase 4: Polish (Day 8)
1. Loading states
2. Empty states
3. Responsive design
4. Final styling touches

---

## Key Design Patterns

### Component Reusability
- PlayerCard used in market and search
- TransactionModal base for buy/sell
- PriceDisplay component for consistent formatting

### State Management (Static)
- Use React useState for UI state
- Modal open/close
- Filter selections
- Search input

### Responsive Design
- Mobile-first approach
- Grid layouts for cards
- Collapsible filters on mobile
- Swipeable modals

### Visual Feedback
- Hover states on all interactive elements
- Smooth transitions
- Loading skeletons
- Success animations

---

## Dummy Data Structure

```typescript
// app/types/index.ts
export interface User {
  id: number;
  username: string;
  teamName: string;
  email: string;
  cashBalance: number;
  totalValue: number;
}

export interface Player {
  id: number;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE';
  team: string;
  jerseyNumber: number;
  price: number;
  previousClose: number;
  changeAmount: number;
  changePercent: number;
  marketCap: number;
  owned?: number; // for portfolio display
}

export interface Holding {
  player: Player;
  quantity: number;
  averagePurchasePrice: number;
  currentValue: number;
  totalGainLoss: number;
  gainLossPercent: number;
}

export interface Transaction {
  id: number;
  playerId: number;
  playerName: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  pricePerShare: number;
  totalPrice: number;
  timestamp: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  teamName: string;
  totalValue: number;
  changeAmount: number;
  changePercent: number;
  isCurrentUser?: boolean;
}

// app/data/dummyData.ts
import { User, Player, LeaderboardEntry } from '@/app/types';

export const currentUser: User = {
  id: 1,
  username: "john_doe",
  email: "john@example.com",
  teamName: "Wall Street Warriors",
  cashBalance: 4250,
  totalValue: 10000
}

export const players: Player[] = [
  {
    id: 1,
    name: "Patrick Mahomes",
    position: "QB",
    team: "KC",
    jerseyNumber: 15,
    price: 487,
    previousClose: 463,
    changeAmount: 24,
    changePercent: 5.2,
    marketCap: 487000,
    owned: 3  // for portfolio display
  },
  // ... more players
]

export const leaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 2,
    teamName: "Dynasty Destroyers",
    totalValue: 12487,
    changeAmount: 2487,
    changePercent: 24.9
  },
  // ... more users
]
```

---

## Success Criteria

Each user story is satisfied when:

1. **Account Creation**: User can see signup form and "create" account
2. **View Market**: All players display with prices and changes
3. **Buy Shares**: Modal flow works, shows calculations
4. **Sell Shares**: Can "sell" from portfolio, shows profit/loss
5. **View Portfolio**: See all holdings with gains/losses
6. **Leaderboard**: See ranking of all users
7. **Search/Filter**: Can find specific players quickly

The static version is complete when you can click through the entire user journey without any real data persistence or backend calls.