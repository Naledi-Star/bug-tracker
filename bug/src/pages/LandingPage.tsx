import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import {
  ArrowRight,
  Zap,
  Command,
} from 'lucide-react';

import logo from '../assets/logo.png';
import lifecycleBg from '../assets/background_features/lifecycle.png';
import kanbanBg from '../assets/background_features/kanban.png';
import realtimeBg from '../assets/background_features/realtime_collab.png';
import burndownBg from '../assets/background_features/burndown.png';
import securityBg from '../assets/background_features/security.png';

/* ═══════════════════════════════════════════════════════════════
   ANIMATED BACKGROUND — floating grid + glow orbs
   ═══════════════════════════════════════════════════════════════ */

const AnimatedBackground: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Lottie background animation — full bleed, low opacity */}
      <Player
        src="/lottie/technology.json"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vmax',
          height: '100vmax',
          opacity: 0.3,
        }}
        loop
        autoplay
      />
      {/* Radial vignette to fade edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, #090b14 75%)',
        }}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TYPING TERMINAL — animated terminal with live typing
   ═══════════════════════════════════════════════════════════════ */

const TypingTerminal: React.FC = () => {
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);

  const lines = [
    { type: 'cmd', text: '$ bt search --priority critical --status open' },
    { type: 'result', text: '  BUG-1042  Auth token expires silently on refresh     P1  ▸ in-progress' },
    { type: 'result', text: '  BUG-1039  Race condition in concurrent writes        P1  ▸ open' },
    { type: 'result', text: '  BUG-1035  Webhook retry loop under load              P1  ▸ open' },
    { type: 'cmd', text: '$ bt assign BUG-1042 --to @alex' },
    { type: 'ok', text: '  ✓ Assigned to Alex Serame. Notification sent.' },
    { type: 'cmd', text: '$ bt status BUG-1042 --set resolved' },
    { type: 'ok', text: '  ✓ Status updated. 3 watchers notified.' },
  ];

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((c) => !c);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (currentLine >= lines.length) return;

    const line = lines[currentLine];
    const delay = line.type === 'cmd' ? 35 : 8;

    if (currentChar < line.text.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          if (updated.length <= currentLine) {
            updated.push(line.text.charAt(0));
          } else {
            updated[currentLine] = line.text.substring(0, currentChar + 1);
          }
          return updated;
        });
        setCurrentChar((c) => c + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentLine, currentChar, lines]);

  return (
    <div
      style={{
        borderRadius: 16,
        background: '#0d1117',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        boxShadow: '0 20px 80px rgba(0,0,0,0.5), 0 0 60px rgba(251,146,60,0.08)',
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f75f6b', opacity: 0.8 }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#e5a435', opacity: 0.8 }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3dd68c', opacity: 0.8 }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: '#484f6b', fontFamily: 'monospace' }}>
            <Command size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            BugTracker Terminal
          </span>
        </div>
      </div>

      {/* Terminal content */}
      <div style={{ padding: '20px 24px', minHeight: 200, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 2 }}>
        {displayedLines.map((line, i) => {
          const lineData = lines[i];
          let color = '#7c85a2';
          let prefix = '';
          if (lineData?.type === 'cmd') { color = '#e8eaf0'; prefix = ''; }
          else if (lineData?.type === 'result') { color = '#7c85a2'; prefix = ''; }
          else if (lineData?.type === 'ok') { color = '#3dd68c'; prefix = ''; }

          return (
            <div key={i} style={{ color, whiteSpace: 'pre', position: 'relative' }}>
              {line}
              {i === currentLine && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 16,
                    background: '#FB923C',
                    marginLeft: 2,
                    verticalAlign: 'middle',
                    opacity: showCursor ? 1 : 0,
                    transition: 'opacity 0.1s',
                  }}
                />
              )}
            </div>
          );
        })}
        {currentLine >= lines.length && (
          <div style={{ color: '#e8eaf0', position: 'relative' }}>
            <span style={{ color: '#484f6b' }}>$</span>{' '}
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 16,
                background: '#FB923C',
                marginLeft: 4,
                verticalAlign: 'middle',
                opacity: showCursor ? 1 : 0,
                transition: 'opacity 0.1s',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   GLOW CARD — feature card with animated border glow
   ═══════════════════════════════════════════════════════════════ */

const GlowCard: React.FC<{
  children: React.ReactNode;
  color?: string;
  delay?: number;
  bgImage?: string;
}> = ({ children, color = '#FB923C', delay = 0, bgImage }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        borderRadius: 16,
        padding: 2,
        background: hover
          ? `linear-gradient(135deg, ${color}40, transparent 60%)`
          : 'transparent',
        transition: 'background 0.3s ease',
        animation: `fadeUp 0.6s ${delay}s both ease-out`,
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: 14,
          overflow: 'hidden',
          height: '100%',
          transition: 'all 0.3s ease',
          transform: hover ? 'translateY(-2px)' : 'none',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {bgImage && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: hover ? 0.55 : 0.45,
              transition: 'opacity 0.4s ease',
            }}
          />
        )}
        <div
          style={{
            position: 'relative',
            padding: '32px 28px',
            background: bgImage ? 'rgba(13,17,23,0.5)' : (hover ? 'rgba(13,17,23,0.95)' : '#0d1117'),
            backdropFilter: bgImage ? 'blur(2px)' : 'none',
            height: '100%',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */

const AnimatedCounter: React.FC<{
  value: string;
  duration?: number;
}> = ({ value, duration = 2000 }) => {
  const [displayed, setDisplayed] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const numericPart = value.replace(/[^0-9.]/g, '');
    const prefix = value.match(/^[^0-9]*/)?.[0] || '';
    const suffix = value.match(/[^0-9.]*$/)?.[0] || '';
    const target = parseFloat(numericPart);
    const hasDecimal = numericPart.includes('.');
    const decimalPlaces = hasDecimal ? numericPart.split('.')[1].length : 0;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      setDisplayed(
        prefix + (hasDecimal ? current.toFixed(decimalPlaces) : Math.floor(current).toString()) + suffix
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [started, value, duration]);

  return <div ref={ref}>{displayed}</div>;
};

/* ═══════════════════════════════════════════════════════════════
   SCROLL INDICATOR
   ═══════════════════════════════════════════════════════════════ */



/* ═══════════════════════════════════════════════════════════════
   TESTIMONIAL MARQUEE
   ═══════════════════════════════════════════════════════════════ */

const testimonials = [
  { text: '"Finally, a bug tracker that doesn\'t make me want to close my laptop."', author: 'Sarah T.', role: 'Lead Developer' },
  { text: '"Switched from Jira. My team actually uses this voluntarily."', author: 'Marcus K.', role: 'Engineering Manager' },
  { text: '"The keyboard shortcuts alone saved me 2 hours a week."', author: 'Boi M.', role: 'Full-Stack Dev' },
  { text: '"Dark mode default? Sold."', author: 'Alex S.', role: 'DevOps Engineer' },
  { text: '"We caught 40% more bugs before production in the first month."', author: 'Wame R.', role: 'QA Lead' },
  { text: '"Bug IDs that grep cleanly in the terminal. Finally."', author: 'Sethunya T.', role: 'Backend Dev' },
];

const TestimonialMarquee: React.FC = () => (
  <div style={{ overflow: 'hidden', padding: '40px 0', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
    <div
      style={{
        display: 'flex',
        gap: 20,
        animation: 'marquee 30s linear infinite',
        width: 'max-content',
      }}
    >
      {[...testimonials, ...testimonials].map((t, i) => (
        <div
          key={i}
          style={{
            flexShrink: 0,
            width: 320,
            padding: '24px 20px',
            borderRadius: 12,
            background: 'rgba(13,17,23,0.8)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p style={{ fontSize: 14, lineHeight: 1.6, color: '#a0a8c0', margin: '0 0 16px', fontStyle: 'italic' }}>
            {t.text}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FB923C, #9b7cf4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {t.author[0]}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#d9dff0' }}>{t.author}</div>
              <div style={{ fontSize: 11, color: '#484f6b' }}>{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   FADE IN WRAPPER
   ═══════════════════════════════════════════════════════════════ */

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }> = ({
  children,
  delay = 0,
  className = '',
  style = {},
}) => (
  <div className={className} style={{ ...style, animation: `fadeUp 0.7s ${delay}s both ease-out` }}>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#090b14', color: '#d9dff0', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Global keyframes + marquee */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUpBig {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glitch {
          0%, 90%, 100% { transform: translate(0); }
          92% { transform: translate(-2px, 1px); }
          94% { transform: translate(2px, -1px); }
          96% { transform: translate(-1px, -1px); }
          98% { transform: translate(1px, 1px); }
        }
        .hero-cta {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .hero-cta:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 40px rgba(251,146,60,0.4);
        }
        .hero-cta:active {
          transform: translateY(0) scale(0.98);
        }
        .hero-cta-secondary {
          transition: all 0.2s ease;
        }
        .hero-cta-secondary:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.15) !important;
          transform: translateY(-1px);
        }
        .nav-link {
          transition: color 0.15s;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #FB923C;
          transition: width 0.2s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>

      {/* Animated background canvas */}
      <AnimatedBackground />

      {/* Scanline overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: 'linear-gradient(transparent, rgba(251,146,60,0.05), transparent)',
          animation: 'scanline 8s linear infinite',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* ═══ NAV ═══ */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            backdropFilter: 'blur(20px) saturate(1.2)',
            background: 'rgba(9,11,20,0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={logo} alt="BugTracker" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
              <span style={{ fontWeight: 700, fontSize: 17, color: '#e8eaf0', letterSpacing: '-0.02em' }}>
                BugTracker
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
              {[{ label: 'Features', target: 'features' }, { label: 'Proof', target: 'proof' }, { label: 'Flow', target: 'flow' }].map((item) => (
                <button
                  key={item.label}
                  onClick={() => document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })}
                  className="nav-link"
                  style={{ color: '#7c85a2', fontSize: 13, fontWeight: 500, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#d9dff0')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#7c85a2')}
                >
                  {item.label}
                </button>
              ))}
              <button
                className="hero-cta"
                onClick={() => navigate('/dashboard')}
                style={{
                  background: '#FB923C',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                }}
              >
                Open Dashboard →
              </button>
            </div>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 64 }}>
          {/* Large radial glow */}
          <div
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 900,
              height: 600,
              background: 'radial-gradient(ellipse, rgba(251,146,60,0.12) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          {/* Decorative ring */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500,
              height: 500,
              borderRadius: '50%',
              border: '1px solid rgba(251,146,60,0.06)',
              animation: 'spin-slow 60s linear infinite',
              pointerEvents: 'none',
            }}
          />

          <div style={{ maxWidth: 1200, padding: '60px 32px 48px', position: 'relative', textAlign: 'center', width: '100%' }}>
            {/* Badge */}
            {/* <FadeIn>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 16px',
                  borderRadius: 100,
                  background: 'rgba(251,146,60,0.08)',
                  border: '1px solid rgba(251,146,60,0.15)',
                  marginBottom: 32,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3dd68c', animation: 'pulse-glow 2s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#FB923C', letterSpacing: '0.04em' }}>
                  Built by devs, for devs
                </span>
              </div>
            </FadeIn> */}

            {/* Main headline — longer first, shorter second */}
            <FadeIn delay={0.1}>
              <h1
                style={{
                  fontSize: 'clamp(40px, 5.5vw, 72px)',
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-0.045em',
                  color: '#e8eaf0',
                  margin: '0 0 12px',
                  maxWidth: 800,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                {/* Stop losing bugs to
                <br />
                forgotten Slack threads */}
                Everything your team needs, in one place
              </h1>
            </FadeIn>

            {/* Short accent line */}
            <FadeIn delay={0.2}>
              <h2
                style={{
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: '-0.04em',
                  margin: '0 0 24px',
                  background: 'linear-gradient(135deg, #FB923C, #fbbf24)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 20px rgba(251,146,60,0.15))',
                }}
              >
                Start shipping fixes.
              </h2>
            </FadeIn>

            {/* Subheadline */}
            <FadeIn delay={0.25}>
              <p
                style={{
                  fontSize: 'clamp(15px, 1.8vw, 18px)',
                  lineHeight: 1.6,
                  color: '#7c85a2',
                  maxWidth: 460,
                  margin: '0 auto 36px',
                  letterSpacing: '-0.01em',
                }}
              >
                One place. Every bug. Full context.
              </p>
            </FadeIn>

            {/* CTA buttons */}
            <FadeIn delay={0.3}>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="hero-cta"
                  onClick={() => navigate('/dashboard')}
                  style={{
                    background: 'linear-gradient(135deg, #FB923C, #f97316)',
                    color: '#fff',
                    border: 'none',
                    padding: '16px 36px',
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    letterSpacing: '-0.01em',
                    boxShadow: '0 8px 32px rgba(251,146,60,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  Start Free <ArrowRight size={18} strokeWidth={2.5} />
                </button>
                <button
                  className="hero-cta-secondary"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: '#d9dff0',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '16px 28px',
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    letterSpacing: '-0.01em',
                  }}
                >
                  See how it works
                </button>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══ STATS BAR ═══ */}
        {/* <section style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              { value: '3.2×', label: 'faster triage', color: '#FB923C' },
              { value: '47%', label: 'fewer escapes', color: '#3dd68c' },
              { value: '<8h', label: 'avg resolution', color: '#e5a435' },
              { value: '12min', label: 'avg first response', color: '#9b7cf4' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  padding: '0 24px',
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <div style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#e8eaf0', lineHeight: 1, marginBottom: 4 }}>
                  <AnimatedCounter value={stat.value} />
                </div>
                <div style={{ fontSize: 13, color: '#7c85a2', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section> */}

        {/* ═══ FEATURES ═══ */}
        <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 32px' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#FB923C', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14, display: 'block' }}>
                Why BugTracker
              </span>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#e8eaf0', margin: 0, lineHeight: 1.1 }}>
                Everything you need.
                <br />
                <span style={{ color: '#484f6b' }}>Nothing you don't.</span>
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                title: 'Full lifecycle tracking',
                desc: 'From first report to final fix — every status change, comment, and assignment logged automatically.',
                color: '#f75f6b',
                bgImage: lifecycleBg,
              },
              {
                title: 'Kanban boards',
                desc: 'Drag-and-drop columns with WIP limits, keyboard shortcuts, and batch operations. Move fast.',
                color: '#9b7cf4',
                bgImage: kanbanBg,
              },
              {
                title: 'Real-time collaboration',
                desc: 'See changes as they happen. Comments, status updates, and assignments sync across all open tabs.',
                color: '#3dd68c',
                bgImage: realtimeBg,
              },
              {
                title: 'Burndown & analytics',
                desc: 'Sprint burndowns, severity breakdowns, project health scores — computed from your real data.',
                color: '#e5a435',
                bgImage: burndownBg,
              },
              {
                title: 'Built-in security',
                desc: 'Row-level security, audit logs, role-based access. Your data stays yours, period.',
                color: '#f09858',
                bgImage: securityBg,
              },
            ].map((f, i) => (
              <GlowCard key={i} color={f.color} delay={i * 0.08} bgImage={f.bgImage}>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#e8eaf0',
                    margin: '0 0 10px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: '#a0a8c0', margin: 0 }}>
                  {f.desc}
                </p>
              </GlowCard>
            ))}
          </div>
        </section>

        {/* ═══ PROOF / TESTIMONIALS ═══ */}
        <section
          id="proof"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(251,146,60,0.02)',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px 40px' }}>
            <FadeIn>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#FB923C', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14, display: 'block' }}>
                  Loved by developers
                </span>
                <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#e8eaf0', margin: 0 }}>
                  Don't take our word for it.
                </h2>
              </div>
            </FadeIn>
          </div>
          <TestimonialMarquee />
        </section>

        {/* ═══ WORKFLOW / FLOW SECTION ═══ */}
        <section id="flow" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 32px' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#FB923C', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14, display: 'block' }}>
                How it works
              </span>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#e8eaf0', margin: 0 }}>
                From bug to fix in{' '}
                <span style={{ color: '#3dd68c' }}>3 steps</span>.
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                step: '01',
                title: 'Report it',
                desc: 'Describe the bug. Add steps to reproduce. Upload screenshots. Assign priority.',
                color: '#f75f6b',
                visual: (
                  <div style={{ padding: '20px 24px', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8, color: '#7c85a2' }}>
                    <div style={{ color: '#484f6b' }}>// new bug report</div>
                    <div><span style={{ color: '#f75f6b' }}>title:</span> "Login fails on Safari"</div>
                    <div><span style={{ color: '#e5a435' }}>severity:</span> blocker</div>
                    <div><span style={{ color: '#FB923C' }}>project:</span> E-Commerce</div>
                    <div><span style={{ color: '#9b7cf4' }}>assignee:</span> @alex</div>
                  </div>
                ),
              },
              {
                step: '02',
                title: 'Triage it',
                desc: 'Drag it across the board. Filter by priority. Batch-update statuses.',
                color: '#FB923C',
                visual: (
                  <div style={{ display: 'flex', gap: 8, padding: '20px 16px' }}>
                    {['Open', 'In Progress', 'Resolved'].map((col, i) => (
                      <div key={col} style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: '#484f6b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, textAlign: 'center' }}>
                          {col}
                        </div>
                        <div
                          style={{
                            height: i === 1 ? 40 : 24,
                            borderRadius: 6,
                            background: i === 0 ? 'rgba(247,95,107,0.12)' : i === 1 ? 'rgba(251,146,60,0.15)' : 'rgba(61,214,140,0.12)',
                            border: i === 1 ? '1px solid rgba(251,146,60,0.3)' : '1px solid rgba(255,255,255,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 9,
                            color: i === 0 ? '#f75f6b' : i === 1 ? '#FB923C' : '#3dd68c',
                          }}
                        >
                          {i === 0 ? '2 bugs' : i === 1 ? 'BUG-1042' : '1 bug'}
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                step: '03',
                title: 'Fix & close',
                desc: 'Push the fix. Status updates live. Team gets notified. Ship it.',
                color: '#3dd68c',
                visual: (
                  <div style={{ padding: '20px 24px', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8 }}>
                    <div style={{ color: '#3dd68c' }}>✓ Status: resolved</div>
                    <div style={{ color: '#7c85a2' }}>✓ 3 watchers notified</div>
                    <div style={{ color: '#7c85a2' }}>✓ Activity logged</div>
                    <div style={{ color: '#484f6b', marginTop: 8 }}>—</div>
                    <div style={{ color: '#FB923C' }}>Bugs resolved today: 7</div>
                    <div style={{ color: '#3dd68c' }}>Project health: 92/100</div>
                  </div>
                ),
              },
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div
                  style={{
                    borderRadius: 16,
                    background: '#0d1117',
                    border: '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '28px 28px 0' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${step.color}15`,
                        color: step.color,
                        fontSize: 13,
                        fontWeight: 800,
                        marginBottom: 16,
                        fontFamily: 'monospace',
                      }}
                    >
                      {step.step}
                    </div>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#e8eaf0',
                        margin: '0 0 8px',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#7c85a2', margin: '0 0 16px' }}>
                      {step.desc}
                    </p>
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                      background: 'rgba(255,255,255,0.01)',
                    }}
                  >
                    {step.visual}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══ BOTTOM CTA ═══ */}
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 600,
              height: 300,
              background: 'radial-gradient(ellipse, rgba(251,146,60,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 32px', textAlign: 'center', position: 'relative' }}>
            {/* <FadeIn>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 100,
                  background: 'rgba(61,214,140,0.08)',
                  border: '1px solid rgba(61,214,140,0.15)',
                  marginBottom: 32,
                }}
              >
                <Zap size={12} color="#3dd68c" />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#3dd68c', letterSpacing: '0.04em' }}>
                  Free for teams up to 10
                </span>
              </div>
            </FadeIn> */}

            <FadeIn delay={0.1}>
              <h2
                style={{
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: '#e8eaf0',
                  margin: '0 0 20px',
                  lineHeight: 1.1,
                }}
              >
                Your bugs deserve
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #FB923C, #3dd68c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 20px rgba(251,146,60,0.15))',
                  }}
                >
                  better tooling.
                </span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: '#7c85a2', maxWidth: 440, margin: '0 auto 40px' }}>
                Join the teams that stopped fighting their tools and started shipping faster.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <button
                className="hero-cta"
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'linear-gradient(135deg, #FB923C, #f97316)',
                  color: '#fff',
                  border: 'none',
                  padding: '20px 48px',
                  borderRadius: 14,
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  letterSpacing: '-0.01em',
                  boxShadow: '0 8px 32px rgba(251,146,60,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Open the dashboard <ArrowRight size={20} strokeWidth={2.5} />
              </button>
            </FadeIn>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer
          style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            padding: '28px 32px',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={logo} alt="BugTracker" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#484f6b' }}>BugTracker</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {['Features', 'GitHub', 'Docs'].map((link) => (
                <a
                  key={link}
                  href="#"
                  style={{ fontSize: 12, color: '#484f6b', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#7c85a2')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#484f6b')}
                  onClick={(e) => e.preventDefault()}
                >
                  {link}
                </a>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#2e3450' }}>
              Built for developers who ship.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
