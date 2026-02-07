# Fantasy Football Stock Market - Data Model

## Overview
This data model supports a fantasy football stock market where users buy/sell shares of NFL players whose values fluctuate based on performance.

## Core Entities

### 1. Users
Represents each person playing in your league.

```javascript
User {
  id: string (unique)
  email: string
  username: string
  passwordHash: string
  teamName: string (e.g. "Wall Street Warriors", "Bull Market Bombers")
  createdAt: datetime
  
  // Financial data
  cashBalance: number (starts at 10000)
  
  // Relationships
  holdings: [Holding]
  transactions: [Transaction]
}
```

---

### 2. Players (NFL Players)
The "stocks" that users can buy/sell.

```javascript
Player {
  id: string (unique)
  name: string
  position: string (QB, RB, WR, TE)
  team: string (KC, BUF, etc.)
  jerseyNumber: number
  
  // Pricing data
  currentPrice: number
  previousClosePrice: number
  dailyClosePrice: number (price at end of each day)
  weeklyHigh: number
  weeklyLow: number
  marketCap: number (price × total shares in circulation)
  
  // Relationship
  priceHistory: [PriceHistory]
}
```

---

### 3. Holdings
Links users to the players they own (many-to-many relationship).

```javascript
Holding {
  id: string (unique)
  userId: string (references User)
  playerId: string (references Player)
  
  quantity: number (how many shares)
  averagePurchasePrice: number
  
  // Calculated fields
  currentValue: number (quantity * current price)
  totalGainLoss: number (current value - (quantity * avg purchase price))
  
  // Relationships
  user: User
  player: Player
}
```

---

### 4. Transactions
Records every buy/sell action.

```javascript
Transaction {
  id: string (unique)
  userId: string (references User)
  playerId: string (references Player)
  
  type: string ('BUY' | 'SELL')
  quantity: number
  pricePerShare: number
  totalPrice: number
  
  timestamp: datetime
  
  // Relationships
  user: User
  player: Player
}
```

---

### 5. PriceHistory
Tracks daily closing prices for historical charts and analysis.

```javascript
PriceHistory {
  id: string (unique)
  playerId: string (references Player)
  
  date: date (YYYY-MM-DD, not datetime)
  closingPrice: number
  
  // Relationship
  player: Player
}
```

---



## Key Relationships

```
User (1) ─────┬─── (Many) Holdings
              │
              └─── (Many) Transactions

Player (1) ────┬─── (Many) Holdings
               │
               ├─── (Many) Transactions
               │
               └─── (Many) PriceHistory
```

---

## MVP Implementation Notes

### Initial Settings (Hardcoded)
- Starting balance: $10,000 per user
- All users in single league
- No transaction fees
- Whole shares only (no fractional)

### Data Population
- Load all NFL players for positions: QB, RB, WR, TE
- Set initial prices based on simple algorithm
- Update prices daily based on performance

### Future Enhancements
- Multiple leagues support
- Fractional shares
- Advanced order types (limit orders)
- Real-time price updates
- Mobile app