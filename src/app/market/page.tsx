import MarketPage from "@/components/MarketPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market | BuyLow",
};

export default function Market() {
  return <MarketPage />;
}
