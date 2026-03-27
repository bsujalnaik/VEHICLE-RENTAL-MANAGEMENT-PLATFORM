import { Link } from 'react-router-dom';
import './HomePage.css';

const features = [
  { icon: '🚗', title: 'Huge Fleet', desc: 'Choose from 200+ vehicles — cars, bikes, vans, and more.' },
  { icon: '⚡', title: 'Instant Booking', desc: 'Book in seconds. No paperwork, no waiting at the counter.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'All transactions are encrypted and 100% secure.' },
  { icon: '📍', title: 'Track Your Rental', desc: 'Real-time tracking and status updates on every ride.' },
  { icon: '📅', title: 'Flexible Plans', desc: 'Hourly, daily, or weekly — choose what works for you.' },
  { icon: '🎧', title: '24/7 Support', desc: 'Our team is always ready to help you, anytime.' },
];

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '200+', label: 'Vehicles Available' },
  { value: '50+', label: 'Cities Covered' },
  { value: '99.9%', label: 'Uptime' },
];

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">Trusted by 10,000+ drivers</div>
            <h1 className="hero-title">
              Drive Your Way,<br />
              <span className="hero-gradient">Pay as You Go</span>
            </h1>
            <p className="hero-subtitle">
              Find the perfect vehicle for every journey. From sleek sedans to
              powerful bikes — DriveHub gives you the wheels you need, when you need them.
            </p>
            <div className="hero-actions">
              <Link to="/vehicles" className="btn btn-primary btn-lg">
                🚘 Browse Vehicles
              </Link>
              <Link to="/signup" className="btn btn-secondary btn-lg">
                Create Account →
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="hero-stats">
              {stats.map((s, i) => (
                <div key={i} className="hero-stat">
                  <div className="hero-stat-value">{s.value}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-how">
        <div className="container">
          <div className="text-center mb-24">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get on the road in 3 simple steps</p>
          </div>
          <div className="how-steps">
            {[
              { step: '01', icon: '🔍', title: 'Browse & Filter', desc: 'Search from hundreds of vehicles using powerful filters for type, fuel, and budget.' },
              { step: '02', icon: '📋', title: 'Book & Pay', desc: 'Select your dates, review pricing, and pay securely in just a few clicks.' },
              { step: '03', icon: '🏁', title: 'Pick Up & Drive', desc: 'Collect the keys at the location and enjoy your journey with 24/7 support.' },
            ].map((step, i) => (
              <div key={i} className="how-step">
                <div className="step-number">{step.step}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-features">
        <div className="container">
          <div className="text-center mb-24">
            <h2 className="section-title">Why Choose DriveHub?</h2>
            <p className="section-subtitle">Everything you need for a seamless rental experience</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Hit the Road?</h2>
            <p>Join thousands of satisfied customers. Sign up and get your first rental at 20% off.</p>
            <div className="flex-center gap-16">
              <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/vehicles" className="btn btn-secondary btn-lg">
                Browse Vehicles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div>
              <div className="footer-logo">🚗 DriveHub</div>
              <p className="footer-tagline">Premium vehicle rentals made simple.</p>
            </div>
            <div className="footer-links">
              <Link to="/vehicles">Browse Vehicles</Link>
              <Link to="/login">Sign In</Link>
              <Link to="/signup">Register</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 DriveHub Vehicle Rental Management Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
