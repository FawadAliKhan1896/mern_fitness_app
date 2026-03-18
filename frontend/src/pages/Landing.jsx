import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  WorkoutIcon, NutritionIcon, ChartIcon, BellIcon, TargetIcon,
  ClipBoardIcon, UtensilsIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon,
} from '../components/Icons';
import FitnessChatbot from '../components/FitnessChatbot';
import './Landing.css';

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const HERO_SLIDES = [
  {
    title: 'Build a Perfect Health Growth',
    subtitle: 'Track workouts, nutrition, and progress in one place. Transform your body and mind with data-driven insights.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  },
  {
    title: 'Your Workouts, Your Way',
    subtitle: 'Log every rep, set, and weight. Build custom routines, track performance trends, and never miss a session.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  },
  {
    title: 'Nutrition Made Simple',
    subtitle: 'Monitor calories and macros with ease. Smart logging, daily trends, and exportable reports keep you on track.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  },
];

export default function Landing() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const { user } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setHeroSlide((s) => (s + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setHeroSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const t = setInterval(nextSlide, 5000);
    return () => clearInterval(t);
  }, [nextSlide]);

  if (user) {
    return (
      <div className="landing">
        <div className="landing-bg">
          <div className="landing-orb orb-1" />
          <div className="landing-orb orb-2" />
          <div className="landing-orb orb-3" />
        </div>
        <nav className="landing-nav glass">
          <span className="landing-logo">Fitness Tracker</span>
          <div className="landing-nav-links">
            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
          </div>
        </nav>
        <section id="hero" className="landing-hero">
          <div className="hero-content glass animate-fade-up">
            <h1 className="animate-fade-up" style={{ animationDelay: '0.1s' }}>Build a Perfect Health Growth</h1>
            <p className="animate-fade-up" style={{ animationDelay: '0.2s' }}>Track your workouts, nutrition, and progress in one place. Your fitness journey starts here.</p>
            <Link to="/dashboard" className="btn btn-primary btn-glow animate-fade-up" style={{ animationDelay: '0.3s' }}>Go to Dashboard</Link>
          </div>
        </section>
        <FitnessChatbot />
      </div>
    );
  }

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="landing-orb orb-1" />
        <div className="landing-orb orb-2" />
        <div className="landing-orb orb-3" />
        <div className="landing-grid" />
      </div>

      <nav className={`landing-nav glass ${navOpen ? 'open' : ''}`}>
        <Link to="/" className="landing-logo">Fitness Tracker</Link>
        <button type="button" className="nav-toggle" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>
        <div className="landing-nav-menu">
          <button type="button" className="nav-item" onClick={() => { scrollToSection('hero'); setNavOpen(false); }}>Hero</button>
          <button type="button" className="nav-item" onClick={() => { scrollToSection('services'); setNavOpen(false); }}>Services</button>
          <button type="button" className="nav-item" onClick={() => { scrollToSection('about'); setNavOpen(false); }}>About Us</button>
          <button type="button" className="nav-item" onClick={() => { scrollToSection('benefits'); setNavOpen(false); }}>Benefits</button>
          <button type="button" className="nav-item" onClick={() => { scrollToSection('pricing'); setNavOpen(false); }}>Pricing</button>
          <button type="button" className="nav-item" onClick={() => { scrollToSection('reviews'); setNavOpen(false); }}>Reviews</button>
          <button type="button" className="nav-item" onClick={() => { scrollToSection('footer'); setNavOpen(false); }}>Footer</button>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="nav-link">Log In</Link>
          <Link to="/register" className="btn btn-primary">Join Now</Link>
        </div>
      </nav>

      <section id="hero" className="landing-hero">
        <div className="hero-layout">
          <div className="hero-text">
            <div className="hero-content glass">
              <span className="hero-badge glass">Your fitness companion</span>
              <div className="hero-slides-wrap">
                {HERO_SLIDES.map((slide, i) => (
                  <div
                    key={i}
                    className={`hero-slide ${i === heroSlide ? 'active' : ''}`}
                    aria-hidden={i !== heroSlide}
                  >
                    <h1>{slide.title}</h1>
                    <p>{slide.subtitle}</p>
                  </div>
                ))}
              </div>
              <div className="hero-cta">
                <Link to="/register" className="btn btn-primary btn-glow">Get Started Free</Link>
                <Link to="/login" className="btn btn-glass">Log In</Link>
              </div>
              <div className="hero-slider-controls">
                <button type="button" onClick={prevSlide} className="slider-btn" aria-label="Previous slide">
                  <ChevronLeftIcon size={20} />
                </button>
                <div className="slider-dots">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`slider-dot ${i === heroSlide ? 'active' : ''}`}
                      onClick={() => setHeroSlide(i)}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
                <button type="button" onClick={nextSlide} className="slider-btn" aria-label="Next slide">
                  <ChevronRightIcon size={20} />
                </button>
              </div>
            </div>
            <div className="hero-visual animate-float">
              <div className="stat-pill glass"><span className="stat-num">500+</span><span className="stat-label">Workouts</span></div>
              <div className="stat-pill glass"><span className="stat-num">10K+</span><span className="stat-label">Calories Tracked</span></div>
              <div className="stat-pill glass"><span className="stat-num">24/7</span><span className="stat-label">Progress</span></div>
            </div>
          </div>
          <div className="hero-image-wrap">
            <div className="hero-image-frame glass">
              {HERO_SLIDES.map((slide, i) => (
                <div
                  key={i}
                  className={`hero-image-slide ${i === heroSlide ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="landing-section landing-services">
        <div className="container">
          <h2 className="section-title animate-on-scroll">Our Services</h2>
          <p className="section-subtitle animate-on-scroll">Comprehensive tools to support every aspect of your fitness journey</p>
          <div className="services-grid">
            <div className="service-card glass animate-on-scroll">
              <div className="service-icon"><ClipBoardIcon size={28} /></div>
              <h3>Workout Tracking</h3>
              <p>Log exercises with sets, reps, weights, and categories. Organize routines and track performance over time.</p>
            </div>
            <div className="service-card glass animate-on-scroll">
              <div className="service-icon"><UtensilsIcon size={28} /></div>
              <h3>Nutrition Logging</h3>
              <p>Record meals, calories, and macros. Monitor daily intake and stay aligned with your dietary goals.</p>
            </div>
            <div className="service-card glass animate-on-scroll">
              <div className="service-icon"><ChartIcon size={28} /></div>
              <h3>Progress Analytics</h3>
              <p>Visualize trends with charts and graphs. Track weight, measurements, and performance metrics.</p>
            </div>
            <div className="service-card glass animate-on-scroll">
              <div className="service-icon"><BellIcon size={28} /></div>
              <h3>Reminders & Export</h3>
              <p>Set workout and meal reminders. Export reports in JSON or CSV for your records.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="landing-section landing-about">
        <div className="container">
          <div className="about-inner glass animate-on-scroll">
            <div className="about-content">
              <h2 className="section-title">About Us</h2>
              <p className="about-lead">We believe everyone deserves access to tools that make fitness tracking simple, insightful, and motivating—without the overwhelm.</p>
              <p>Fitness Tracker was born from a simple observation: most people know what to do, but struggle with consistency. We built a platform that removes friction—log workouts in seconds, track nutrition without guesswork, and see your progress visualized clearly. Whether you are taking your first steps or pushing new PRs, our intuitive interface meets you where you are.</p>
              <div className="about-values">
                <div className="about-value">
                  <strong>Simplicity First</strong>
                  <span>Clean design, no clutter. Log and analyze without learning a manual.</span>
                </div>
                <div className="about-value">
                  <strong>Data You Own</strong>
                  <span>Export your data anytime. Your fitness journey belongs to you.</span>
                </div>
                <div className="about-value">
                  <strong>Built for Real Life</strong>
                  <span>Works on any device. Track at the gym, at home, or on the go.</span>
                </div>
              </div>
              <p className="about-mission">Our mission is to help you build sustainable habits. We are not about quick fixes—we are about the daily choices that add up to lasting change. Join thousands who use Fitness Tracker to stay accountable, spot trends, and celebrate progress.</p>
              <div className="about-stats">
                <div className="about-stat"><span className="about-stat-num">10K+</span><span>Active Users</span></div>
                <div className="about-stat"><span className="about-stat-num">50K+</span><span>Workouts Logged</span></div>
                <div className="about-stat"><span className="about-stat-num">99%</span><span>Uptime</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="landing-section landing-features">
        <div className="container">
          <h2 className="section-title animate-on-scroll">Benefits of Personal Training</h2>
          <p className="section-subtitle animate-on-scroll">Everything you need to achieve your fitness goals</p>
          <div className="feature-grid">
            <div className="feature-card glass animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <div className="feature-icon"><NutritionIcon size={28} /></div>
              <h3>Nutrition Strategies</h3>
              <p>Log meals and track macros with precision. Stay on top of your daily intake and hit your targets.</p>
            </div>
            <div className="feature-card glass animate-on-scroll" style={{ transitionDelay: '0.15s' }}>
              <div className="feature-icon"><WorkoutIcon size={28} /></div>
              <h3>Workout Routines</h3>
              <p>Create and track workouts with sets, reps, and weights. Never forget a session.</p>
            </div>
            <div className="feature-card glass animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <div className="feature-icon"><ChartIcon size={28} /></div>
              <h3>Individual Support</h3>
              <p>Personalized dashboard and progress analytics. Visualize your journey over time.</p>
            </div>
            <div className="feature-card glass animate-on-scroll" style={{ transitionDelay: '0.25s' }}>
              <div className="feature-icon"><TargetIcon size={28} /></div>
              <h3>First-Hand Advice</h3>
              <p>Export reports, set goals, and receive reminders. Stay accountable and consistent.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="landing-section landing-pricing">
        <div className="container">
          <h2 className="section-title animate-on-scroll">Simple Pricing</h2>
          <p className="section-subtitle animate-on-scroll">Start free. Upgrade when you need more.</p>
          <div className="pricing-grid">
            <div className="pricing-card glass animate-on-scroll">
              <h3>Free</h3>
              <div className="pricing-price"><span className="price-amount">$0</span><span className="price-period">/month</span></div>
              <p className="pricing-desc">Perfect for getting started</p>
              <ul className="pricing-features">
                <li><CheckIcon size={16} /> Unlimited workouts</li>
                <li><CheckIcon size={16} /> Nutrition logging</li>
                <li><CheckIcon size={16} /> Progress tracking</li>
                <li><CheckIcon size={16} /> Basic analytics</li>
                <li><CheckIcon size={16} /> Export to CSV/JSON</li>
              </ul>
              <Link to="/register" className="btn btn-glass btn-block">Get Started</Link>
            </div>
            <div className="pricing-card pricing-featured glass animate-on-scroll">
              <span className="pricing-badge">Popular</span>
              <h3>Pro</h3>
              <div className="pricing-price"><span className="price-amount">$9.99</span><span className="price-period">/month</span></div>
              <p className="pricing-desc">For serious fitness enthusiasts</p>
              <ul className="pricing-features">
                <li><CheckIcon size={16} /> Everything in Free</li>
                <li><CheckIcon size={16} /> Advanced analytics</li>
                <li><CheckIcon size={16} /> Custom reminders</li>
                <li><CheckIcon size={16} /> Priority support</li>
                <li><CheckIcon size={16} /> PDF reports</li>
              </ul>
              <Link to="/register" className="btn btn-primary btn-glow btn-block">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="landing-section landing-reviews">
        <div className="container">
          <h2 className="section-title animate-on-scroll">What Our Users Say</h2>
          <p className="section-subtitle animate-on-scroll">Real results from real people</p>
          <div className="reviews-grid">
            <div className="review-card glass animate-on-scroll">
              <p className="review-text">"Finally, an app that does it all. I track my workouts and meals in one place. The analytics helped me lose 12 lbs in three months. The export feature is perfect for sharing with my nutritionist."</p>
              <div className="review-author">
                <span className="review-name">Sarah M.</span>
                <span className="review-role">Fitness Enthusiast</span>
              </div>
            </div>
            <div className="review-card glass animate-on-scroll">
              <p className="review-text">"The progress charts are incredibly motivating. Seeing my strength improve over time keeps me coming back. I have logged over 200 workouts and the interface stays fast and responsive."</p>
              <div className="review-author">
                <span className="review-name">James K.</span>
                <span className="review-role">Powerlifter</span>
              </div>
            </div>
            <div className="review-card glass animate-on-scroll">
              <p className="review-text">"Clean, professional design with zero clutter. I recommend Fitness Tracker to all my yoga students who want to track their wellness journey. The reminder system is a game-changer."</p>
              <div className="review-author">
                <span className="review-name">Emily R.</span>
                <span className="review-role">Yoga Instructor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="cta-content glass animate-on-scroll">
          <h2>Ready to Get Started</h2>
          <p>Never be bored by your fitness program again. Join thousands building better habits.</p>
          <Link to="/register" className="btn btn-primary btn-glow btn-lg">Join Now — It's Free</Link>
        </div>
      </section>

      <footer id="footer" className="landing-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <span className="landing-logo">Fitness Tracker</span>
              <span className="footer-tagline">Build your perfect health growth</span>
            </div>
            <div className="footer-nav">
              <button type="button" className="footer-link" onClick={() => scrollToSection('hero')}>Hero</button>
              <button type="button" className="footer-link" onClick={() => scrollToSection('services')}>Services</button>
              <button type="button" className="footer-link" onClick={() => scrollToSection('about')}>About</button>
              <button type="button" className="footer-link" onClick={() => scrollToSection('benefits')}>Benefits</button>
              <button type="button" className="footer-link" onClick={() => scrollToSection('pricing')}>Pricing</button>
              <button type="button" className="footer-link" onClick={() => scrollToSection('reviews')}>Reviews</button>
            </div>
            <div className="footer-actions">
              <Link to="/login">Log In</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Fitness Tracker. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <FitnessChatbot />
    </div>
  );
}
