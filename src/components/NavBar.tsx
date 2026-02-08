"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, Store, Trophy, LogOut, Wallet } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/market", label: "Market", icon: Store },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [cashBalance, setCashBalance] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setIsLoggedIn(true);
      const { data } = await supabase
        .from("profiles")
        .select("cash_balance")
        .eq("id", user.id)
        .single();
      if (data) setCashBalance(data.cash_balance);
    } else {
      setIsLoggedIn(false);
      setCashBalance(null);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUser();

    // Re-fetch when auth state changes or when navigating
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => fetchUser());

    return () => subscription.unsubscribe();
  }, [supabase, fetchUser]);

  // Refetch cash when navigating between pages (catches trades)
  useEffect(() => {
    fetchUser();
  }, [pathname, fetchUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Hide on login page
  if (pathname === "/login") return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        <Link
          href="/portfolio"
          className="text-lg font-bold tracking-tight text-zinc-100"
        >
          BuyLow
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {cashBalance !== null && (
            <div className="flex items-center gap-1.5 text-sm text-zinc-400">
              <Wallet className="w-3.5 h-3.5" />
              <span className="font-semibold text-zinc-200">
                ${cashBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          )}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-zinc-800/50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
