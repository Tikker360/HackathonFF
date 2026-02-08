Market Page Design Statement
Page Purpose: Display all available NFL players with their current market prices, allowing users to browse, search, filter, and execute trades directly from the main marketplace view.
Key Components:
    1    Market Header
    ◦    User's financial snapshot (always visible):
    ▪    Cash Balance
    ▪    Holdings Value
    ▪    Total Portfolio Value
    ◦    This keeps users aware of their buying power while browsing
    2    Search and Filter Bar
    ◦    Search input: Real-time search by player name
    ◦    Filter dropdowns:
    ▪    Position filter: All, QB, RB, WR, TE (button group or dropdown)
    ▪    Team filter: Dropdown with all NFL teams
    ▪    Price range filter: Under $100, $100-300, $300-500, Over $500
    ◦    Sort options: Trending (default), Price (high/low), % Change (high/low), Alphabetical
    ◦    Results counter: "Showing X players"
    ◦    Clear filters button (appears when filters active)
    3    Player Market Table
    ◦    Columns: Player Name/Position/Team | Price | 24h Change | Action
    ◦    Compact row view shows:
    ▪    Player name (primary text)
    ▪    Position and team (secondary text)
    ▪    Current price (large, bold)
    ▪    24h change (dollar amount and percentage, color-coded)
    ▪    Status indicator: "Owned" badge if user owns this player, or "Buy" button
    4    Expandable Row Details
    ◦    Click any row to expand inline (smooth slide-down animation)
    ◦    Expanded view shows:
    ▪    24h High/Low prices
    ▪    Trading volume
    ▪    Visual indicator: "You own this player" (if applicable) or buying power
    ▪    If NOT owned:
    ▪    "Buy for $XXX" prominent button
    ▪    Cash remaining after purchase shown
    ▪    If OWNED:
    ▪    Purchase price display
    ▪    Current profit/loss
    ▪    "Sell for $XXX" prominent button (shows current market price)
    ▪    Profit/loss preview
    ▪    Quick link to player detail page
    ◦    Click row again or elsewhere to collapse
    5    Table Features
    ◦    Sortable columns (click headers)
    ◦    Pagination: 20-25 players per page
    ◦    Sticky header: Column headers stay visible while scrolling
    ◦    Row hover effects for better interaction feedback
    ◦    Visual distinction for owned players (subtle background color or badge)
    6    Transaction Confirmation
    ◦    Toast notification after buy/sell:
    ▪    Success checkmark
    ▪    Transaction summary (player name, price)
    ▪    Profit/loss for sells
    ▪    Quick actions: "View Roster" or "Dismiss"
    ◦    Updates user's cash balance and portfolio value immediately
Style Guidelines:
    •    Financial market/stock exchange aesthetic
    •    Dense information display but not cluttered
    •    Clear visual hierarchy: price is most prominent
    •    Green for positive changes/profits, red for negative
    •    Smooth animations for expand/collapse
    •    Responsive: On mobile, hide less critical columns (volume)
    •    Use icons for buy/sell actions on mobile
User Actions:
    •    Search players by name
    •    Filter by position, team, price range
    •    Sort by various metrics
    •    Expand row to see detailed stats
    •    Buy player (if not owned and sufficient cash)
    •    Sell player (if owned)
    •    Navigate to player detail page
    •    Quick access to roster/portfolio
Key UX Considerations:
    •    One-share limit means buying/selling is always a simple binary action
    •    Clear visual feedback when player is already owned
    •    Prevent duplicate purchases with "Owned" badge
    •    Show buying power context (cash remaining after purchase)
    •    Fast, inline trading without modals keeps users in the flow
Empty/Edge States:
    •    No search results: "No players found. Try adjusting your filters."
    •    Market loaded state: Skeleton rows while data loads
    •    Insufficient funds: Disabled buy button with tooltip explaining why
