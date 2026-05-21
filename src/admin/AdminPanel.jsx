import React, { useEffect, useMemo, useState } from "react";
import { fetchJson } from "../components/api.js";
import { formatWallet, formatNumber, getStatusTone } from "../components/helpers.js";

function StatCard({ title, value, subtext }) {
  return <div className="admin-card card-common"><div className="card-title">{title}</div><div className="card-value">{value}</div>{subtext ? <div className="card-subtext">{subtext}</div> : null}</div>;
}
function Badge({ text, tone = "neutral" }) { return <span className={`badge ${tone}`}>{text}</span>; }

export default function AdminPanel() {
  const [walletAddress, setWalletAddress] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("admin_jwt") || "");
  const [authLoading, setAuthLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [usersData, setUsersData] = useState({ users: [], total: 0, page: 1, totalPages: 1 });
  const [payoutsData, setPayoutsData] = useState({ payouts: [], total: 0, page: 1, totalPages: 1 });
  const [syncData, setSyncData] = useState(null);
  const [logsData, setLogsData] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({ payout: false, resync: false, logs: false });
  const [resyncStartBlock, setResyncStartBlock] = useState("50634382");
  const [userFilters, setUserFilters] = useState({ page: 1, limit: 10, tier: "", eligible: "", search: "" });
  const [payoutFilters, setPayoutFilters] = useState({ page: 1, limit: 10, cycleKey: "", status: "", wallet: "" });
  const isLoggedIn = useMemo(() => Boolean(token), [token]);

  useEffect(() => { if (token) loadDashboard(); }, [token]);
  useEffect(() => { if (token) loadUsers(); }, [token, userFilters.page, userFilters.limit, userFilters.tier, userFilters.eligible]);
  useEffect(() => { if (token) loadPayouts(); }, [token, payoutFilters.page, payoutFilters.limit, payoutFilters.cycleKey, payoutFilters.status]);

  async function connectWallet() {
    if (!window.ethereum) throw new Error("MetaMask is not installed.");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts?.[0]) throw new Error("No wallet connected.");
    setWalletAddress(accounts[0]);
    return accounts[0];
  }

  async function handleLogin() {
    try {
      setAuthLoading(true); setError("");
      const address = (walletAddress || (await connectWallet())).toLowerCase();
      const nonceData = await fetchJson("/admin/auth/nonce", null, { method: "POST", body: JSON.stringify({ walletAddress: address }) });
      const signature = await window.ethereum.request({ method: "personal_sign", params: [nonceData.message, address] });
      const verifyData = await fetchJson("/admin/auth/verify", null, { method: "POST", body: JSON.stringify({ walletAddress: address, signature }) });
      localStorage.setItem("admin_jwt", verifyData.token); setToken(verifyData.token); setWalletAddress(address);
    } catch (err) { setError(err.message || "Admin login failed."); }
    finally { setAuthLoading(false); }
  }

  function handleLogout() {
    localStorage.removeItem("admin_jwt"); setToken(""); setOverview(null); setUsersData({ users: [], total: 0, page: 1, totalPages: 1 }); setPayoutsData({ payouts: [], total: 0, page: 1, totalPages: 1 }); setSyncData(null); setLogsData([]);
  }

  async function loadDashboard() {
    try {
      setLoading(true); setError(""); setSuccess("");
      const [overviewRes, syncRes, logsRes] = await Promise.all([fetchJson("/admin/overview", token), fetchJson("/admin/sync", token), fetchJson("/admin/logs?limit=80", token)]);
      setOverview(overviewRes); setSyncData(syncRes); setLogsData(logsRes.logs || []); await Promise.all([loadUsers(), loadPayouts()]);
    } catch (err) {
      setError(err.message || "Failed to load dashboard."); if (/401|403|token/i.test(err.message || "")) handleLogout();
    } finally { setLoading(false); }
  }

  async function loadUsers() {
    try {
      const params = new URLSearchParams(); params.set("page", String(userFilters.page)); params.set("limit", String(userFilters.limit));
      if (userFilters.tier !== "") params.set("tier", userFilters.tier);
      if (userFilters.eligible !== "") params.set("eligible", userFilters.eligible);
      if (userFilters.search.trim()) params.set("search", userFilters.search.trim().toLowerCase());
      const data = await fetchJson(`/admin/users?${params.toString()}`, token); setUsersData(data);
    } catch (err) { setError(err.message || "Failed to load users."); }
  }

  async function loadPayouts() {
    try {
      const params = new URLSearchParams(); params.set("page", String(payoutFilters.page)); params.set("limit", String(payoutFilters.limit));
      if (payoutFilters.cycleKey.trim()) params.set("cycleKey", payoutFilters.cycleKey.trim());
      if (payoutFilters.status.trim()) params.set("status", payoutFilters.status.trim());
      if (payoutFilters.wallet.trim()) params.set("wallet", payoutFilters.wallet.trim().toLowerCase());
      const data = await fetchJson(`/admin/payouts?${params.toString()}`, token); setPayoutsData(data);
    } catch (err) { setError(err.message || "Failed to load payouts."); }
  }

  async function loadLogs() {
    try { setActionLoading((p) => ({ ...p, logs: true })); const data = await fetchJson("/admin/logs?limit=120", token); setLogsData(data.logs || []); }
    catch (err) { setError(err.message || "Failed to load logs."); }
    finally { setActionLoading((p) => ({ ...p, logs: false })); }
  }

  async function handleManualPayout() {
    try {
      setError(""); setSuccess(""); setActionLoading((p) => ({ ...p, payout: true }));
      const data = await fetchJson("/admin/actions/run-payout-cycle", token, { method: "POST", body: JSON.stringify({}) });
      setSuccess(data.message || "10-day payout executed."); await loadDashboard();
    } catch (err) { setError(err.message || "Manual 10-day payout failed."); }
    finally { setActionLoading((p) => ({ ...p, payout: false })); }
  }

  async function handleManualResync() {
    try {
      setError(""); setSuccess(""); setActionLoading((p) => ({ ...p, resync: true }));
      const data = await fetchJson("/admin/actions/resync", token, { method: "POST", body: JSON.stringify({ startBlock: Number(resyncStartBlock) }) });
      setSuccess(data.message || "Manual resync completed."); await loadDashboard();
    } catch (err) { setError(err.message || "Manual resync failed."); }
    finally { setActionLoading((p) => ({ ...p, resync: false })); }
  }

  const overviewCards = overview?.overview || {}; const treasury = overview?.treasury || {}; const tiers = overview?.tiers || {};
  if (!isLoggedIn) return <main className="page"><div className="login-panel"><div className="admin-card card-common"><h1 className="page-title">Referral Rewards Admin Panel</h1><p className="page-subtitle admin-subtitle">ADMIN? oK!!.</p><button className="button-primary" onClick={handleLogin} disabled={authLoading}>{authLoading ? "Signing in..." : "Connect MetaMask & Sign In"}</button>{walletAddress ? <div className="admin-pill" style={{ marginTop: 14 }}>Connected wallet: {walletAddress}</div> : null}{error ? <div className="error-box">{error}</div> : null}</div></div></main>;

  return (
    <main className="page">
      <div className="top-row"><div><h1 className="page-title">Referral Rewards Admin Panel</h1><p className="page-subtitle admin-subtitle">Manual 10-day payout control, resync-from-block, and recent backend logs.</p></div><div className="actions-row"><div className="admin-pill">Admin: {formatWallet(walletAddress)}</div><button className="button-secondary" onClick={loadDashboard} disabled={loading}>{loading ? "Refreshing..." : "Refresh"}</button><button className="button-ghost" onClick={handleLogout}>Logout</button></div></div>
      {error ? <div className="error-box">{error}</div> : null}
      {success ? <div className="success-box">{success}</div> : null}
      <div className="admin-grid-4"><StatCard title="Total Users" value={formatNumber(overviewCards.totalUsers)} /><StatCard title="Eligible Users" value={formatNumber(overviewCards.totalEligibleUsers)} /><StatCard title="Total Referrals" value={formatNumber(overviewCards.totalReferrals)} /><StatCard title="Paid In Last 10 Days" value={formatNumber(overviewCards.paidInWindow)} subtext="Rolling 10-day window" /></div>
      <div className="admin-grid-3"><StatCard title="Manager" value={formatNumber(tiers.tier1)} subtext="$10 every 10 days" /><StatCard title="Controller" value={formatNumber(tiers.tier2)} subtext="$16 every 10 days • 10 referrals" /><StatCard title="Chief controller" value={formatNumber(tiers.tier3)} subtext="$30 every 10 days • 18 referrals" /></div>
      <div className="admin-grid-2"><div className="admin-card card-common"><div className="section-header"><h2 className="section-title">Treasury</h2></div><div className="info-list"><div className="info-row"><span className="info-label">Wallet</span><span className="info-value">{treasury.walletAddress || "-"}</span></div><div className="info-row"><span className="info-label">USDT Balance</span><span className="info-value">{treasury.usdtBalance || "0"}</span></div><div className="info-row"><span className="info-label">BNB Balance</span><span className="info-value">{treasury.bnbBalance || "0"}</span></div></div></div><div className="admin-card card-common"><div className="section-header"><h2 className="section-title">Sync Status</h2></div><div className="info-list"><div className="info-row"><span className="info-label">Last Synced Block</span><span className="info-value">{formatNumber(syncData?.lastSyncedBlock)}</span></div><div className="info-row"><span className="info-label">Latest Chain Block</span><span className="info-value">{formatNumber(syncData?.latestChainBlock)}</span></div><div className="info-row"><span className="info-label">Sync Lag</span><span className="info-value">{formatNumber(syncData?.syncLag)}</span></div><div className="info-row"><span className="info-label">Updated At</span><span className="info-value">{syncData?.updatedAt ? new Date(syncData.updatedAt).toLocaleString() : "-"}</span></div></div></div></div>
      <div className="admin-grid-action"><div className="admin-card card-common"><div className="section-header"><h2 className="section-title">Manual 10-Day Payout</h2></div><p className="page-subtitle admin-subtitle">There is no automatic payout. This action only runs when you press the button.</p><button className="button-primary" onClick={handleManualPayout} disabled={actionLoading.payout}>{actionLoading.payout ? "Running payout..." : "Run 10-Day Payout Now"}</button></div><div className="admin-card card-common"><div className="section-header"><h2 className="section-title">Manual Resync From Block</h2></div><p className="page-subtitle admin-subtitle">Reset the sync pointer and immediately resync from the block you enter.</p><div className="actions-row"><input className="input" value={resyncStartBlock} onChange={(e) => setResyncStartBlock(e.target.value)} placeholder="Start block" /><button className="button-danger" onClick={handleManualResync} disabled={actionLoading.resync}>{actionLoading.resync ? "Resyncing..." : "Reset & Resync"}</button></div></div></div>
      <div className="admin-card card-common" style={{ marginTop: 22 }}><div className="section-header"><h2 className="section-title">User Table</h2><div className="actions-row"><input className="input" placeholder="Search wallet" value={userFilters.search} onChange={(e) => setUserFilters((p) => ({ ...p, search: e.target.value, page: 1 }))} /><select className="select" value={userFilters.tier} onChange={(e) => setUserFilters((p) => ({ ...p, tier: e.target.value, page: 1 }))}><option value="">All tiers</option><option value="1">Manager</option><option value="2">Controller</option><option value="3">Chief controller</option></select><select className="select" value={userFilters.eligible} onChange={(e) => setUserFilters((p) => ({ ...p, eligible: e.target.value, page: 1 }))}><option value="">All users</option><option value="true">Eligible</option><option value="false">Not eligible</option></select><button className="button-secondary" onClick={loadUsers}>Apply</button></div></div>{usersData.users?.length ? <div className="table-wrap"><table className="table"><thead><tr><th className="th">Wallet</th><th className="th">Referrals</th><th className="th">Tier</th><th className="th">Reward</th><th className="th">Last Paid Date</th><th className="th">Next Payout</th></tr></thead><tbody>{usersData.users.map((user) => <tr key={user.walletAddress}><td className="td">{formatWallet(user.walletAddress)}</td><td className="td">{formatNumber(user.referralCountLifetime)}</td><td className="td">{user.tierName ? <Badge text={user.tierName} /> : <Badge text="None" tone="neutral" />}</td><td className="td">${user.payoutUsd || 0}</td><td className="td">{user.lastPaidLabel || "-"}</td><td className="td">{user.nextPayoutAt ? new Date(user.nextPayoutAt).toLocaleDateString() : "-"}</td></tr>)}</tbody></table></div> : <div className="empty-state">No users found for the current filters.</div>}<div className="pagination"><button className="button-ghost" disabled={usersData.page <= 1} onClick={() => setUserFilters((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}>Previous</button><span>Page {usersData.page || 1} of {usersData.totalPages || 1}</span><button className="button-ghost" disabled={(usersData.page || 1) >= (usersData.totalPages || 1)} onClick={() => setUserFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}>Next</button></div></div>
      <div className="admin-card card-common" style={{ marginTop: 22 }}><div className="section-header"><h2 className="section-title">Payout Table</h2><div className="actions-row"><input className="input" placeholder="Wallet" value={payoutFilters.wallet} onChange={(e) => setPayoutFilters((p) => ({ ...p, wallet: e.target.value, page: 1 }))} /><input className="input" placeholder="Payout date e.g. 2026-04-19" value={payoutFilters.cycleKey} onChange={(e) => setPayoutFilters((p) => ({ ...p, cycleKey: e.target.value, page: 1 }))} /><select className="select" value={payoutFilters.status} onChange={(e) => setPayoutFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}><option value="">All statuses</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option></select><button className="button-secondary" onClick={loadPayouts}>Apply</button></div></div>{payoutsData.payouts?.length ? <div className="table-wrap"><table className="table"><thead><tr><th className="th">Wallet</th><th className="th">Payout Date</th><th className="th">Tier</th><th className="th">Amount</th><th className="th">Status</th><th className="th">Tx Hash</th></tr></thead><tbody>{payoutsData.payouts.map((item) => <tr key={`${item.walletAddress}-${item.cycleKey}`}><td className="td">{formatWallet(item.walletAddress)}</td><td className="td">{item.cycleKey || "-"}</td><td className="td">{item.tierName ? <Badge text={item.tierName} /> : "-"}</td><td className="td">${item.amountUsd || 0}</td><td className="td"><Badge text={item.status || "unknown"} tone={getStatusTone(item.status)} /></td><td className="td">{item.txHash ? formatWallet(item.txHash) : "-"}</td></tr>)}</tbody></table></div> : <div className="empty-state">No payout records found for the current filters.</div>}<div className="pagination"><button className="button-ghost" disabled={payoutsData.page <= 1} onClick={() => setPayoutFilters((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}>Previous</button><span>Page {payoutsData.page || 1} of {payoutsData.totalPages || 1}</span><button className="button-ghost" disabled={(payoutsData.page || 1) >= (payoutsData.totalPages || 1)} onClick={() => setPayoutFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}>Next</button></div></div>
      <div className="admin-card card-common" style={{ marginTop: 22 }}><div className="section-header"><h2 className="section-title">Recent Backend Logs</h2><button className="button-secondary" onClick={loadLogs} disabled={actionLoading.logs}>{actionLoading.logs ? "Refreshing logs..." : "Refresh Logs"}</button></div><textarea className="textarea" readOnly value={(logsData || []).map((log) => `[${log.timestamp}] ${log.level.toUpperCase()} - ${log.message}${log.meta ? " " + JSON.stringify(log.meta) : ""}`).join("\n")} /></div>
    </main>
  );
}
