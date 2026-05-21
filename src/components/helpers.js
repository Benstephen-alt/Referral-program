export function formatWallet(wallet = "") {
  if (!wallet) return "-";
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}
export function formatNumber(value) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat().format(value);
}
export function getStatusTone(status) {
  switch ((status || "").toLowerCase()) {
    case "paid": return "success";
    case "pending": return "warning";
    case "failed": return "danger";
    default: return "neutral";
  }
}
export function getTierProgress(referrals) {
  const count = Number(referrals || 0);
  if (count >= 18) return { currentTierName: "Chief controller", currentReward: 30, nextTierName: null, nextTarget: 18, progressPercent: 100, remaining: 0 };
  if (count >= 10) return { currentTierName: "Controller", currentReward: 16, nextTierName: "Chief controller", nextTarget: 18, progressPercent: Math.min((count / 18) * 100, 100), remaining: 18 - count };
  if (count >= 5) return { currentTierName: "Manager", currentReward: 10, nextTierName: "Controller", nextTarget: 10, progressPercent: Math.min((count / 10) * 100, 100), remaining: 10 - count };
  return { currentTierName: "No tier yet", currentReward: 0, nextTierName: "Manager", nextTarget: 5, progressPercent: Math.min((count / 5) * 100, 100), remaining: 5 - count };
}
export function formatNextPayout(nextPayoutAt, eligible) {
  if (nextPayoutAt) return new Date(nextPayoutAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  if (eligible) return "Awaiting first global payout";
  return "Become eligible first";
}
