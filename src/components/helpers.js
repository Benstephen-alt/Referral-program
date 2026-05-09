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
  if (count >= 20) return { currentTierName: "Chief controller", currentReward: 11, nextTierName: null, nextTarget: 20, progressPercent: 100, remaining: 0 };
  if (count >= 12) return { currentTierName: "Controller", currentReward: 7, nextTierName: "Chief controller", nextTarget: 20, progressPercent: Math.min((count / 20) * 100, 100), remaining: 20 - count };
  if (count >= 5) return { currentTierName: "Manager", currentReward: 3, nextTierName: "Controller", nextTarget: 12, progressPercent: Math.min((count / 12) * 100, 100), remaining: 12 - count };
  return { currentTierName: "No tier yet", currentReward: 0, nextTierName: "Manager", nextTarget: 5, progressPercent: Math.min((count / 5) * 100, 100), remaining: 5 - count };
}
export function formatNextPayout(nextPayoutAt, eligible) {
  if (nextPayoutAt) return new Date(nextPayoutAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  if (eligible) return "Awaiting first global payout";
  return "Become eligible first";
}
