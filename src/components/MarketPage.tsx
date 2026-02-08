"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Wallet,
  LayoutGrid,
  DollarSign,
  TrendingUp,
  TrendingDown,
  X,
  Loader2,
  Minus,
  Plus,
  FastForward,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { buyPlayer, sellPlayer } from "@/lib/trades";
import { formatCurrency } from "@/lib/format";

// --- Types ---

type Position = "QB" | "RB" | "WR" | "TE";
type SortOption =
  | "trending"
  | "price-high"
  | "price-low"
  | "change-high"
  | "change-low"
  | "alpha";
type TradeMode = "buy" | "sell";

interface MarketPlayer {
  id: string;
  name: string;
  position: Position;
  team: string;
  marketPrice: number;
  baselinePrice: number;
  owned: boolean;
  ownedQuantity: number;
  avgCost: number;
}

// --- Constants ---

const NFL_TEAMS = [
  "All Teams",
  "ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE",
  "DAL", "DEN", "DET", "GB", "HOU", "IND", "JAX", "KC", "LAC", "LAR",
  "LV", "MIA", "MIN", "NE", "NO", "NYG", "NYJ", "PHI", "PIT", "SEA",
  "SF", "TB", "TEN", "WAS",
];

const POSITIONS: (Position | "ALL")[] = ["ALL", "QB", "RB", "WR", "TE"];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "change-high", label: "Change: Best" },
  { value: "change-low", label: "Change: Worst" },
  { value: "alpha", label: "A-Z" },
];

// --- Helpers ---

const getInitial = (name: string) => name.charAt(0).toUpperCase();

// --- Component ---

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<Position | "ALL">(
    "ALL"
  );
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Trade panel state
  const [tradeMode, setTradeMode] = useState<Record<string, TradeMode>>({});
  const [tradeQuantity, setTradeQuantity] = useState<Record<string, number>>(
    {}
  );

  // Data state
  const [players, setPlayers] = useState<MarketPlayer[]>([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tradingId, setTradingId] = useState<string | null>(null);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);
  const [advancingDay, setAdvancingDay] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: playersData } = await supabase
      .from("players")
      .select("*")
      .order("name");

    let profile = null;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("cash_balance")
        .eq("id", user.id)
        .single();
      profile = data;
    }

    let holdingsMap: Record<
      string,
      { quantity: number; avg_purchase_price: number }
    > = {};
    if (user) {
      const { data: holdingsData } = await supabase
        .from("holdings")
        .select("player_id, quantity, avg_purchase_price")
        .eq("user_id", user.id);

      if (holdingsData) {
        holdingsData.forEach((h) => {
          holdingsMap[h.player_id] = {
            quantity: h.quantity,
            avg_purchase_price: h.avg_purchase_price,
          };
        });
      }
    }

    if (playersData) {
      const mapped: MarketPlayer[] = playersData.map((p) => {
        const holding = holdingsMap[p.id];
        return {
          id: p.id,
          name: p.name,
          position: p.position as Position,
          team: p.team,
          marketPrice: p.current_price,
          baselinePrice: p.baseline_price,
          owned: !!holding,
          ownedQuantity: holding?.quantity ?? 0,
          avgCost: holding?.avg_purchase_price ?? 0,
        };
      });
      setPlayers(mapped);
    }

    setCashBalance(profile?.cash_balance ?? 0);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clear toast after delay
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

  // --- Expand row with mode ---
  const expandWithMode = (playerId: string, mode: TradeMode) => {
    if (expandedRow === playerId && tradeMode[playerId] === mode) {
      // Already expanded with same mode — collapse
      setExpandedRow(null);
      return;
    }
    setExpandedRow(playerId);
    setTradeMode((prev) => ({ ...prev, [playerId]: mode }));
    setTradeQuantity((prev) => ({ ...prev, [playerId]: 1 }));
  };

  const getMode = (playerId: string): TradeMode =>
    tradeMode[playerId] ?? "buy";
  const getQuantity = (playerId: string): number =>
    tradeQuantity[playerId] ?? 1;

  const setQuantity = (playerId: string, qty: number) => {
    setTradeQuantity((prev) => ({ ...prev, [playerId]: qty }));
  };

  // --- Trade handlers ---
  const handleBuy = async (playerId: string, quantity: number = 1) => {
    setTradingId(playerId);
    setTradeError(null);
    try {
      const result = await buyPlayer(playerId, quantity);
      setTradeSuccess(
        `Bought ${result.quantity} share${result.quantity > 1 ? "s" : ""} for ${formatCurrency(result.total)}`
      );
      setExpandedRow(null);
      await fetchData();
    } catch (err) {
      setTradeError(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setTradingId(null);
    }
  };

  const handleSell = async (playerId: string, quantity: number = 1) => {
    setTradingId(playerId);
    setTradeError(null);
    try {
      const result = await sellPlayer(playerId, quantity);
      setTradeSuccess(
        `Sold ${result.quantity} share${result.quantity > 1 ? "s" : ""} for ${formatCurrency(result.total)}`
      );
      setExpandedRow(null);
      await fetchData();
    } catch (err) {
      setTradeError(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setTradingId(null);
    }
  };

  // --- Advance day ---
  const handleAdvanceDay = async () => {
    setAdvancingDay(true);
    setTradeError(null);
    try {
      const { data, error } = await supabase.rpc("advance_day");
      if (error) throw new Error(error.message);
      const result = data as { players_updated: number };
      setTradeSuccess(
        `Day advanced! ${result.players_updated} player prices updated.`
      );
      await fetchData();
    } catch (err) {
      setTradeError(
        err instanceof Error ? err.message : "Failed to advance day"
      );
    } finally {
      setAdvancingDay(false);
    }
  };

  // --- Computed ---
  const holdingsValue = useMemo(
    () =>
      players
        .filter((p) => p.owned)
        .reduce((sum, p) => sum + p.marketPrice * p.ownedQuantity, 0),
    [players]
  );
  const totalPortfolio = cashBalance + holdingsValue;

  const hasActiveFilters =
    searchTerm !== "" ||
    positionFilter !== "ALL" ||
    teamFilter !== "All Teams";

  const clearFilters = () => {
    setSearchTerm("");
    setPositionFilter("ALL");
    setTeamFilter("All Teams");
    setSortBy("trending");
  };

  const filteredPlayers = useMemo(() => {
    let result = [...players];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.team.toLowerCase().includes(term)
      );
    }

    if (positionFilter !== "ALL") {
      result = result.filter((p) => p.position === positionFilter);
    }

    if (teamFilter !== "All Teams") {
      result = result.filter((p) => p.team === teamFilter);
    }

    switch (sortBy) {
      case "trending": {
        result.sort((a, b) => {
          const aPct = Math.abs(
            ((a.marketPrice - a.baselinePrice) / a.baselinePrice) * 100
          );
          const bPct = Math.abs(
            ((b.marketPrice - b.baselinePrice) / b.baselinePrice) * 100
          );
          return bPct - aPct;
        });
        break;
      }
      case "price-high":
        result.sort((a, b) => b.marketPrice - a.marketPrice);
        break;
      case "price-low":
        result.sort((a, b) => a.marketPrice - b.marketPrice);
        break;
      case "change-high":
        result.sort(
          (a, b) =>
            (b.marketPrice - b.baselinePrice) / b.baselinePrice -
            (a.marketPrice - a.baselinePrice) / a.baselinePrice
        );
        break;
      case "change-low":
        result.sort(
          (a, b) =>
            (a.marketPrice - a.baselinePrice) / a.baselinePrice -
            (b.marketPrice - b.baselinePrice) / b.baselinePrice
        );
        break;
      case "alpha":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [players, searchTerm, positionFilter, teamFilter, sortBy]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
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

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "AVAILABLE CASH", value: cashBalance, icon: Wallet },
            {
              label: "HOLDINGS VALUE",
              value: holdingsValue,
              icon: LayoutGrid,
            },
            {
              label: "TOTAL PORTFOLIO",
              value: totalPortfolio,
              icon: DollarSign,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4"
            >
              <div className="p-2.5 bg-zinc-800 rounded-lg">
                <stat.icon className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-zinc-100">
                  {formatCurrency(stat.value)}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Search & Filters */}
        <section className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-5 py-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search NFL players..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-0.5 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-md transition-all ${
                    positionFilter === pos
                      ? "bg-zinc-700 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer appearance-none"
              style={{ backgroundImage: "none" }}
            >
              {NFL_TEAMS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer appearance-none"
              style={{ backgroundImage: "none" }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* Results Counter + Market Status + Skip Day */}
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-zinc-500">
            Showing{" "}
            <span className="font-semibold text-zinc-300">
              {filteredPlayers.length}
            </span>{" "}
            of {players.length} players
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleAdvanceDay}
              disabled={advancingDay}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-600/30 hover:bg-amber-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {advancingDay ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FastForward className="w-3.5 h-3.5" />
              )}
              Skip to Next Day
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                Market Live
              </span>
            </div>
          </div>
        </div>

        {/* Player Table */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3.5 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase border-b border-zinc-800/50 bg-zinc-900/60">
            <div className="col-span-5">Player</div>
            <div className="col-span-3 text-center">Market Price</div>
            <div className="col-span-2 text-center">24H Change</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          <div className="divide-y divide-zinc-800/40">
            {filteredPlayers.map((player) => {
              const change = player.marketPrice - player.baselinePrice;
              const changePct =
                player.baselinePrice > 0
                  ? (change / player.baselinePrice) * 100
                  : 0;
              const isPositive = change >= 0;
              const isExpanded = expandedRow === player.id;
              const isTrading = tradingId === player.id;
              const mode = getMode(player.id);
              const qty = getQuantity(player.id);

              // Calculations for the expanded panel
              const maxBuyShares =
                player.marketPrice > 0
                  ? Math.floor(cashBalance / player.marketPrice)
                  : 0;
              const maxSellShares = player.ownedQuantity;
              const maxShares =
                mode === "buy" ? maxBuyShares : maxSellShares;
              const totalCost = qty * player.marketPrice;
              const cashAfterBuy = cashBalance - totalCost;
              const sellProfit =
                (player.marketPrice - player.avgCost) * qty;
              const sellProfitPct =
                player.avgCost > 0
                  ? ((player.marketPrice - player.avgCost) / player.avgCost) *
                    100
                  : 0;

              return (
                <div key={player.id}>
                  {/* Main Row */}
                  <div
                    onClick={() =>
                      expandWithMode(
                        player.id,
                        player.owned ? "sell" : "buy"
                      )
                    }
                    className={`grid grid-cols-12 items-center px-6 py-4 cursor-pointer transition-colors hover:bg-zinc-800/20 ${
                      player.owned ? "bg-zinc-800/10" : ""
                    }`}
                  >
                    {/* Player Info */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300">
                          {getInitial(player.name)}
                        </div>
                        {player.owned && (
                          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100">
                            {player.name}
                          </span>
                          {player.owned && (
                            <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 uppercase">
                              {player.ownedQuantity} share
                              {player.ownedQuantity > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {player.position} &bull; {player.team}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-3 text-center">
                      <div className="text-sm font-bold text-zinc-100">
                        {formatCurrency(player.marketPrice)}
                      </div>
                    </div>

                    {/* 24H Change */}
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                        )}
                        <span
                          className={`text-sm font-bold ${
                            isPositive
                              ? "text-emerald-400"
                              : "text-rose-500"
                          }`}
                        >
                          {formatCurrency(Math.abs(change))}
                        </span>
                      </div>
                      <div
                        className={`text-xs ${
                          isPositive
                            ? "text-emerald-400/70"
                            : "text-rose-500/70"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {changePct.toFixed(2)}%
                      </div>
                    </div>

                    {/* Action — opens expanded row with mode */}
                    <div className="col-span-2 flex justify-end gap-2">
                      {player.owned && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            expandWithMode(player.id, "sell");
                          }}
                          className="text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-600/30 hover:bg-rose-600/30 transition-all"
                        >
                          Sell
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          expandWithMode(player.id, "buy");
                        }}
                        disabled={cashBalance < player.marketPrice}
                        className="text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Buy
                      </button>
                    </div>
                  </div>

                  {/* Expandable Trade Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 py-5 bg-zinc-900/80 border-t border-zinc-800/50">
                          {/* Mode toggle for owned players */}
                          {player.owned && (
                            <div className="flex items-center gap-0.5 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 w-fit mb-4">
                              <button
                                onClick={() => {
                                  setTradeMode((prev) => ({
                                    ...prev,
                                    [player.id]: "buy",
                                  }));
                                  setQuantity(player.id, 1);
                                }}
                                className={`text-xs font-semibold px-4 py-2 rounded-md transition-all ${
                                  mode === "buy"
                                    ? "bg-emerald-600 text-white"
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                Buy More
                              </button>
                              <button
                                onClick={() => {
                                  setTradeMode((prev) => ({
                                    ...prev,
                                    [player.id]: "sell",
                                  }));
                                  setQuantity(player.id, 1);
                                }}
                                className={`text-xs font-semibold px-4 py-2 rounded-md transition-all ${
                                  mode === "sell"
                                    ? "bg-rose-600 text-white"
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                Sell
                              </button>
                            </div>
                          )}

                          {/* Quantity selector + info grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Quantity selector */}
                            <div className="space-y-4">
                              <div>
                                <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">
                                  Shares to{" "}
                                  {mode === "buy" ? "Buy" : "Sell"}
                                </p>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() =>
                                      setQuantity(
                                        player.id,
                                        Math.max(1, qty - 1)
                                      )
                                    }
                                    disabled={qty <= 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <input
                                    type="number"
                                    min={1}
                                    max={maxShares}
                                    value={qty}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      if (!isNaN(val) && val >= 1) {
                                        setQuantity(
                                          player.id,
                                          Math.min(val, maxShares)
                                        );
                                      }
                                    }}
                                    className="w-20 h-10 text-center bg-zinc-950 border border-zinc-700 rounded-lg text-lg font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <button
                                    onClick={() =>
                                      setQuantity(
                                        player.id,
                                        Math.min(maxShares, qty + 1)
                                      )
                                    }
                                    disabled={qty >= maxShares}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <span className="text-xs text-zinc-500">
                                    Max: {maxShares} share
                                    {maxShares !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Trade summary */}
                            <div className="space-y-3">
                              {mode === "buy" ? (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                                      Total Cost
                                    </span>
                                    <span className="text-sm font-bold text-zinc-100">
                                      {formatCurrency(totalCost)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                                      Cash After
                                    </span>
                                    <span
                                      className={`text-sm font-bold ${cashAfterBuy < 0 ? "text-rose-500" : "text-zinc-200"}`}
                                    >
                                      {formatCurrency(cashAfterBuy)}
                                    </span>
                                  </div>
                                  {player.owned && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-zinc-500 uppercase tracking-wider">
                                        Current Position
                                      </span>
                                      <span className="text-sm text-zinc-300">
                                        {player.ownedQuantity} share
                                        {player.ownedQuantity > 1
                                          ? "s"
                                          : ""}{" "}
                                        @ {formatCurrency(player.avgCost)} avg
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                                      Sale Value
                                    </span>
                                    <span className="text-sm font-bold text-zinc-100">
                                      {formatCurrency(totalCost)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                                      Profit / Loss
                                    </span>
                                    <span
                                      className={`text-sm font-bold ${sellProfit >= 0 ? "text-emerald-400" : "text-rose-500"}`}
                                    >
                                      {sellProfit >= 0 ? "+" : ""}
                                      {formatCurrency(sellProfit)} (
                                      {sellProfitPct >= 0 ? "+" : ""}
                                      {sellProfitPct.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">
                                      Remaining
                                    </span>
                                    <span className="text-sm text-zinc-300">
                                      {player.ownedQuantity - qty} share
                                      {player.ownedQuantity - qty !== 1
                                        ? "s"
                                        : ""}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action button */}
                          <div className="mt-5 flex items-center gap-3">
                            {mode === "buy" ? (
                              <button
                                onClick={() => handleBuy(player.id, qty)}
                                disabled={
                                  isTrading ||
                                  qty < 1 ||
                                  totalCost > cashBalance
                                }
                                className="text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                              >
                                {isTrading && (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                )}
                                Buy {qty} share{qty > 1 ? "s" : ""} for{" "}
                                {formatCurrency(totalCost)}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSell(player.id, qty)}
                                disabled={isTrading || qty < 1}
                                className="text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                              >
                                {isTrading && (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                )}
                                Sell {qty} share{qty > 1 ? "s" : ""} for{" "}
                                {formatCurrency(totalCost)}
                              </button>
                            )}
                            {totalCost > cashBalance && mode === "buy" && (
                              <span className="text-xs text-rose-400">
                                Insufficient funds
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredPlayers.length === 0 && !loading && (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
                <Search className="w-8 h-8 text-zinc-500" />
              </div>
              <h4 className="text-lg font-medium text-zinc-300">
                {players.length === 0
                  ? "No players in the market yet"
                  : "No players found"}
              </h4>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-1">
                {players.length === 0
                  ? "Players need to be added to the database first."
                  : "Try adjusting your filters."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
