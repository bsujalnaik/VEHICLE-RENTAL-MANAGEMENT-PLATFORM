import { Link } from 'react-router-dom';
import './HomePage.css';

const features = [
  { icon: 'https://images.unsplash.com/photo-1542362567-b058c02b9ac8?w=100&q=80', title: 'Huge Fleet', desc: 'Choose from 200+ vehicles — cars, bikes, vans, and more.' },
  { icon: 'https://images.unsplash.com/photo-1512428559083-a40ce12044a5?w=100&q=80', title: 'Instant Booking', desc: 'Book in seconds. No paperwork, no waiting at the counter.' },
  { icon: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&q=80', title: 'Secure Payments', desc: 'All transactions are encrypted and 100% secure.' },
  { icon: 'https://images.unsplash.com/photo-1476703993599-0035a260f381?w=100&q=80', title: 'Track Your Rental', desc: 'Real-time tracking and status updates on every ride.' },
  { icon: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=100&q=80', title: 'Flexible Plans', desc: 'Hourly, daily, or weekly — choose what works for you.' },
  { icon: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&q=80', title: '24/7 Support', desc: 'Our team is always ready to help you, anytime.' },
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
            <div className="hero-badge">• Trusted by 10,000+ drivers</div>
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
                 Browse Vehicles
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
              { step: '01', icon: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&q=80', title: 'Browse & Filter', desc: 'Search from hundreds of vehicles using powerful filters for type, fuel, and budget.' },
              { step: '02', icon: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&q=80', title: 'Book & Pay', desc: 'Select your dates, review pricing, and pay securely in just a few clicks.' },
              { step: '03', icon: 'https://images.unsplash.com/photo-1556122530-f67520c71ef2?w=100&q=80', title: 'Pick Up & Drive', desc: 'Collect the keys at the location and enjoy your journey with 24/7 support.' },
            ].map((step, i) => (
              <div key={i} className="how-step">
                <div className="step-number">{step.step}</div>
                <div className="step-icon">
                  <img src={step.icon} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
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
                <div className="feature-icon">
                  <img src={f.icon} alt={f.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
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
              <Link to="/vehicles" className="btn" style={{ color: 'white', border: '2px solid rgba(255,255,255,0.4)' }}>
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
              <div className="footer-logo">• DriveHub</div>
              <p className="footer-tagline">Premium vehicle rentals made simple.</p>
            </div>
            <div className="footer-links">
              <Link to="/vehicles">Browse Vehicles</Link>
              <Link to="/login">Sign In</Link>
              <Link to="/signup">Register</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p> 2024 DriveHub Vehicle Rental Management Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
