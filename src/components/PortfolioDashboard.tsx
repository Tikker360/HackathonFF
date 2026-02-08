"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Search,
  LayoutGrid,
  List as ListIcon,
  DollarSign,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  formatCurrency,
  formatPercent,
  getPerformanceColor,
  getPerformanceBg,
} from "@/lib/format";
import Link from "next/link";

// --- Types ---

interface Holding {
  id: string;
  player_id: string;
  quantity: number;
  avg_purchase_price: number;
  player: {
    name: string;
    position: string;
    team: string;
    current_price: number;
  };
}

interface Transaction {
  id: string;
  type: string;
  quantity: number;
  price_per_share: number;
  total_price: number;
  created_at: string;
  player: {
    name: string;
  };
}

const INITIAL_CASH = 10000;
const PIE_COLORS = ["#2dd4bf", "#3b82f6", "#8b5cf6", "#f43f5e"];

export default function PortfolioDashboard() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);
  const [tradeError, setTradeError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("team_name, cash_balance")
      .eq("id", user.id)
      .single();

    if (profile) {
      setCashBalance(profile.cash_balance);
      setTeamName(profile.team_name);
    }

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
      .eq("user_id", user.id);

    if (holdingsData) {
      const mapped: Holding[] = holdingsData.map((h) => ({
        id: h.id,
        player_id: h.player_id,
        quantity: h.quantity,
        avg_purchase_price: h.avg_purchase_price,
        player: h.players as unknown as Holding["player"],
      }));
      setHoldings(mapped);
    }

    // Fetch recent transactions
    const { data: txData } = await supabase
      .from("transactions")
      .select(
        `
        id,
        type,
        quantity,
        price_per_share,
        total_price,
        created_at,
        players:player_id (name)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (txData) {
      const mapped: Transaction[] = txData.map((t) => ({
        id: t.id,
        type: t.type,
        quantity: t.quantity,
        price_per_share: t.price_per_share,
        total_price: t.total_price,
        created_at: t.created_at,
        player: t.players as unknown as Transaction["player"],
      }));
      setTransactions(mapped);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toast auto-dismiss
  useEffect(() => {
    if (tradeSuccess) {
      const t = setTimeout(() => setTradeSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [tradeSuccess]);
  useEffect(() => {
    if (tradeError) {
      const t = setTimeout(() => setTradeError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [tradeError]);

  // Computed
  const holdingsValue = useMemo(
    () =>
      holdings.reduce(
        (sum, h) => sum + h.player.current_price * h.quantity,
        0
      ),
    [holdings]
  );
  const totalPortfolioValue = cashBalance + holdingsValue;
  const totalGainLoss = totalPortfolioValue - INITIAL_CASH;
  const totalGainLossPct =
    INITIAL_CASH > 0 ? (totalGainLoss / INITIAL_CASH) * 100 : 0;

  const filteredHoldings = useMemo(() => {
    if (!searchTerm) return holdings;
    const term = searchTerm.toLowerCase();
    return holdings.filter(
      (h) =>
        h.player.name.toLowerCase().includes(term) ||
        h.player.team.toLowerCase().includes(term)
    );
  }, [holdings, searchTerm]);

  const pieData = useMemo(() => {
    const byPosition: Record<string, number> = {};
    holdings.forEach((h) => {
      const pos = h.player.position;
      byPosition[pos] =
        (byPosition[pos] || 0) + h.player.current_price * h.quantity;
    });
    return Object.entries(byPosition).map(([name, value]) => ({
      name,
      value,
    }));
  }, [holdings]);

  // Top performer & underperformer
  const topPerformer = useMemo(() => {
    if (holdings.length === 0) return null;
    return holdings.reduce((best, h) => {
      const gain =
        (h.player.current_price - h.avg_purchase_price) * h.quantity;
      const bestGain =
        (best.player.current_price - best.avg_purchase_price) * best.quantity;
      return gain > bestGain ? h : best;
    });
  }, [holdings]);

  const underperformer = useMemo(() => {
    if (holdings.length === 0) return null;
    return holdings.reduce((worst, h) => {
      const gain =
        (h.player.current_price - h.avg_purchase_price) * h.quantity;
      const worstGain =
        (worst.player.current_price - worst.avg_purchase_price) *
        worst.quantity;
      return gain < worstGain ? h : worst;
    });
  }, [holdings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toast notifications */}
        <AnimatePresence>
          {tradeSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-18 right-4 z-50 bg-emerald-600 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg"
            >
              {tradeSuccess}
            </motion.div>
          )}
          {tradeError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-18 right-4 z-50 bg-rose-600 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg"
            >
              {tradeError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
              {teamName || "My Portfolio"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/market"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Trade
            </Link>
          </div>
        </header>

        {/* Summary Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Available Cash",
              value: cashBalance,
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
              value: totalPortfolioValue,
              icon: DollarSign,
              color: "text-zinc-400",
            },
            {
              label: "Total P/L",
              value: totalGainLoss,
              icon: totalGainLoss >= 0 ? TrendingUp : TrendingDown,
              subValue: formatPercent(totalGainLossPct),
              color: getPerformanceColor(totalGainLoss),
            },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-800 rounded-xl group-hover:scale-110 transition-transform">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.subValue && (
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md ${getPerformanceBg(totalGainLoss)} ${stat.color}`}
                  >
                    {stat.subValue}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
              <h2 className={`text-2xl font-bold mt-1 ${stat.color}`}>
                {formatCurrency(stat.value)}
              </h2>
            </motion.div>
          ))}
        </section>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Holdings + Transactions */}
          <main className="lg:col-span-8 space-y-6">
            {/* Holdings Table */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ListIcon className="w-5 h-5 text-emerald-400" />
                  Your Holdings
                </h3>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search players..."
                    className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredHoldings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Player</th>
                        <th className="px-6 py-4 text-right">Price/Value</th>
                        <th className="px-6 py-4 text-right">Gain/Loss</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      <AnimatePresence mode="popLayout">
                        {filteredHoldings.map((holding) => {
                          const totalVal =
                            holding.player.current_price * holding.quantity;
                          const costBasis =
                            holding.avg_purchase_price * holding.quantity;
                          const profit = totalVal - costBasis;
                          const profitPct =
                            costBasis > 0 ? (profit / costBasis) * 100 : 0;

                          return (
                            <motion.tr
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              key={holding.id}
                              className="group hover:bg-zinc-800/30 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300">
                                    {holding.player.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-zinc-200">
                                      {holding.player.name}
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-tight">
                                      {holding.player.position} &bull;{" "}
                                      {holding.player.team} &bull;{" "}
                                      {holding.quantity} share
                                      {holding.quantity > 1 ? "s" : ""}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="text-sm font-semibold">
                                  {formatCurrency(holding.player.current_price)}
                                </div>
                                <div className="text-xs text-zinc-400 italic">
                                  Total: {formatCurrency(totalVal)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div
                                  className={`text-sm font-bold ${getPerformanceColor(profit)}`}
                                >
                                  {profit >= 0 ? "+" : ""}
                                  {formatCurrency(profit)}
                                </div>
                                <div
                                  className={`text-xs ${getPerformanceColor(profit)} opacity-80`}
                                >
                                  {formatPercent(profitPct)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Link
                                  href="/market"
                                  className="text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5 ml-auto"
                                >
                                  Trade
                                </Link>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
                    {holdings.length === 0 ? (
                      <LayoutGrid className="w-8 h-8 text-zinc-500" />
                    ) : (
                      <Search className="w-8 h-8 text-zinc-500" />
                    )}
                  </div>
                  <h4 className="text-lg font-medium text-zinc-300">
                    {holdings.length === 0
                      ? "No holdings yet"
                      : "No players found"}
                  </h4>
                  <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                    {holdings.length === 0 ? (
                      <>
                        Head to the{" "}
                        <Link
                          href="/market"
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          Market
                        </Link>{" "}
                        to start building your roster.
                      </>
                    ) : (
                      "Try adjusting your search."
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Activity History
                </h3>
              </div>
              {transactions.length > 0 ? (
                <div className="divide-y divide-zinc-800/50">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${tx.type === "BUY" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                        >
                          {tx.type === "BUY" ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">
                            {tx.player.name}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {new Date(tx.created_at).toLocaleString()} &bull;{" "}
                            {tx.type} {tx.quantity} share
                            {tx.quantity > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(tx.total_price)}
                        </div>
                        <div className="text-xs text-zinc-500">
                          @{formatCurrency(tx.price_per_share)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  No transactions yet. Make your first trade on the{" "}
                  <Link
                    href="/market"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Market
                  </Link>
                  .
                </div>
              )}
            </div>
          </main>

          {/* Right: Analytics */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Pie Chart */}
            {pieData.length > 0 && (
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
            )}

            {/* Top Performer */}
            {topPerformer && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Top Performer</h3>
                <div className="flex items-center gap-4 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                  <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-lg font-bold text-zinc-300">
                    {topPerformer.player.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-zinc-100">
                      {topPerformer.player.name}
                    </div>
                    <div className="text-xs text-zinc-500">
                      +
                      {formatCurrency(
                        (topPerformer.player.current_price -
                          topPerformer.avg_purchase_price) *
                          topPerformer.quantity
                      )}{" "}
                      (
                      {(
                        ((topPerformer.player.current_price -
                          topPerformer.avg_purchase_price) /
                          topPerformer.avg_purchase_price) *
                        100
                      ).toFixed(1)}
                      %)
                    </div>
                  </div>
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>

                {/* Underperformer */}
                {underperformer && underperformer.id !== topPerformer.id && (
                  <>
                    <h3 className="text-lg font-semibold mt-8 mb-4">
                      Underperforming
                    </h3>
                    <div className="flex items-center gap-4 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                      <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-lg font-bold text-zinc-300">
                        {underperformer.player.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-zinc-100">
                          {underperformer.player.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {formatCurrency(
                            (underperformer.player.current_price -
                              underperformer.avg_purchase_price) *
                              underperformer.quantity
                          )}{" "}
                          (
                          {(
                            ((underperformer.player.current_price -
                              underperformer.avg_purchase_price) /
                              underperformer.avg_purchase_price) *
                            100
                          ).toFixed(1)}
                          %)
                        </div>
                      </div>
                      <TrendingDown className="w-6 h-6 text-rose-500" />
                    </div>
                  </>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
