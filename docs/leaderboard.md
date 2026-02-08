Leaderboard Page Design Statement
Page Purpose: Display a ranked list of all users on the platform by total portfolio value, fostering competition and allowing users to view others' rosters for strategic insights.
Key Components:
    1    Leaderboard Header
    ◦    Page title: "Global Leaderboard" or "All Players"
    ◦    Platform-wide stats summary:
    ▪    Total number of active users
    ▪    Average portfolio value across all users
    ▪    Total trades made today/this week
    ▪    Most owned player globally
    2    Current User Highlight Bar
    ◦    Sticky/prominent display of current user's standing:
    ▪    "Your Rank: #142 of 1,247"
    ▪    Team name
    ▪    Total portfolio value
    ▪    Change from starting value ($XXX, XX%)
    ◦    Allows users to quickly see their position without scrolling
    ◦    "Jump to My Rank" button to scroll to their position in the list
    3    Rankings Table
    ◦    Columns: Rank | Team Name | Total Value | Change | Action
    ◦    Each row displays:
    ▪    Rank:
    ▪    Medal emojis for top 3 (🥇 🥈 🥉)
    ▪    Numeric rank for others
    ▪    Team Name:
    ▪    Team name (primary text)
    ▪    Username (secondary text, smaller)
    ▪    Total Value:
    ▪    Portfolio total (bold, large)
    ▪    Breakdown on hover or secondary line: Cash + Holdings
    ▪    Change:
    ▪    Dollar amount and percentage from starting $10,000
    ▪    Color-coded: green (positive), red (negative), gray (neutral)
    ▪    Action:
    ▪    "View Roster" button/link
    ▪    Icon or text link to navigate to that user's roster
    4    Current User Row Highlighting
    ◦    Visual distinction for current user's row:
    ▪    Different background color (subtle highlight)
    ▪    Bold text
    ▪    "You" indicator or badge
    ▪    Always visible when scrolling to that section
    5    Pagination/Infinite Scroll
    ◦    With potentially thousands of users:
    ▪    Show top 100 initially with pagination
    ▪    OR infinite scroll that loads more as user scrolls
    ▪    Always show top 10 + current user's neighborhood (users ranked near them)
    ▪    Quick jump options: "Top 10", "Top 100", "My Rank"
    6    Roster View Page
    ◦    Clicking "View Roster" navigates to competitor's portfolio page:
    ▪    Read-only view (no buy/sell actions)
    ▪    Shows their holdings: players owned, purchase prices, current values
    ▪    Portfolio composition breakdown by position
    ▪    Performance metrics
    ▪    Clear indicator at top: "Viewing [Team Name]'s Roster"
    ▪    Easy navigation back to leaderboard
Style Guidelines:
    •    Competitive, gamified aesthetic
    •    Clear hierarchy emphasizing top performers
    •    Medal icons/badges for top 3 add visual interest
    •    Professional leaderboard design (think esports/gaming)
    •    Responsive: Stack columns on mobile, prioritize rank and value
    •    Performance optimized for large user base (virtualized scrolling if needed)
User Actions:
    •    Scroll through leaderboard
    •    Jump to their own rank
    •    Click "View Roster" to see any user's holdings
    •    Compare their portfolio to others
    •    Navigate back to their own roster
    •    Search for specific users (optional)
Key UX Considerations:
    •    Make current user's position immediately visible without scrolling
    •    Handle large user base efficiently (don't load all thousands at once)
    •    Clear call-to-action to view other rosters
    •    Read-only view prevents confusion about whose portfolio they're viewing
    •    Easy navigation between leaderboard and personal roster
    •    Show context around user's rank (who's near them in standings)
Empty/Edge States:
    •    Loading state: Skeleton rows while data loads
    •    New user (no rank yet): Message explaining ranking system
    •    Tied rankings: Show same rank number with tie indicator
    •    User search returns no results