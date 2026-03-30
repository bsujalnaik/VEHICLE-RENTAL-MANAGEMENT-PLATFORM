import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useApp } from '../context/AppContext';
import './HomePage.css';

/* -------- Data (Static portions) -------- */
const services = [
  {
    number: '01',
    title: 'Curated Fleet',
    desc: 'Over 200 vehicles hand-selected for quality — sedans, SUVs, bikes, and commercial vans.',
  },
  {
    number: '02',
    title: 'Instant Booking',
    desc: 'Reserve in under 60 seconds. No paperwork, no queue at the counter.',
  },
  {
    number: '03',
    title: 'Secure Payments',
    desc: 'All transactions are bank-grade encrypted. Multiple payment methods accepted.',
  },
  {
    number: '04',
    title: 'Live Tracking',
    desc: 'Real-time rental status and return reminders pushed to your device.',
  },
];

const stats = [
  { value: '10K+', label: 'Active Clients' },
  { value: '200+', label: 'Vehicles in Fleet' },
  { value: '50+',  label: 'Cities Covered' },
  { value: '4.9',  label: 'Average Rating' },
];

const testimonials = [
  {
    quote: 'The booking took less than a minute. The SUV was pristine. Absolutely the best rental experience I have had in India.',
    author: 'Priya Sharma',
    role: 'Senior Architect, Mumbai',
  },
  {
    quote: 'DriveHub has become our company\'s go-to for executive transport. Reliable, discreet, and always on time.',
    author: 'Arvind Menon',
    role: 'Operations Director, Bangalore',
  },
  {
    quote: 'I was sceptical at first, but the fleet quality and support team converted me. Will not use any other service.',
    author: 'Riya Kapoor',
    role: 'Entrepreneur, Delhi',
  },
];

/* -------- IntersectionObserver hook -------- */
const useReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

/* -------- SVG Icons -------- */
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="7" cy="5.5" r="2.5"/>
    <path d="M7 13C7 13 2 8.5 2 5.5a5 5 0 0110 0C12 8.5 7 13 7 13z"/>
  </svg>
);

const IconQuote = () => (
  <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
    <path d="M0 18V9.9C0 4.3 3.5 1 10.5 0l1.2 2.1C8.2 3.2 6.3 5.3 6 8.4H10V18H0zm14 0V9.9C14 4.3 17.5 1 24.5 0l1.2 2.1C22.2 3.2 20.3 5.3 20 8.4H24V18H14z"
      fill="#C9A84C" fillOpacity="0.35"/>
  </svg>
);

/* -------- HomePage Component -------- */
const HomePage = () => {
  useReveal();
  const heroRef = useRef(null);
  const { vehicles } = useApp();

  const totalVehicles = vehicles.length > 0 ? vehicles.length : '200+';
  const uniqueCities = vehicles.length > 0 ? new Set(vehicles.map(v => v.location).filter(Boolean)).size : '50+';
  const availableVehicles = vehicles.length > 0 ? vehicles.filter(v => v.status === 'available').length : '200+';


  // Subtle parallax on scroll
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY * 0.3;
      heroRef.current.style.transform = `translateY(${y}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="homepage">

      {/* ============ HERO ============ */}
      <section className="hero" aria-label="Hero">
        {/* Layered background */}
        <div className="hero-bg-layer" ref={heroRef}>
          <div className="hero-grid-overlay" />
          <div className="hero-gradient-mesh" />
          <div className="hero-grain" />
        </div>

        {/* Large BG text */}
        <div className="hero-bg-text" aria-hidden="true">DRIVE</div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-label reveal">Premium Vehicle Rental Platform</div>

            <h1 className="hero-title reveal reveal-delay-1">
              Movement,<br />
              <em>Redefined.</em>
            </h1>

            <p className="hero-subtitle reveal reveal-delay-2">
              Choose from India's most curated fleet. From precision sedans to rugged SUVs —
              DriveHub delivers the vehicle your journey demands.
            </p>

            <div className="hero-actions reveal reveal-delay-3">
              <Link to="/vehicles" className="btn btn-primary btn-lg">
                Browse Fleet <IconArrow />
              </Link>
              <Link to="/signup" className="btn btn-secondary btn-lg">
                Open an Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SERVICES STRIP ============ */}
      <section className="section-services" aria-label="Services">
        <div className="container">
          <div className="section-head reveal">
            <span className="section-label">What We Offer</span>
            <div className="gold-rule" />
            <h2 className="section-title">
              Built for the<br />discerning driver.
            </h2>
          </div>

          {/* Asymmetric service grid — first card spans 2 cols */}
          <div className="services-grid">
            {services.map((s, i) => (
              <div
                key={i}
                className={`service-card reveal reveal-delay-${i + 1} ${i === 0 ? 'service-card-featured' : ''}`}
              >
                <span className="service-number">{s.number}</span>
                <div className="service-rule" />
                <h3 className="service-title">{s.title}</h3>
                <p className="service-desc">{s.desc}</p>
                {i === 0 && (
                  <Link to="/vehicles" className="service-link">
                    Explore fleet <IconArrow />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="section-how" aria-label="How it works">
        {/* Diagonal clip-path provides asymmetric visual break */}
        <div className="section-how-inner">
          <div className="container">
            <div className="how-layout">
              <div className="how-left reveal">
                <span className="section-label">Process</span>
                <div className="gold-rule" />
                <h2 className="section-title">On the road<br />in three steps.</h2>
                <p className="section-subtitle" style={{ marginTop: '16px' }}>
                  We removed every unnecessary step from the rental process
                  so you can focus on the drive.
                </p>
                <Link to="/vehicles" className="btn btn-primary" style={{ marginTop: '32px' }}>
                  Start Now <IconArrow />
                </Link>
              </div>

              <div className="how-right">
                {[
                  {
                    step: '01',
                    title: 'Browse the Fleet',
                    desc: 'Filter by vehicle type, fuel, capacity, and budget. Over 200 curated options.'
                  },
                  {
                    step: '02',
                    title: 'Book and Confirm',
                    desc: 'Select your rental dates, choose a plan, pay securely. Confirmation is instant.'
                  },
                  {
                    step: '03',
                    title: 'Drive',
                    desc: 'Pick up your vehicle from the designated point. Our team handles the rest.'
                  },
                ].map((item, i) => (
                  <div key={i} className={`how-step reveal reveal-delay-${i + 1}`}>
                    <div className="how-step-num">{item.step}</div>
                    <div className="how-step-body">
                      <h4 className="how-step-title">{item.title}</h4>
                      <p className="how-step-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ============ TESTIMONIALS ============ */}
      <section className="section-testimonials" aria-label="Testimonials">
        <div className="container">
          <div className="testimonials-head reveal">
            <span className="section-label">Client Voices</span>
            <div className="gold-rule" />
            <h2 className="section-title">Trusted by thousands<br />across India.</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className={`testimonial-card reveal reveal-delay-${i + 1}`}>
                <div className="testimonial-quote-icon">
                  <IconQuote />
                </div>
                <p className="testimonial-text">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.author}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="section-cta" aria-label="Call to action">
        <div className="cta-animated-bg" />
        <div className="container">
          <div className="cta-inner reveal">
            <div className="cta-label">Limited Time</div>
            <h2 className="cta-title">Your first rental.<br />20% off, automatically.</h2>
            <p className="cta-sub">
              Sign up today and the discount is applied at checkout — no code required.
            </p>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-primary btn-lg" id="cta-signup-btn">
                Create Account <IconArrow />
              </Link>
              <Link to="/vehicles" className="btn btn-ghost btn-lg">
                Browse Fleet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer" aria-label="Footer">
        <div className="footer-top-rule" />
        <div className="container">
          <div className="footer-layout">
            {/* Brand column */}
            <div className="footer-brand">
              <Logo size={30} showWordmark={true} />
              <p className="footer-tagline">
                Premium vehicle rentals for individuals and enterprises across India.
              </p>
              <div className="footer-location">
                <IconPin /> India — 50+ cities served
              </div>
            </div>

            {/* Links */}
            <div className="footer-nav">
              <div className="footer-nav-col">
                <div className="footer-nav-heading">Platform</div>
                <Link to="/vehicles" className="footer-link">Browse Fleet</Link>
                <Link to="/signup"   className="footer-link">Create Account</Link>
                <Link to="/login"    className="footer-link">Sign In</Link>
              </div>
              <div className="footer-nav-col">
                <div className="footer-nav-heading">Dashboards</div>
                <Link to="/admin"  className="footer-link">Admin Panel</Link>
                <Link to="/fleet"  className="footer-link">Fleet Manager</Link>
                <Link to="/rentals" className="footer-link">My Rentals</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} DriveHub Vehicle Rental Management Platform. All rights reserved.</p>
            <div className="footer-bottom-links">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
