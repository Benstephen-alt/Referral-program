import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className={isAdmin ? "theme-admin" : "theme-user"}>
      <header className="site-header">
        <div className="site-brand">Referral Rewards</div>

        <nav className="site-nav">
          {!isAdmin && (
            <>
              <Link
                className={location.pathname === "/" ? "nav-link active" : "nav-link"}
                to="/"
              >
                User Dashboard
              </Link>

              <Link
                className={location.pathname === "/how-it-works" ? "nav-link active" : "nav-link"}
                to="/how-it-works"
              >
                How It Works
              </Link>
            </>
          )}

          {isAdmin && (
            <Link className="nav-link active" to="/admin">
              Admin Panel
            </Link>
          )}
        </nav>
      </header>

      <Outlet />
    </div>
  );
}
