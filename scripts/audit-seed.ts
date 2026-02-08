/**
 * Audit script for verifying seed data integrity.
 * Runs 7 checks against the live Supabase instance.
 *
 * Usage: npx tsx scripts/audit-seed.ts
 */

import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// 1. Load .env.local manually and get service role key from CLI
// ---------------------------------------------------------------------------

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
    // .env.local not found
  }
}

loadEnvLocal();

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.log("Fetching service_role key from supabase CLI...");
  try {
    const output = execSync(
      "supabase projects api-keys --project-ref ixkakwqaaieghtdjqmdg 2>&1",
      { encoding: "utf-8" }
    );
    const serviceLine = output
      .split("\n")
      .find((l) => l.includes("service_role"));
    if (serviceLine) {
      serviceRoleKey = serviceLine.trim().split(/\s+/).pop();
    }
  } catch {
    // ignore
  }
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or service_role key. Aborting.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Create Supabase client with service role key
// ---------------------------------------------------------------------------

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// 3. Run checks
// ---------------------------------------------------------------------------

interface CheckResult {
  name: string;
  passed: boolean;
  details: string[];
}

const results: CheckResult[] = [];

function check(name: string, passed: boolean, details: string[] = []) {
  results.push({ name, passed, details });
  const icon = passed ? "PASS" : "FAIL";
  console.log(`\n[${icon}] ${name}`);
  for (const d of details) {
    console.log(`       ${d}`);
  }
}

async function runChecks() {
  console.log("=== BuyLow Seed Audit ===\n");
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Timestamp:    ${new Date().toISOString()}\n`);

  // Fetch all required data upfront
  const [profilesRes, holdingsRes, playersRes, transactionsRes, rankingsRes] =
    await Promise.all([
      supabase.from("profiles").select("id, team_name, cash_balance"),
      supabase
        .from("holdings")
        .select("id, user_id, player_id, quantity, avg_purchase_price"),
      supabase.from("players").select("id, name, current_price, baseline_price"),
      supabase
        .from("transactions")
        .select("id, user_id, player_id, type, quantity, price_per_share, total_price, created_at"),
      supabase
        .from("leaderboard_rankings")
        .select("id, team_name, rank, total_value, cash_balance, holdings_value")
        .order("rank", { ascending: true }),
    ]);

  if (profilesRes.error) throw new Error(`profiles: ${profilesRes.error.message}`);
  if (holdingsRes.error) throw new Error(`holdings: ${holdingsRes.error.message}`);
  if (playersRes.error) throw new Error(`players: ${playersRes.error.message}`);
  if (transactionsRes.error) throw new Error(`transactions: ${transactionsRes.error.message}`);
  if (rankingsRes.error) throw new Error(`rankings: ${rankingsRes.error.message}`);

  const profiles = profilesRes.data!;
  const holdings = holdingsRes.data!;
  const players = playersRes.data!;
  const transactions = transactionsRes.data!;
  const rankings = rankingsRes.data!;

  const playerMap = new Map(players.map((p) => [p.id, p]));

  // -------------------------------------------------------------------------
  // Check 1: Cash balance consistency
  // For each user: cash_balance = 10000 - SUM(holdings.quantity * holdings.avg_purchase_price)
  // -------------------------------------------------------------------------
  {
    const details: string[] = [];
    let allGood = true;

    for (const profile of profiles) {
      const userHoldings = holdings.filter((h) => h.user_id === profile.id);
      const investedSum = userHoldings.reduce(
        (acc, h) => acc + h.quantity * h.avg_purchase_price,
        0
      );
      const expectedCash = 10000 - investedSum;
      const actualCash = profile.cash_balance;
      const diff = Math.abs(expectedCash - actualCash);

      if (diff > 0.01) {
        allGood = false;
        details.push(
          `MISMATCH: ${profile.team_name} -- expected cash=$${expectedCash.toFixed(2)}, actual=$${actualCash.toFixed(2)} (diff=$${diff.toFixed(2)})`
        );
      }
    }

    if (allGood) {
      details.push(`All ${profiles.length} users have consistent cash balances.`);
    }

    check("Check 1: Cash balance consistency", allGood, details);
  }

  // -------------------------------------------------------------------------
  // Check 2: Holdings quantities are positive and reasonable
  // No user has more shares of a single player than they could afford with $10k
  // -------------------------------------------------------------------------
  {
    const details: string[] = [];
    let allGood = true;

    for (const h of holdings) {
      if (h.quantity <= 0) {
        allGood = false;
        const profile = profiles.find((p) => p.id === h.user_id);
        const player = playerMap.get(h.player_id);
        details.push(
          `NON-POSITIVE: ${profile?.team_name ?? h.user_id} owns ${h.quantity} shares of ${player?.name ?? h.player_id}`
        );
      }

      if (h.avg_purchase_price > 0) {
        const totalCost = h.quantity * h.avg_purchase_price;
        if (totalCost > 10000) {
          allGood = false;
          const profile = profiles.find((p) => p.id === h.user_id);
          const player = playerMap.get(h.player_id);
          details.push(
            `OVERSIZE: ${profile?.team_name ?? h.user_id} spent $${totalCost.toFixed(2)} on ${player?.name ?? h.player_id} (${h.quantity} x $${h.avg_purchase_price})`
          );
        }
      }

      // Also check: max affordable shares at avg_purchase_price
      if (h.avg_purchase_price > 0) {
        const maxAffordable = Math.floor(10000 / h.avg_purchase_price);
        if (h.quantity > maxAffordable) {
          allGood = false;
          const profile = profiles.find((p) => p.id === h.user_id);
          const player = playerMap.get(h.player_id);
          details.push(
            `UNREASONABLE: ${profile?.team_name ?? h.user_id} holds ${h.quantity} of ${player?.name ?? h.player_id} but max affordable is ${maxAffordable} at $${h.avg_purchase_price}/share`
          );
        }
      }
    }

    if (allGood) {
      details.push(
        `All ${holdings.length} holdings are positive and within $10k budget.`
      );
    }

    check("Check 2: Holdings quantities positive and reasonable", allGood, details);
  }

  // -------------------------------------------------------------------------
  // Check 3: Transaction records match holdings
  // For users WITHOUT today's transactions (no sells), BUY transaction
  // quantities should match holding quantities per player.
  // -------------------------------------------------------------------------
  {
    const details: string[] = [];
    let allGood = true;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    // Find users who have any transactions today
    const usersWithTodayTx = new Set<string>();
    for (const tx of transactions) {
      if (tx.created_at >= todayISO) {
        usersWithTodayTx.add(tx.user_id);
      }
    }

    // For users without today's transactions, check BUY totals match holdings
    for (const profile of profiles) {
      if (usersWithTodayTx.has(profile.id)) continue;

      const userHoldings = holdings.filter((h) => h.user_id === profile.id);
      const userTxs = transactions.filter(
        (t) => t.user_id === profile.id && t.type === "BUY"
      );

      // Group BUY transactions by player_id
      const txByPlayer = new Map<string, number>();
      for (const tx of userTxs) {
        txByPlayer.set(
          tx.player_id,
          (txByPlayer.get(tx.player_id) || 0) + tx.quantity
        );
      }

      // Compare with holdings
      for (const h of userHoldings) {
        const txQty = txByPlayer.get(h.player_id) || 0;
        if (txQty !== h.quantity) {
          allGood = false;
          const player = playerMap.get(h.player_id);
          details.push(
            `MISMATCH: ${profile.team_name} -- ${player?.name ?? h.player_id}: holding=${h.quantity}, BUY txns=${txQty}`
          );
        }
      }

      // Check for transactions with no matching holding
      for (const [playerId, txQty] of txByPlayer) {
        const hasHolding = userHoldings.some((h) => h.player_id === playerId);
        if (!hasHolding && txQty > 0) {
          allGood = false;
          const player = playerMap.get(playerId);
          details.push(
            `ORPHAN TX: ${profile.team_name} has BUY txns for ${player?.name ?? playerId} (qty=${txQty}) but no holding`
          );
        }
      }
    }

    if (allGood) {
      details.push(
        "BUY transactions match holdings for all users without today's activity."
      );
    }

    check(
      "Check 3: Transaction records match holdings (non-active-traders)",
      allGood,
      details
    );
  }

  // -------------------------------------------------------------------------
  // Check 4: Verify tied ranks
  // - Rank 10 has exactly 3 users
  // - Rank 15 has exactly 2 users
  // - Ranks 11, 12, 16 should NOT exist
  // -------------------------------------------------------------------------
  {
    const details: string[] = [];
    let allGood = true;

    // Group by rank
    const byRank = new Map<number, typeof rankings>();
    for (const r of rankings) {
      const rank = Number(r.rank);
      if (!byRank.has(rank)) byRank.set(rank, []);
      byRank.get(rank)!.push(r);
    }

    // Rank 10 should have exactly 3
    const rank10 = byRank.get(10) || [];
    if (rank10.length === 3) {
      details.push(
        `Rank 10: 3 users (${rank10.map((r) => r.team_name).join(", ")})`
      );
    } else {
      allGood = false;
      details.push(
        `Rank 10: expected 3 users, found ${rank10.length} -- ${rank10.map((r) => `${r.team_name}($${Number(r.total_value).toFixed(2)})`).join(", ")}`
      );
    }

    // Rank 15 should have exactly 2
    const rank15 = byRank.get(15) || [];
    if (rank15.length === 2) {
      details.push(
        `Rank 15: 2 users (${rank15.map((r) => r.team_name).join(", ")})`
      );
    } else {
      allGood = false;
      details.push(
        `Rank 15: expected 2 users, found ${rank15.length} -- ${rank15.map((r) => `${r.team_name}($${Number(r.total_value).toFixed(2)})`).join(", ")}`
      );
    }

    // Ranks 11, 12, 16 should NOT exist
    for (const forbiddenRank of [11, 12, 16]) {
      const found = byRank.get(forbiddenRank) || [];
      if (found.length > 0) {
        allGood = false;
        details.push(
          `Rank ${forbiddenRank}: should NOT exist but found ${found.length} user(s) -- ${found.map((r) => r.team_name).join(", ")}`
        );
      } else {
        details.push(`Rank ${forbiddenRank}: correctly absent`);
      }
    }

    check("Check 4: Verify tied ranks", allGood, details);
  }

  // -------------------------------------------------------------------------
  // Check 5: Player ownership count
  // List players by number of distinct owners (descending)
  // -------------------------------------------------------------------------
  {
    const details: string[] = [];

    // Group holdings by player_id, count distinct users
    const ownersByPlayer = new Map<string, Set<string>>();
    for (const h of holdings) {
      if (!ownersByPlayer.has(h.player_id)) {
        ownersByPlayer.set(h.player_id, new Set());
      }
      ownersByPlayer.get(h.player_id)!.add(h.user_id);
    }

    // Build sorted list
    const playerOwnership: { name: string; owners: number }[] = [];
    for (const [playerId, owners] of ownersByPlayer) {
      const player = playerMap.get(playerId);
      playerOwnership.push({
        name: player?.name ?? playerId,
        owners: owners.size,
      });
    }
    playerOwnership.sort((a, b) => b.owners - a.owners);

    details.push("Player ownership (distinct owners):");
    for (const po of playerOwnership) {
      details.push(`  ${po.name}: ${po.owners} owner(s)`);
    }

    const mostOwned = playerOwnership[0];
    details.push(`Most owned player: ${mostOwned?.name} (${mostOwned?.owners} owners)`);

    // This check always passes -- it's informational
    check("Check 5: Player ownership count", true, details);
  }

  // -------------------------------------------------------------------------
  // Check 6: Trades today count
  // Should be 11 (8 from Day Trader Dan + 3 from Eager Beaver)
  // -------------------------------------------------------------------------
  {
    const details: string[] = [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const todayTxs = transactions.filter((t) => t.created_at >= todayISO);
    const expected = 11;

    details.push(`Found ${todayTxs.length} transactions today (expected ${expected}).`);

    // Breakdown by user
    const byUser = new Map<string, number>();
    for (const tx of todayTxs) {
      const profile = profiles.find((p) => p.id === tx.user_id);
      const label = profile?.team_name ?? tx.user_id.slice(0, 8);
      byUser.set(label, (byUser.get(label) || 0) + 1);
    }
    for (const [user, count] of byUser) {
      details.push(`  ${user}: ${count} transaction(s)`);
    }

    check("Check 6: Trades today count", todayTxs.length === expected, details);
  }

  // -------------------------------------------------------------------------
  // Check 7: No user exceeds $10k initial spend
  // SUM(holdings.quantity * holdings.avg_purchase_price) <= 10000
  // -------------------------------------------------------------------------
  {
    const details: string[] = [];
    let allGood = true;

    for (const profile of profiles) {
      const userHoldings = holdings.filter((h) => h.user_id === profile.id);
      const totalSpent = userHoldings.reduce(
        (acc, h) => acc + h.quantity * h.avg_purchase_price,
        0
      );

      if (totalSpent > 10000) {
        allGood = false;
        details.push(
          `OVER BUDGET: ${profile.team_name} spent $${totalSpent.toFixed(2)} (exceeds $10,000 by $${(totalSpent - 10000).toFixed(2)})`
        );
      }
    }

    if (allGood) {
      details.push(
        `All ${profiles.length} users are within the $10,000 initial budget.`
      );
    }

    check("Check 7: No user exceeds $10k initial spend", allGood, details);
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n" + "=".repeat(60));
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`\nSUMMARY: ${passed} checks passed, ${failed} issues found`);

  if (failed > 0) {
    console.log("\nFailed checks:");
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  - ${r.name}`);
      for (const d of r.details) {
        console.log(`    ${d}`);
      }
    }
  }

  console.log();
}

runChecks().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
