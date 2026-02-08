# Seed Data Scenarios

Seeding against a live Supabase instance using the Admin API.

**Starting capital:** $10,000 per user.

---

## Available Players (20)

Prices are baseline; the seed script must **update `current_price`** to create market movement.

| Player | Pos | Team | Baseline | Seeded Price | Movement |
|--------|-----|------|----------|-------------|----------|
| Josh Allen | QB | BUF | $670 | $720 | +7.5% |
| Patrick Mahomes | QB | KC | $645 | $680 | +5.4% |
| Lamar Jackson | QB | BAL | $635 | $610 | -3.9% |
| Jalen Hurts | QB | PHI | $590 | $640 | +8.5% |
| Joe Burrow | QB | CIN | $560 | $530 | -5.4% |
| Saquon Barkley | RB | PHI | $625 | $690 | +10.4% |
| Bijan Robinson | RB | ATL | $600 | $650 | +8.3% |
| Jahmyr Gibbs | RB | DET | $545 | $580 | +6.4% |
| Breece Hall | RB | NYJ | $510 | $460 | -9.8% |
| De'Von Achane | RB | MIA | $490 | $540 | +10.2% |
| Ja'Marr Chase | WR | CIN | $620 | $670 | +8.1% |
| CeeDee Lamb | WR | DAL | $580 | $550 | -5.2% |
| Amon-Ra St. Brown | WR | DET | $555 | $600 | +8.1% |
| Tyreek Hill | WR | MIA | $520 | $470 | -9.6% |
| Malik Nabers | WR | NYG | $470 | $510 | +8.5% |
| Travis Kelce | TE | KC | $480 | $500 | +4.2% |
| Brock Bowers | TE | LV | $440 | $490 | +11.4% |
| Sam LaPorta | TE | DET | $420 | $400 | -4.8% |
| Trey McBride | TE | ARI | $390 | $410 | +5.1% |
| George Kittle | TE | SF | $365 | $340 | -6.8% |

**Winners:** Allen, Mahomes, Hurts, Barkley, Robinson, Gibbs, Achane, Chase, St. Brown, Nabers, Kelce, Bowers, McBride
**Losers:** Jackson, Burrow, Hall, Lamb, Hill, LaPorta, Kittle

---

## Users (20 total)

> All holdings use `avg_purchase_price = baseline_price` (bought at market open) unless noted.
> Cash = $10,000 - total cost of purchases at avg_purchase_price.

### 1. Top Dog — "Stockton Kings"
- Bought: 5x Saquon Barkley ($625), 5x Ja'Marr Chase ($620), 4x Brock Bowers ($440)
- Cost: $3,125 + $3,100 + $1,760 = $7,985
- Cash: $2,015
- Holdings at current price: 5×$690 + 5×$670 + 4×$490 = $3,450 + $3,350 + $1,960 = $8,760
- **Total: $10,775 (+7.75%)**

### 2. Cash Hoarder — "Wait And See"
- Bought: 2x Trey McBride ($390)
- Cost: $780
- Cash: $9,220
- Holdings at current price: 2×$410 = $820
- **Total: $10,040 (+0.4%)**

### 3. All-In Degen — "YOLO Capital"
- Bought: 8x Bijan Robinson ($600), 8x De'Von Achane ($490)
- Cost: $4,800 + $3,920 = $8,720
- Cash: $1,280
- Holdings at current price: 8×$650 + 8×$540 = $5,200 + $4,320 = $9,520
- **Total: $10,800 (+8.0%)**

### 4. Diversified — "Index Fund Larry"
- Bought: 1x each of Josh Allen ($670), Saquon Barkley ($625), Ja'Marr Chase ($620), Bijan Robinson ($600), Jalen Hurts ($590), CeeDee Lamb ($580), Amon-Ra St. Brown ($555), Jahmyr Gibbs ($545), Breece Hall ($510), Travis Kelce ($480)
- Cost: $5,775
- Cash: $4,225
- Holdings at current price: $720+$690+$670+$650+$640+$550+$600+$580+$460+$500 = $6,060
- **Total: $10,285 (+2.85%)**

### 5. Tied Rank A — "Mirror Match"
- Bought: 6x Patrick Mahomes ($645), 4x Malik Nabers ($470)
- Cost: $3,870 + $1,880 = $5,750
- Cash: $4,250
- Holdings at current price: 6×$680 + 4×$510 = $4,080 + $2,040 = $6,120
- **Total: $10,370 (+3.7%)**

### 6. Tied Rank B — "Copy Cat"
- Bought: 4x Jalen Hurts ($590), 5x George Kittle ($365)
- Cost: $2,360 + $1,825 = $4,185
- Cash: $5,815
- Holdings at current price: 4×$640 + 5×$340 = $2,560 + $1,700 = $4,260
- **Total: $10,075 (+0.75%)**
- *(Note: NOT tied with #5 — recalculated. See Triple Tie below for exact ties.)*

### 7. Breakeven — "Treading Water"
- Bought: 3x CeeDee Lamb ($580), 3x De'Von Achane ($490)
- Cost: $1,740 + $1,470 = $3,210
- Cash: $6,790
- Holdings at current price: 3×$550 + 3×$540 = $1,650 + $1,620 = $3,270
- **Total: $10,060 (+0.6%)**

### 8. Down Bad — "Buy High Club"
- Bought: 6x Breece Hall ($510), 5x Tyreek Hill ($520), 3x Lamar Jackson ($635)
- Cost: $3,060 + $2,600 + $1,905 = $7,565
- Cash: $2,435
- Holdings at current price: 6×$460 + 5×$470 + 3×$610 = $2,760 + $2,350 + $1,830 = $6,940
- **Total: $9,375 (-6.25%)**

### 9. Empty Portfolio — "Just Joined"
- Bought: nothing
- Cash: $10,000
- **Total: $10,000 (0%)**

### 10. Active Trader — "Day Trader Dan"
- Current state after many trades today:
- Bought: 4x Josh Allen ($670), 3x Amon-Ra St. Brown ($555)
- Cost: $2,680 + $1,665 = $4,345
- Cash: $5,655
- Holdings at current price: 4×$720 + 3×$600 = $2,880 + $1,800 = $4,680
- **Total: $10,335 (+3.35%)**
- **Transactions today (8):** Buy 2 Allen, Buy 3 St. Brown, Sell 1 Allen, Buy 1 Barkley, Sell 1 Barkley, Buy 2 Allen, Sell 1 Allen, Buy 2 Allen
- *(Net: 4 Allen, 3 St. Brown remaining after sells)*

### 11. Moderate Winner — "Steady Eddie"
- Bought: 6x Jalen Hurts ($590), 4x Brock Bowers ($440)
- Cost: $3,540 + $1,760 = $5,300
- Cash: $4,700
- Holdings at current price: 6×$640 + 4×$490 = $3,840 + $1,960 = $5,800
- **Total: $10,500 (+5.0%)**

### 12. Slight Loser — "Almost There"
- Bought: 5x Joe Burrow ($560), 4x Sam LaPorta ($420)
- Cost: $2,800 + $1,680 = $4,480
- Cash: $5,520
- Holdings at current price: 5×$530 + 4×$400 = $2,650 + $1,600 = $4,250
- **Total: $9,770 (-2.3%)**

### 13. QB Specialist — "Quarterback Club"
- Bought: 3x Josh Allen ($670), 3x Patrick Mahomes ($645), 3x Jalen Hurts ($590)
- Cost: $2,010 + $1,935 + $1,770 = $5,715
- Cash: $4,285
- Holdings at current price: 3×$720 + 3×$680 + 3×$640 = $2,160 + $2,040 + $1,920 = $6,120
- **Total: $10,405 (+4.05%)**

### 14. RB Heavy — "Ground Game"
- Bought: 5x Saquon Barkley ($625), 5x Jahmyr Gibbs ($545), 2x Malik Nabers ($470)
- Cost: $3,125 + $2,725 + $940 = $6,790
- Cash: $3,210
- Holdings at current price: 5×$690 + 5×$580 + 2×$510 = $3,450 + $2,900 + $1,020 = $7,370
- **Total: $10,580 (+5.8%)**

### 15. Big Spender — "Whale Watch"
- Bought: 6x Bijan Robinson ($600), 6x Ja'Marr Chase ($620), 3x Travis Kelce ($480)
- Cost: $3,600 + $3,720 + $1,440 = $8,760
- Cash: $1,240
- Holdings at current price: 6×$650 + 6×$670 + 3×$500 = $3,900 + $4,020 + $1,500 = $9,420
- **Total: $10,660 (+6.6%)**

### 16. New But Active — "Eager Beaver"
- Bought: 2x Travis Kelce ($480)
- Cost: $960
- Cash: $9,040
- Holdings at current price: 2×$500 = $1,000
- **Total: $10,040 (+0.4%)**
- **Transactions today (3):** Buy 1 Kelce, Buy 1 Barkley, Sell 1 Barkley

### 17. Worst Performer — "The Tank"
- Bought: 7x Breece Hall ($510), 6x Tyreek Hill ($520), 4x George Kittle ($365)
- Cost: $3,570 + $3,120 + $1,460 = $8,150
- Cash: $1,850
- Holdings at current price: 7×$460 + 6×$470 + 4×$340 = $3,220 + $2,820 + $1,360 = $7,400
- **Total: $9,250 (-7.5%)**

### 18. Triple Tie — "Coincidence A"
- Bought: 3x Brock Bowers ($440), 3x Trey McBride ($390)
- Cost: $1,320 + $1,170 = $2,490
- Cash: $7,510
- Holdings at current price: 3×$490 + 3×$410 = $1,470 + $1,230 = $2,700
- **Total: $10,210 (+2.1%)**

### 19. Triple Tie — "Coincidence B"
- Bought: 1x De'Von Achane ($490), 4x Malik Nabers ($470)
- Cost: $490 + $1,880 = $2,370
- Cash: $7,630
- Holdings at current price: 1×$540 + 4×$510 = $540 + $2,040 = $2,580
- Gain: 1×(540-490) + 4×(510-470) = 50 + 160 = **$210**
- **Total: $10,210 (+2.1%)**

### 20. Triple Tie — "Coincidence C"
- Bought: 3x Travis Kelce ($480), 3x Bijan Robinson ($600)
- Cost: $1,440 + $1,800 = $3,240
- Cash: $6,760
- Holdings at current price: 3×$500 + 3×$650 = $1,500 + $1,950 = $3,450
- Gain: 3×(500-480) + 3×(650-600) = 60 + 150 = **$210**
- **Total: $10,210 (+2.1%)**

All three tie portfolios naturally produce +$210 gain with different player mixes. No cash inflation needed.

---

## Existing Test Users

Two users already exist from migration 006:
- `69af8901-c568-4e88-ae75-ca0bc1f706b1` — "Team Alpha"
- `025c6f7a-2d0e-4c6a-a9c8-b0ace616bf73` — "Team Bravo"

The seed script should assign these to scenarios #1 and #10 (or any two), updating their profiles rather than creating new ones.

---

## Expected Rankings (approximate)

| Rank | Team | Total | Change |
|------|------|-------|--------|
| 1 | YOLO Capital | $10,800 | +8.0% |
| 2 | Stockton Kings | $10,775 | +7.75% |
| 3 | Whale Watch | $10,660 | +6.6% |
| 4 | Ground Game | $10,580 | +5.8% |
| 5 | Steady Eddie | $10,500 | +5.0% |
| 6 | Quarterback Club | $10,405 | +4.05% |
| 7 | Mirror Match | $10,370 | +3.7% |
| 8 | Day Trader Dan | $10,335 | +3.35% |
| 9 | Index Fund Larry | $10,285 | +2.85% |
| 10-12 | Coincidence A/B/C | $10,210 | +2.1% |
| 13 | Copy Cat | $10,075 | +0.75% |
| 14 | Treading Water | $10,060 | +0.6% |
| 15-16 | Wait And See / Eager Beaver | $10,040 | +0.4% |
| 17 | Just Joined | $10,000 | 0% |
| 18 | Almost There | $9,770 | -2.3% |
| 19 | Buy High Club | $9,375 | -6.25% |
| 20 | The Tank | $9,250 | -7.5% |

## Edge Cases Covered

| Scenario | Users | What it tests |
|----------|-------|---------------|
| Three-way tie | #18, #19, #20 | RANK() shares rank, next rank skips by 3 |
| Two-way tie | #2, #16 | Same total, different compositions |
| Empty portfolio | #9 | No holdings, $10k cash, 0% change |
| Single position type | #13 | Pie chart with one category (QB only) |
| Max loss | #17 | Negative change, last place |
| Trades today | #10 (8 txns), #16 (3 txns) | Stats RPC "trades_today" = 11 |
| Most owned player | Bijan Robinson (4 owners: #3, #4, #10 sell, #15) | Stats RPC "most_owned_player" |

## Implementation

Node script using `@supabase/supabase-js` with service role key:

1. Update `current_price` on all 20 players per the price table above
2. Create 18 new auth users via `auth.admin.createUser()` (2 existing)
3. Profiles auto-created by signup trigger — update `team_name` and `cash_balance`
4. Insert holdings rows (user_id + player_id + quantity + avg_purchase_price)
5. Insert transaction rows (historical + today's for #10 and #16)
6. Verify: query `leaderboard_rankings` view, confirm ranks and ties

**Requires:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
