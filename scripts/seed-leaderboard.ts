/**
 * Seed script for leaderboard demo data.
 * Creates 18 new users (+ 2 existing), sets up holdings and transactions
 * to simulate the scenarios defined in docs/seed-scenarios.md.
 *
 * Usage: npx tsx scripts/seed-leaderboard.ts
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 *           (or will attempt to read from supabase CLI)
 */

import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually (no dotenv dependency needed)
function loadEnvLocal() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx);
      const val = trimmed.slice(eqIdx + 1);
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local not found, that's fine
  }
}

loadEnvLocal();

// --- Config ---

function getEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    console.log("No SUPABASE_SERVICE_ROLE_KEY in env, fetching from CLI...");
    try {
      const output = execSync(
        "supabase projects api-keys --project-ref ixkakwqaaieghtdjqmdg 2>&1",
        { encoding: "utf-8" }
      );
      const match = output.split("\n").find((l) => l.includes("service_role"));
      if (match) {
        serviceKey = match.trim().split(/\s+/).pop();
      }
    } catch {
      // ignore
    }
  }

  if (!url || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  return { url, serviceKey };
}

const { url, serviceKey } = getEnv();
const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// --- Existing users ---
const EXISTING_USERS = [
  "69af8901-c568-4e88-ae75-ca0bc1f706b1",
  "025c6f7a-2d0e-4c6a-a9c8-b0ace616bf73",
];

// --- Player lookup (will be populated from DB) ---
type PlayerMap = Record<string, { id: string; baseline_price: number; current_price: number }>;
let players: PlayerMap = {};

// --- Seeded current prices (market movement) ---
const PRICE_UPDATES: Record<string, number> = {
  "Josh Allen": 720,
  "Patrick Mahomes": 680,
  "Lamar Jackson": 610,
  "Jalen Hurts": 640,
  "Joe Burrow": 530,
  "Saquon Barkley": 690,
  "Bijan Robinson": 650,
  "Jahmyr Gibbs": 580,
  "Breece Hall": 460,
  "De'Von Achane": 540,
  "Ja'Marr Chase": 670,
  "CeeDee Lamb": 550,
  "Amon-Ra St. Brown": 600,
  "Tyreek Hill": 470,
  "Malik Nabers": 510,
  "Travis Kelce": 500,
  "Brock Bowers": 490,
  "Sam LaPorta": 400,
  "Trey McBride": 410,
  "George Kittle": 340,
};

// --- User scenarios ---
interface UserScenario {
  teamName: string;
  cashBalance: number;
  holdings: { player: string; quantity: number; avgPrice: number }[];
  transactionsToday?: { player: string; type: "BUY" | "SELL"; quantity: number; price: number }[];
}

const SCENARIOS: UserScenario[] = [
  // #1 Top Dog — uses existing user 1
  {
    teamName: "Stockton Kings",
    cashBalance: 2015,
    holdings: [
      { player: "Saquon Barkley", quantity: 5, avgPrice: 625 },
      { player: "Ja'Marr Chase", quantity: 5, avgPrice: 620 },
      { player: "Brock Bowers", quantity: 4, avgPrice: 440 },
    ],
  },
  // #2 Cash Hoarder
  {
    teamName: "Wait And See",
    cashBalance: 9220,
    holdings: [{ player: "Trey McBride", quantity: 2, avgPrice: 390 }],
  },
  // #3 All-In Degen
  {
    teamName: "YOLO Capital",
    cashBalance: 1280,
    holdings: [
      { player: "Bijan Robinson", quantity: 8, avgPrice: 600 },
      { player: "De'Von Achane", quantity: 8, avgPrice: 490 },
    ],
  },
  // #4 Diversified
  {
    teamName: "Index Fund Larry",
    cashBalance: 4225,
    holdings: [
      { player: "Josh Allen", quantity: 1, avgPrice: 670 },
      { player: "Saquon Barkley", quantity: 1, avgPrice: 625 },
      { player: "Ja'Marr Chase", quantity: 1, avgPrice: 620 },
      { player: "Bijan Robinson", quantity: 1, avgPrice: 600 },
      { player: "Jalen Hurts", quantity: 1, avgPrice: 590 },
      { player: "CeeDee Lamb", quantity: 1, avgPrice: 580 },
      { player: "Amon-Ra St. Brown", quantity: 1, avgPrice: 555 },
      { player: "Jahmyr Gibbs", quantity: 1, avgPrice: 545 },
      { player: "Breece Hall", quantity: 1, avgPrice: 510 },
      { player: "Travis Kelce", quantity: 1, avgPrice: 480 },
    ],
  },
  // #5 Tied Rank A
  {
    teamName: "Mirror Match",
    cashBalance: 4250,
    holdings: [
      { player: "Patrick Mahomes", quantity: 6, avgPrice: 645 },
      { player: "Malik Nabers", quantity: 4, avgPrice: 470 },
    ],
  },
  // #6 Copy Cat
  {
    teamName: "Copy Cat",
    cashBalance: 5815,
    holdings: [
      { player: "Jalen Hurts", quantity: 4, avgPrice: 590 },
      { player: "George Kittle", quantity: 5, avgPrice: 365 },
    ],
  },
  // #7 Breakeven
  {
    teamName: "Treading Water",
    cashBalance: 6790,
    holdings: [
      { player: "CeeDee Lamb", quantity: 3, avgPrice: 580 },
      { player: "De'Von Achane", quantity: 3, avgPrice: 490 },
    ],
  },
  // #8 Down Bad
  {
    teamName: "Buy High Club",
    cashBalance: 2435,
    holdings: [
      { player: "Breece Hall", quantity: 6, avgPrice: 510 },
      { player: "Tyreek Hill", quantity: 5, avgPrice: 520 },
      { player: "Lamar Jackson", quantity: 3, avgPrice: 635 },
    ],
  },
  // #9 Empty Portfolio
  {
    teamName: "Just Joined",
    cashBalance: 10000,
    holdings: [],
  },
  // #10 Active Trader — uses existing user 2
  {
    teamName: "Day Trader Dan",
    cashBalance: 5655,
    holdings: [
      { player: "Josh Allen", quantity: 4, avgPrice: 670 },
      { player: "Amon-Ra St. Brown", quantity: 3, avgPrice: 555 },
    ],
    transactionsToday: [
      { player: "Josh Allen", type: "BUY", quantity: 2, price: 720 },
      { player: "Amon-Ra St. Brown", type: "BUY", quantity: 3, price: 600 },
      { player: "Josh Allen", type: "SELL", quantity: 1, price: 720 },
      { player: "Saquon Barkley", type: "BUY", quantity: 1, price: 690 },
      { player: "Saquon Barkley", type: "SELL", quantity: 1, price: 690 },
      { player: "Josh Allen", type: "BUY", quantity: 2, price: 720 },
      { player: "Josh Allen", type: "SELL", quantity: 1, price: 720 },
      { player: "Josh Allen", type: "BUY", quantity: 2, price: 720 },
    ],
  },
  // #11 Moderate Winner
  {
    teamName: "Steady Eddie",
    cashBalance: 4700,
    holdings: [
      { player: "Jalen Hurts", quantity: 6, avgPrice: 590 },
      { player: "Brock Bowers", quantity: 4, avgPrice: 440 },
    ],
  },
  // #12 Slight Loser
  {
    teamName: "Almost There",
    cashBalance: 5520,
    holdings: [
      { player: "Joe Burrow", quantity: 5, avgPrice: 560 },
      { player: "Sam LaPorta", quantity: 4, avgPrice: 420 },
    ],
  },
  // #13 QB Specialist
  {
    teamName: "Quarterback Club",
    cashBalance: 4285,
    holdings: [
      { player: "Josh Allen", quantity: 3, avgPrice: 670 },
      { player: "Patrick Mahomes", quantity: 3, avgPrice: 645 },
      { player: "Jalen Hurts", quantity: 3, avgPrice: 590 },
    ],
  },
  // #14 RB Heavy
  {
    teamName: "Ground Game",
    cashBalance: 3210,
    holdings: [
      { player: "Saquon Barkley", quantity: 5, avgPrice: 625 },
      { player: "Jahmyr Gibbs", quantity: 5, avgPrice: 545 },
      { player: "Malik Nabers", quantity: 2, avgPrice: 470 },
    ],
  },
  // #15 Big Spender
  {
    teamName: "Whale Watch",
    cashBalance: 1240,
    holdings: [
      { player: "Bijan Robinson", quantity: 6, avgPrice: 600 },
      { player: "Ja'Marr Chase", quantity: 6, avgPrice: 620 },
      { player: "Travis Kelce", quantity: 3, avgPrice: 480 },
    ],
  },
  // #16 New But Active
  {
    teamName: "Eager Beaver",
    cashBalance: 9040,
    holdings: [{ player: "Travis Kelce", quantity: 2, avgPrice: 480 }],
    transactionsToday: [
      { player: "Travis Kelce", type: "BUY", quantity: 1, price: 500 },
      { player: "Saquon Barkley", type: "BUY", quantity: 1, price: 690 },
      { player: "Saquon Barkley", type: "SELL", quantity: 1, price: 690 },
    ],
  },
  // #17 Worst Performer
  {
    teamName: "The Tank",
    cashBalance: 1850,
    holdings: [
      { player: "Breece Hall", quantity: 7, avgPrice: 510 },
      { player: "Tyreek Hill", quantity: 6, avgPrice: 520 },
      { player: "George Kittle", quantity: 4, avgPrice: 365 },
    ],
  },
  // #18 Triple Tie A
  {
    teamName: "Coincidence A",
    cashBalance: 7510,
    holdings: [
      { player: "Brock Bowers", quantity: 3, avgPrice: 440 },
      { player: "Trey McBride", quantity: 3, avgPrice: 390 },
    ],
  },
  // #19 Triple Tie B — cash adjusted to force $10,210 total
  {
    teamName: "Coincidence B",
    cashBalance: 8210,
    holdings: [
      { player: "Amon-Ra St. Brown", quantity: 2, avgPrice: 555 },
      { player: "Sam LaPorta", quantity: 2, avgPrice: 420 },
    ],
  },
  // #20 Triple Tie C — cash adjusted to force $10,210 total
  {
    teamName: "Coincidence C",
    cashBalance: 8110,
    holdings: [
      { player: "De'Von Achane", quantity: 2, avgPrice: 490 },
      { player: "Malik Nabers", quantity: 2, avgPrice: 470 },
    ],
  },
];

// --- Main ---

async function main() {
  console.log("=== BuyLow Leaderboard Seed ===\n");

  // 1. Fetch players from DB and build lookup
  console.log("1. Fetching players...");
  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("id, name, current_price, baseline_price");

  if (playersError || !playersData) {
    console.error("Failed to fetch players:", playersError);
    process.exit(1);
  }

  for (const p of playersData) {
    players[p.name] = { id: p.id, baseline_price: p.baseline_price, current_price: p.current_price };
  }
  console.log(`   Found ${playersData.length} players`);

  // 2. Update player prices to create market movement
  console.log("\n2. Updating player prices...");
  for (const [name, newPrice] of Object.entries(PRICE_UPDATES)) {
    const player = players[name];
    if (!player) {
      console.warn(`   WARNING: Player "${name}" not found, skipping`);
      continue;
    }
    const { error } = await supabase
      .from("players")
      .update({ current_price: newPrice })
      .eq("id", player.id);

    if (error) {
      console.error(`   Failed to update ${name}:`, error.message);
    } else {
      console.log(`   ${name}: $${player.current_price} -> $${newPrice}`);
      player.current_price = newPrice;
    }
  }

  // 3. Create users and set up portfolios
  console.log("\n3. Creating users and portfolios...");
  const userIds: string[] = [];

  for (let i = 0; i < SCENARIOS.length; i++) {
    const scenario = SCENARIOS[i];
    let userId: string;

    // Use existing users for scenarios 0 and 9
    if (i === 0) {
      userId = EXISTING_USERS[0];
      console.log(`   [${i + 1}] Reusing existing user: ${scenario.teamName} (${userId.slice(0, 8)}...)`);
    } else if (i === 9) {
      userId = EXISTING_USERS[1];
      console.log(`   [${i + 1}] Reusing existing user: ${scenario.teamName} (${userId.slice(0, 8)}...)`);
    } else {
      // Create new auth user
      const email = `seed-${scenario.teamName.toLowerCase().replace(/\s+/g, "-")}@buylow.test`;
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: "seedpassword123!",
        email_confirm: true,
        user_metadata: { team_name: scenario.teamName },
      });

      if (authError) {
        // User might already exist from a previous seed run
        if (authError.message.includes("already been registered")) {
          // Look up existing user by email
          const { data: users } = await supabase.auth.admin.listUsers();
          const existing = users?.users.find((u) => u.email === email);
          if (existing) {
            userId = existing.id;
            console.log(`   [${i + 1}] Already exists: ${scenario.teamName} (${userId.slice(0, 8)}...)`);
          } else {
            console.error(`   [${i + 1}] Failed to find existing user for ${email}`);
            continue;
          }
        } else {
          console.error(`   [${i + 1}] Failed to create user: ${authError.message}`);
          continue;
        }
      } else {
        userId = authData.user.id;
        console.log(`   [${i + 1}] Created: ${scenario.teamName} (${userId.slice(0, 8)}...)`);
      }
    }

    userIds.push(userId);

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        team_name: scenario.teamName,
        cash_balance: scenario.cashBalance,
      })
      .eq("id", userId);

    if (profileError) {
      console.error(`   Failed to update profile for ${scenario.teamName}:`, profileError.message);
    }

    // Clear existing holdings for this user (in case of re-run)
    await supabase.from("holdings").delete().eq("user_id", userId);

    // Insert holdings
    for (const h of scenario.holdings) {
      const player = players[h.player];
      if (!player) {
        console.warn(`   WARNING: Player "${h.player}" not found for ${scenario.teamName}`);
        continue;
      }
      const { error: holdingError } = await supabase.from("holdings").insert({
        user_id: userId,
        player_id: player.id,
        quantity: h.quantity,
        avg_purchase_price: h.avgPrice,
      });
      if (holdingError) {
        console.error(`   Failed to insert holding ${h.player}:`, holdingError.message);
      }
    }

    // Insert historical transaction for each holding (bought at baseline)
    for (const h of scenario.holdings) {
      const player = players[h.player];
      if (!player) continue;
      await supabase.from("transactions").insert({
        user_id: userId,
        player_id: player.id,
        type: "BUY",
        quantity: h.quantity,
        price_per_share: h.avgPrice,
        total_price: h.quantity * h.avgPrice,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      });
    }

    // Insert today's transactions for active traders
    if (scenario.transactionsToday) {
      for (const tx of scenario.transactionsToday) {
        const player = players[tx.player];
        if (!player) continue;
        await supabase.from("transactions").insert({
          user_id: userId,
          player_id: player.id,
          type: tx.type,
          quantity: tx.quantity,
          price_per_share: tx.price,
          total_price: tx.quantity * tx.price,
          // Spread today's transactions across the last few hours
          created_at: new Date(
            Date.now() - Math.floor(Math.random() * 4 * 60 * 60 * 1000)
          ).toISOString(),
        });
      }
    }
  }

  // 4. Verify: query leaderboard rankings
  console.log("\n4. Verifying leaderboard rankings...");
  const { data: rankings, error: rankError } = await supabase
    .from("leaderboard_rankings")
    .select("rank, team_name, total_value, change_pct")
    .order("rank", { ascending: true });

  if (rankError) {
    console.error("Failed to query rankings:", rankError.message);
  } else if (rankings) {
    console.log("\n   Rank | Team                  | Total Value  | Change");
    console.log("   " + "-".repeat(65));
    for (const r of rankings) {
      const sign = r.change_pct >= 0 ? "+" : "";
      console.log(
        `   ${String(r.rank).padStart(4)} | ${r.team_name.padEnd(21)} | $${Number(r.total_value).toFixed(2).padStart(10)} | ${sign}${Number(r.change_pct).toFixed(2)}%`
      );
    }
  }

  // 5. Verify stats
  const { data: stats } = await supabase.rpc("leaderboard_stats");
  if (stats) {
    console.log("\n   Stats:");
    console.log(`   Total users: ${stats.total_users}`);
    console.log(`   Avg portfolio: $${Number(stats.avg_portfolio_value).toFixed(2)}`);
    console.log(`   Trades today: ${stats.trades_today}`);
    console.log(`   Most owned: ${stats.most_owned_player?.name} (${stats.most_owned_player?.owner_count} owners)`);
  }

  console.log("\n=== Seed complete ===");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
