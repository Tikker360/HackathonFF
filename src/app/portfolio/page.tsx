import PortfolioDashboard from "@/components/PortfolioDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | BuyLow",
};

export default function Portfolio() {
  return <PortfolioDashboard />;
}
