"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Wallet,
  LayoutGrid,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  UserX,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  formatCurrency,
  formatPercent,
  getPerformanceColor,
  getPerformanceBg,
} from "@/lib/format";
import type { RosterHolding, LeaderboardEntry } from "@/lib/types";

const INITIAL_CAPITAL = 10000;
const PIE_COLORS = ["#2dd4bf", "#3b82f6", "#8b5cf6", "#f43f5e"];

interface ProfileData {
  team_name: string;
  cash_balance: number;
}

export default function RosterView({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [holdings, setHoldings] = useState<RosterHolding[]>([]);
  const [rankEntry, setRankEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("team_name, cash_balance")
      .eq("id", userId)
      .single();

    if (profileError || !profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    // Fetch holdings with player data
    const { data: holdingsData } = await supabase
      .from("holdings")
      .select(
        `
        id,
        player_id,
        quantity,
        avg_purchase_price,
        players:player_id (name, position, team, current_price)
      `
      )
      .eq("user_id", userId);

    if (holdingsData) {
      const mapped: RosterHolding[] = holdingsData.map((h) => ({
        id: h.id,
        player_id: h.player_id,
        quantity: h.quantity,
        avg_purchase_price: h.avg_purchase_price,
        player: h.players as unknown as RosterHolding["player"],
      }));
      setHoldings(mapped);
    }

    // Fetch rank from leaderboard view
    const { data: rankData } = await supabase
      .from("leaderboard_rankings")
      .select("*")
      .eq("id", userId)
      .single();

    if (rankData) {
      setRankEntry(rankData as unknown as LeaderboardEntry);
    }

    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Computed values
  const holdingsValue = useMemo(
    () =>
      holdings.reduce(
        (sum, h) => sum + h.quantity * h.player.current_price,
        0
      ),
    [holdings]
  );

  const totalPortfolio = (profile?.cash_balance ?? 0) + holdingsValue;
  const totalPL = totalPortfolio - INITIAL_CAPITAL;
  const totalPLPct = INITIAL_CAPITAL > 0 ? (totalPL / INITIAL_CAPITAL) * 100 : 0;

  const pieData = useMemo(() => {
    const byPosition: Record<string, number> = {};
    holdings.forEach((h) => {
      const pos = h.player.position;
      byPosition[pos] =
        (byPosition[pos] || 0) + h.quantity * h.player.current_price;
    });
    return Object.entries(byPosition).map(([name, value]) => ({ name, value }));
  }, [holdings]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  // Not found
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leaderboard
          </Link>
          <div className="py-20 text-center flex flex-col items-center">
            <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
              <UserX className="w-8 h-8 text-zinc-500" />
            </div>
            <h4 className="text-lg font-medium text-zinc-300">
              User not found
            </h4>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-1">
              This user may not exist or their profile may have been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leaderboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            {profile?.team_name}&apos;s Roster
          </h1>
          {rankEntry && (
            <p className="text-sm text-zinc-500 mt-1">
              Rank #{rankEntry.rank} &bull;{" "}
              {formatCurrency(rankEntry.total_value)} total value
            </p>
          )}
        </div>

        {/* Summary Metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Cash Balance",
              value: profile?.cash_balance ?? 0,
              icon: Wallet,
              color: "text-zinc-400",
            },
            {
              label: "Holdings Value",
              value: holdingsValue,
              icon: LayoutGrid,
              color: "text-zinc-400",
            },
            {
              label: "Total Portfolio",
              value: totalPortfolio,
              icon: DollarSign,
              color: "text-zinc-400",
            },
            {
              label: "Total P/L",
              value: totalPL,
              icon: totalPL >= 0 ? TrendingUp : TrendingDown,
              subValue: formatPercent(totalPLPct),
              color: getPerformanceColor(totalPL),
            },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              key={stat.label}
              className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-zinc-800 rounded-xl">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                {"subValue" in stat && stat.subValue && (
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md ${getPerformanceBg(totalPL)} ${stat.color}`}
                  >
                    {stat.subValue}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
              <h2 className={`text-xl font-bold mt-1 ${stat.color}`}>
                {formatCurrency(stat.value)}
              </h2>
            </motion.div>
          ))}
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Holdings Table */}
          <div className="lg:col-span-8">
            {holdings.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl py-20 text-center">
                <div className="p-4 bg-zinc-800/50 rounded-full mb-4 mx-auto w-fit">
                  <LayoutGrid className="w-8 h-8 text-zinc-500" />
                </div>
                <h4 className="text-lg font-medium text-zinc-300">
                  No holdings
                </h4>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-1">
                  This user hasn&apos;t purchased any players yet.
                </p>
              </div>
            ) : (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 px-6 py-3.5 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase border-b border-zinc-800/50 bg-zinc-900/60">
                  <div className="col-span-4">Player</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-2 text-right">Gain/Loss</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-zinc-800/40">
                  {holdings.map((holding, i) => {
                    const totalVal =
                      holding.quantity * holding.player.current_price;
                    const costBasis =
                      holding.quantity * holding.avg_purchase_price;
                    const gainLoss = totalVal - costBasis;
                    const gainLossPct =
                      costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

                    return (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        key={holding.id}
                        className="grid grid-cols-12 items-center px-6 py-4 hover:bg-zinc-800/20 transition-colors"
                      >
                        {/* Player */}
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300">
                            {holding.player.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-100 text-sm">
                              {holding.player.name}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {holding.player.position} &bull;{" "}
                              {holding.player.team}
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 text-right text-sm font-semibold text-zinc-200">
                          {formatCurrency(holding.player.current_price)}
                        </div>

                        {/* Quantity */}
                        <div className="col-span-2 text-center text-sm text-zinc-300">
                          {holding.quantity}
                        </div>

                        {/* Total */}
                        <div className="col-span-2 text-right text-sm font-semibold text-zinc-200">
                          {formatCurrency(totalVal)}
                        </div>

                        {/* Gain/Loss */}
                        <div className="col-span-2 text-right">
                          <div
                            className={`text-sm font-bold ${getPerformanceColor(gainLoss)}`}
                          >
                            {gainLoss >= 0 ? "+" : ""}
                            {formatCurrency(gainLoss)}
                          </div>
                          <div
                            className={`text-xs ${getPerformanceColor(gainLoss)} opacity-80`}
                          >
                            {formatPercent(gainLossPct)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Portfolio Mix */}
          {holdings.length > 0 && (
            <div className="lg:col-span-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <PieChartIcon className="w-5 h-5 text-sky-400" />
                  Portfolio Mix
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        label={({ percent }: { percent?: number }) =>
                          `${((percent ?? 0) * 100).toFixed(1)}%`
                        }
                        labelLine={false}
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#e4e4e7" }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
