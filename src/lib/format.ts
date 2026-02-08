export const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);

export const formatPercent = (val: number) =>
  `${val > 0 ? "+" : ""}${val.toFixed(2)}%`;

export const getPerformanceColor = (val: number) =>
  val >= 0 ? "text-emerald-400" : "text-rose-500";

export const getPerformanceBg = (val: number) =>
  val >= 0 ? "bg-emerald-400/10" : "bg-rose-500/10";
