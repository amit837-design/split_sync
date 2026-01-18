import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      {/* --- 2. HERO SECTION --- */}
      <header className="hero">
        <div className="hero-badge">
          <span>✨</span> v1.0.0 Now Live
        </div>

        <h1 className="hero-title">
          Sync Expenses.
          <br />
          Split Seamlessly.
        </h1>

        <p className="hero-sub">
          The modern financial operating system for your group trips, roommates,
          and daily expenses.
        </p>

        <div className="btn-group">
          {/* Link to Login */}
          <Link to="/signup_login" className="btn btn-secondary">
            Try Web App
          </Link>

          {/* Download APK */}
          <a href="/split.apk" download className="btn btn-primary">
            Download App <span>⬇</span>
          </a>
        </div>
      </header>

      {/* --- 3. INFINITE MARQUEE --- */}
      <div className="marquee-strip">
        <div className="marquee-content">
          <span>Real-time Sync</span> • <span>Offline First</span> •{" "}
          <span>Secure Payments</span> • <span>Fair Settlement</span> •
          <span>Real-time Sync</span> • <span>Offline First</span> •{" "}
          <span>Secure Payments</span> • <span>Fair Settlement</span> •
          <span>Real-time Sync</span> • <span>Offline First</span> •{" "}
          <span>Secure Payments</span> • <span>Fair Settlement</span>
        </div>
      </div>

      {/* --- 4. BENTO GRID FEATURES --- */}
      <section className="container" id="features">
        <h2 className="section-title">Everything you need.</h2>

        <div className="bento-grid">
          {/* Card 1: Wide (Instant Sync) */}
          <div className="feature-card span-2">
            <div className="icon-box">⚡</div>
            <div>
              <h3 className="card-title">Instant Synchronization</h3>
              <p className="card-desc">
                Our custom backend ensures changes reflect across all devices in
                milliseconds. Built for speed, reliability, and accuracy.
              </p>
            </div>
          </div>

          {/* Card 2: Square (Secure) */}
          <div className="feature-card">
            <div className="icon-box">🛡️</div>
            <div>
              <h3 className="card-title">Secure Core</h3>
              <p className="card-desc">
                End-to-end encryption for all data. Your finances stay private.
              </p>
            </div>
          </div>

          {/* Card 3: Tall (Native App) */}
          <div className="feature-card row-span-2">
            <div className="icon-box">📱</div>
            <div style={{ marginTop: "auto" }}>
              <h3 className="card-title">Native Android Experience</h3>
              <p className="card-desc">
                Fluid animations, haptic feedback, and a design that feels right
                at home on your phone. Works completely offline when you lose
                signal.
              </p>
            </div>
          </div>

          {/* Card 4: Square (Analytics) */}
          <div className="feature-card">
            <div className="icon-box">📊</div>
            <div>
              <h3 className="card-title">Deep Analytics</h3>
              <p className="card-desc">
                Visualize monthly spending trends and category breakdowns.
              </p>
            </div>
          </div>

          {/* Card 5: Square (Fair Play) */}
          <div className="feature-card">
            <div className="icon-box">🤝</div>
            <div>
              <h3 className="card-title">Fair Settlements</h3>
              <p className="card-desc">
                Smart algorithm minimizes the number of transactions needed to
                settle up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. FOOTER --- */}
      <footer className="footer">
        <div className="container">
          <p>
            &copy; {new Date().getFullYear()} SplitSync Inc. All rights
            reserved.
          </p>
          <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
            <a
              href="mailto:splitsync.noreply@gmail.com"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              splitsync.noreply@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
