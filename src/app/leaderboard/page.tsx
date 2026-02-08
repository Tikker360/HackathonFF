import LeaderboardPage from "@/components/LeaderboardPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard | BuyLow",
};

export default function Leaderboard() {
  return <LeaderboardPage />;
}
