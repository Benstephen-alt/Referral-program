import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJson } from "../components/api.js";
import { formatWallet, formatNumber, getTierProgress, getStatusTone, formatNextPayout } from "../components/helpers.js";

function StatCard({ title, value, subtext }) {
  return <div className="user-card card-common"><div className="card-title">{title}</div><div className="card-value">{value}</div>{subtext ? <div className="card-subtext">{subtext}</div> : null}</div>;
}
function Badge({ text, tone = "neutral" }) { return <span className={`badge ${tone}`}>{text}</span>; }

export default function UserDashboard() {
  const [walletAddress, setWalletAddress] = useState("");
  const [connectedWallet, setConnectedWallet] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tierProgress = useMemo(() => getTierProgress(statusData?.referralCountLifetime || 0), [statusData]);
  const totalPaid = useMemo(() => payoutHistory.filter((item) => String(item.status || "").toLowerCase() === "paid").reduce((sum, item) => sum + Number(item.amountUsd || 0), 0), [payoutHistory]);
  const nextPayoutLabel = useMemo(() => formatNextPayout(statusData?.nextPayoutAt, statusData?.eligible), [statusData]);

  async function connectWallet() {
    if (!window.ethereum) throw new Error("MetaMask is not installed.");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts?.[0]) throw new Error("No wallet connected.");
    const wallet = accounts[0].toLowerCase();
    setWalletAddress(wallet);
    setConnectedWallet(wallet);
    return wallet;
  }

  async function loadUserData(targetWallet) {
    try {
      setLoading(true); setError("");
      const wallet = (targetWallet || walletAddress || connectedWallet).toLowerCase();
      const [statusRes, payoutsRes] = await Promise.all([fetchJson(`/rewards/status/${wallet}`), fetchJson(`/rewards/payouts/${wallet}`)]);
      setStatusData(statusRes); setPayoutHistory(payoutsRes.payouts || []); setWalletAddress(wallet);
    } catch (err) {
      setError(err.message || "Failed to load referral dashboard."); setStatusData(null); setPayoutHistory([]);
    } finally { setLoading(false); }
  }

  return (
    <main className="page">
      <div className="hero-row">
        <div><h1 className="page-title">User Referral Dashboard</h1><p className="page-subtitle user-subtitle">Connect your wallet to view your referrals, payout history, current earnings level, and progress toward the next tier.</p></div>
        <div className="actions-row">
          {connectedWallet ? <div className="wallet-pill">Wallet: {formatWallet(connectedWallet)}</div> : null}
          <button className="button-primary" onClick={async () => { const wallet = await connectWallet(); await loadUserData(wallet); }}>{connectedWallet ? "Reconnect Wallet" : "Connect Wallet"}</button>
        </div>
      </div>


      <section className="overview-cta card-common">
        <div>
          <div className="overview-cta-title">Want to understand how StakersPro works?</div>
          <div className="overview-cta-text">
            Learn how staking rewards are calculated, how the platform generates funds, and how referral and affiliate programs work.
          </div>
        </div>
        <div className="overview-cta-box">
          <div className="section-title">Platform Overview</div>
          <p className="page-subtitle user-subtitle">
            View staking reward examples, including $5,000 and $10,000, with naira equivalents and total + capital.
          </p>
          <Link className="button-primary" to="/how-it-works">How StakersPro Works →</Link>
        </div>
      </section>

      <div className="user-card card-common" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <h2 className="section-title">Wallet Lookup</h2>
          <div className="actions-row">
            <input className="input" placeholder="Paste wallet address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
            <button className="button-secondary" onClick={() => loadUserData(walletAddress)} disabled={loading}>{loading ? "Loading..." : "Load Dashboard"}</button>
          </div>
        </div>
        <div className="info-list">
          <div className="info-row"><span className="info-label">Next payout day</span><span className="info-value">{nextPayoutLabel}</span></div>
          <div className="info-row"><span className="info-label">Payout method</span><span className="info-value">global payout every 10 days</span></div>
        </div>
        {!statusData && !error ? <div className="notice">Connect your wallet or paste your wallet address to load your referral dashboard.</div> : null}
        {error ? <div className="error-box">{error}</div> : null}
      </div>

      <div className="user-grid-4">
        <StatCard title="Total Referrals" value={formatNumber(statusData?.referralCountLifetime || 0)} />
        <StatCard title="Current Tier" value={statusData?.tierName || "No tier yet"} />
        <StatCard title="Current 10-Day Reward" value={`$${formatNumber(statusData?.payoutUsd || 0)}`} />
        <StatCard title="Total Paid Earnings" value={`$${formatNumber(totalPaid)}`} subtext="From paid payout history" />
      </div>

      <div className="user-grid-3">
        <div className="user-card card-common">
          <div className="section-header"><h2 className="section-title">Tier Progress</h2><Badge text={tierProgress.currentTierName} tone={statusData?.eligible ? "success" : "neutral"} /></div>
          <div className="info-list">
            <div className="info-row"><span className="info-label">Current reward level</span><span className="info-value">${tierProgress.currentReward}/10 days</span></div>
            <div className="info-row"><span className="info-label">Next tier</span><span className="info-value">{tierProgress.nextTierName || "Top tier reached"}</span></div>
            <div className="info-row"><span className="info-label">Referrals remaining</span><span className="info-value">{formatNumber(tierProgress.remaining)}</span></div>
          </div>
          <div className="progress-wrap"><div className="progress-bar"><div className="progress-fill" style={{ width: `${tierProgress.progressPercent}%` }} /></div><div className="progress-meta">Progress: {tierProgress.progressPercent.toFixed(0)}% toward {tierProgress.nextTierName || "maximum level"}</div></div>
        </div>

        <div className="user-card card-common">
          <div className="section-header"><h2 className="section-title">Earnings Summary</h2><Badge text={statusData?.eligible ? "Eligible" : "Not eligible"} tone={statusData?.eligible ? "success" : "warning"} /></div>
          <div className="info-list">
            <div className="info-row"><span className="info-label">Current 10-day reward</span><span className="info-value">${formatNumber(statusData?.payoutUsd || 0)}</span></div>
            <div className="info-row"><span className="info-label">Total paid so far</span><span className="info-value">${formatNumber(totalPaid)}</span></div>
            <div className="info-row"><span className="info-label">Last paid date</span><span className="info-value">{statusData?.lastPaidLabel || "-"}</span></div>
          </div>
        </div>

        <div className="user-card card-common">
          <div className="section-header"><h2 className="section-title">Wallet Details</h2></div>
          <div className="info-list">
            <div className="info-row"><span className="info-label">Wallet address</span><span className="info-value">{statusData?.walletAddress || "-"}</span></div>
            <div className="info-row"><span className="info-label">Last payout tx</span><span className="info-value">{statusData?.lastPayoutTxHash || "-"}</span></div>
            <div className="info-row"><span className="info-label">Next payout date</span><span className="info-value">{nextPayoutLabel}</span></div>
          </div>
        </div>
      </div>

      <div className="user-card card-common" style={{ marginTop: 22 }}>
        <div className="section-header"><h2 className="section-title">Payout History</h2></div>
        {payoutHistory.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th className="th">Payout Date</th><th className="th">Tier</th><th className="th">Amount</th><th className="th">Status</th><th className="th">Tx Hash</th></tr></thead>
              <tbody>
                {payoutHistory.map((item, idx) => (
                  <tr key={`${item.cycleKey}-${item.walletAddress || idx}`}>
                    <td className="td">{item.cycleKey || "-"}</td><td className="td">{item.tierName || "-"}</td><td className="td">${formatNumber(item.amountUsd || 0)}</td><td className="td"><Badge text={item.status || "unknown"} tone={getStatusTone(item.status)} /></td><td className="td">{item.txHash ? formatWallet(item.txHash) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state">No payout history found yet for this wallet.</div>}
      </div>
    </main>
  );
}
