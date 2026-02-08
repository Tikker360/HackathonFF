"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Store, Trophy } from "lucide-react";

const NAV_LINKS = [
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/market", label: "Market", icon: Store },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function NavBar() {
  const pathname = usePathname();

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
      </div>
    </nav>
  );
}
