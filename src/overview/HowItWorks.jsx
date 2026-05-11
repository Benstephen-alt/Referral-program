import React from "react";
import { Link } from "react-router-dom";

const EXCHANGE_RATE = 1500;
const CYCLES_IN_120_DAYS = 20;

const stakeRows = [15, 35, 100, 300, 500, 800, 1000, 5000, 10000].map((amount) => {
  const naira = amount * EXCHANGE_RATE;
  const generated15 = amount * 0.15;
  const platform5 = amount * 0.05;
  const user10 = amount * 0.1;
  const totalRewards = user10 * CYCLES_IN_120_DAYS;
  const totalCapital = amount + totalRewards;

  return {
    amount,
    naira,
    generated15,
    platform5,
    user10,
    totalRewards,
    totalRewardsNaira: totalRewards * EXCHANGE_RATE,
    totalCapital,
    totalCapitalNaira: totalCapital * EXCHANGE_RATE,
  };
});

const referralRows = [
  { tier: "Manager", requirement: "5 Referrals", reward: "$3", cycle: "Every 10 Days" },
  { tier: "Controller", requirement: "12 Referrals", reward: "$7", cycle: "Every 10 Days" },
  { tier: "Chief Controller", requirement: "20 Referrals", reward: "$11", cycle: "Every 10 Days" },
];

function usd(value) {
  return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function ngn(value) {
  return `₦${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function HowItWorks() {
  return (
    <main className="page">
      <section className="overview-hero">
        <div className="hero-row">
          <div>
            <h1 className="page-title">How StakersPro Works</h1>
            <p className="page-subtitle user-subtitle">
              An overview of staking rewards, fund generation, referral rewards, and the affiliate program.
            </p>
          </div>
          <Link className="button-primary" to="/">Back to Dashboard</Link>
        </div>
      </section>

      <section className="overview-grid">
        <div className="overview-card">
          <div className="overview-icon">1</div>
          <h2 className="section-title">What is StakersPro?</h2>
          <p className="page-subtitle user-subtitle">
            StakersPro is an Indian decentralized staking platform that allows users to stake their funds for a minimum of
            <b> 120 days</b> with a total of <b>200% interest</b>, shared as <b>10% every 6 days</b>.
          </p>
        </div>

        <div className="overview-card">
          <div className="overview-icon">2</div>
          <h2 className="section-title">How Does It Generate Funds?</h2>
          <p className="page-subtitle user-subtitle">
            The platform charges a <b>0.2% fee</b> on every transaction. Staked funds are used by trusted traders who return
            <b> 15% every 6 days</b>. The platform retains <b>5%</b> and distributes <b>10%</b> to users. StakersPro also generates
            funds through investor support.
          </p>
        </div>
      </section>

      <section className="user-card card-common">
        <div className="reward-table-title">
          <div>
            <h2 className="section-title">3. How It Works – Staking Rewards</h2>
            <p className="page-subtitle user-subtitle">Exchange rate and reward breakdown over the 120-day staking period.</p>
          </div>
          <div className="actions-row">
            <div className="rate-pill">Exchange Rate: <span className="usd-strong">$1</span> = <span className="naira">₦1,500</span></div>
            <div className="rate-pill">Minimum Stake: <span className="usd-strong">$15</span> = <span className="naira">₦22,500</span></div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table rewards-table">
            <thead>
              <tr>
                <th className="th">Stake Amount</th>
                <th className="th">Naira Equivalent</th>
                <th className="th">Every 6 Days Generated 15%</th>
                <th className="th">Platform Share 5%</th>
                <th className="th">User Receives 10%</th>
                <th className="th">Total Rewards in 120 Days</th>
                <th className="th">Total Rewards in Naira</th>
                <th className="th">Total + Capital</th>
                <th className="th">Total + Capital in Naira</th>
              </tr>
            </thead>
            <tbody>
              {stakeRows.map((row) => (
                <tr key={row.amount}>
                  <td className="td usd-strong">{usd(row.amount)}</td>
                  <td className="td">{ngn(row.naira)}</td>
                  <td className="td">{usd(row.generated15)}</td>
                  <td className="td">{usd(row.platform5)}</td>
                  <td className="td naira">{usd(row.user10)}</td>
                  <td className="td">{usd(row.totalRewards)}</td>
                  <td className="td naira">{ngn(row.totalRewardsNaira)}</td>
                  <td className="td">{usd(row.totalCapital)}</td>
                  <td className="td naira">{ngn(row.totalCapitalNaira)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="footer-note">
          <b>Note:</b> Trusted traders generate 15% every 6 days using staked liquidity. 5% goes to the platform for sustainability,
          development, operations and liquidity management, while 10% is distributed to users as staking rewards.
        </div>
      </section>

      <section className="overview-grid" style={{ marginTop: 18 }}>
        <div className="overview-card">
          <div className="overview-icon">4</div>
          <h2 className="section-title">Referral Program</h2>
          <p className="page-subtitle user-subtitle">
            StakersPro rewards users who actively grow the platform. Referral rewards are processed on a shared global payout cycle
            and automatically released by the platform.
          </p>
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table className="table">
              <thead>
                <tr><th className="th">Tier</th><th className="th">Requirement</th><th className="th">Reward</th><th className="th">Cycle</th></tr>
              </thead>
              <tbody>
                {referralRows.map((row) => (
                  <tr key={row.tier}><td className="td">{row.tier}</td><td className="td">{row.requirement}</td><td className="td usd-strong">{row.reward}</td><td className="td">{row.cycle}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">5</div>
          <h2 className="section-title">Affiliate Program</h2>
          <p className="page-subtitle user-subtitle">Eligible affiliates are entitled to <b>$80 weekly</b> for contributing to community expansion.</p>
          <div className="info-list">
            <div className="info-row"><span className="info-label">Eligibility</span><span className="info-value">Stake minimum $200 or have 15 referrals</span></div>
            <div className="info-row"><span className="info-label">Group Requirement</span><span className="info-value">WhatsApp or Telegram group with 100 active stakers</span></div>
            <div className="info-row"><span className="info-label">Group Rule</span><span className="info-value">Members must not belong to another affiliate group</span></div>
            <div className="info-row"><span className="info-label">Monthly Growth</span><span className="info-value">At least 15 additional active stakers monthly</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
