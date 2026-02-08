"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Users,
  TrendingUp,
  Activity,
  Crown,
  Loader2,
  Eye,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatPercent, getPerformanceColor } from "@/lib/format";
import type { LeaderboardEntry, LeaderboardStats } from "@/lib/types";

// Rank badge styling for top 3
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
        <Crown className="w-4 h-4 text-amber-400" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-zinc-400/20 border border-zinc-400/40 flex items-center justify-center">
        <span className="text-xs font-bold text-zinc-300">2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-orange-700/20 border border-orange-700/40 flex items-center justify-center">
        <span className="text-xs font-bold text-orange-400">3</span>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <span className="text-sm font-semibold text-zinc-500">{rank}</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);

    // Fetch rankings from view
    const { data: rankingsData } = await supabase
      .from("leaderboard_rankings")
      .select("*")
      .order("rank", { ascending: true });

    if (rankingsData) {
      setRankings(rankingsData as unknown as LeaderboardEntry[]);
    }

    // Fetch stats from RPC
    const { data: statsData } = await supabase.rpc("leaderboard_stats");
    if (statsData) {
      setStats(statsData as unknown as LeaderboardStats);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentUserEntry = useMemo(
    () => rankings.find((r) => r.id === currentUserId),
    [rankings, currentUserId]
  );

  const scrollToCurrentUser = () => {
    currentUserRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Header Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: stats?.total_users ?? 0,
              format: (v: number) => v.toString(),
              icon: Users,
              color: "text-zinc-400",
            },
            {
              label: "Avg Portfolio Value",
              value: stats?.avg_portfolio_value ?? 0,
              format: formatCurrency,
              icon: TrendingUp,
              color: "text-zinc-400",
            },
            {
              label: "Trades Today",
              value: stats?.trades_today ?? 0,
              format: (v: number) => v.toString(),
              icon: Activity,
              color: "text-zinc-400",
            },
            {
              label: "Most Owned Player",
              value: stats?.most_owned_player
                ? `${stats.most_owned_player.name}`
                : "N/A",
              format: (v: string) => v,
              icon: Crown,
              color: "text-zinc-400",
              subtitle: stats?.most_owned_player
                ? `${stats.most_owned_player.owner_count} owner${stats.most_owned_player.owner_count !== 1 ? "s" : ""}`
                : undefined,
            },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              key={stat.label}
              className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-zinc-800 rounded-xl">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
              <h2 className="text-xl font-bold mt-1 text-zinc-100">
                {typeof stat.value === "number"
                  ? stat.format(stat.value as never)
                  : stat.format(stat.value as never)}
              </h2>
              {"subtitle" in stat && stat.subtitle && (
                <p className="text-xs text-zinc-500 mt-0.5">{stat.subtitle}</p>
              )}
            </motion.div>
          ))}
        </section>

        {/* Current User Highlight Bar */}
        {currentUserEntry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-14 z-40 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-xl px-5 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Your Rank
                </span>
                <span className="text-lg font-bold text-emerald-400">
                  #{currentUserEntry.rank}
                </span>
              </div>
              <div className="w-px h-6 bg-zinc-700" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-200">
                  {formatCurrency(currentUserEntry.total_value)}
                </span>
                <span
                  className={`text-xs font-bold ${getPerformanceColor(currentUserEntry.change_from_start)}`}
                >
                  {formatPercent(currentUserEntry.change_pct)}
                </span>
              </div>
            </div>
            <button
              onClick={scrollToCurrentUser}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              Jump to My Rank
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Rankings Table */}
        {rankings.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
              <Users className="w-8 h-8 text-zinc-500" />
            </div>
            <h4 className="text-lg font-medium text-zinc-300">
              No rankings yet
            </h4>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-1">
              Rankings will appear once users create accounts and start trading.
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-3.5 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase border-b border-zinc-800/50 bg-zinc-900/60">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Team</div>
              <div className="col-span-3 text-right">Total Value</div>
              <div className="col-span-2 text-right">Change</div>
              <div className="col-span-2 text-right">Roster</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-zinc-800/40">
              {rankings.map((entry, i) => {
                const isCurrentUser = entry.id === currentUserId;
                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    key={entry.id}
                    ref={isCurrentUser ? currentUserRef : undefined}
                    className={`grid grid-cols-12 items-center px-6 py-4 transition-colors hover:bg-zinc-800/20 ${
                      isCurrentUser ? "bg-emerald-500/5 border-l-2 border-l-emerald-500" : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      <RankBadge rank={entry.rank} />
                    </div>

                    {/* Team Name */}
                    <div className="col-span-4 flex items-center gap-2">
                      <span className="font-semibold text-zinc-100 truncate">
                        {entry.team_name}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 uppercase shrink-0">
                          You
                        </span>
                      )}
                    </div>

                    {/* Total Value */}
                    <div className="col-span-3 text-right">
                      <div className="text-sm font-bold text-zinc-100">
                        {formatCurrency(entry.total_value)}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {formatCurrency(entry.cash_balance)} cash &bull;{" "}
                        {formatCurrency(entry.holdings_value)} holdings
                      </div>
                    </div>

                    {/* Change */}
                    <div className="col-span-2 text-right">
                      <div
                        className={`text-sm font-bold ${getPerformanceColor(entry.change_from_start)}`}
                      >
                        {entry.change_from_start >= 0 ? "+" : ""}
                        {formatCurrency(entry.change_from_start)}
                      </div>
                      <div
                        className={`text-xs ${getPerformanceColor(entry.change_pct)} opacity-80`}
                      >
                        {formatPercent(entry.change_pct)}
                      </div>
                    </div>

                    {/* View Roster */}
                    <div className="col-span-2 flex justify-end">
                      <Link
                        href={`/roster/${entry.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-emerald-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-zinc-800/50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
