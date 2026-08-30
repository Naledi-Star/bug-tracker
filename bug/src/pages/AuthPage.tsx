import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

type AuthMode = 'login' | 'signup' | 'forgot';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, resetPassword, loading, error } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccess('');

    if (mode === 'login') {
      if (!email || !password) {
        setLocalError('Please fill in all fields');
        return;
      }
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setLocalError(signInError);
      } else {
        navigate(from, { replace: true });
      }
    } else if (mode === 'signup') {
      if (!email || !password || !name) {
        setLocalError('Please fill in all required fields');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      const { error: signUpError } = await signUp(email, password, name, companyName);
      if (signUpError) {
        setLocalError(signUpError);
      } else {
        setSuccess('Account created! Check your email for verification link.');
        setTimeout(() => navigate(from, { replace: true }), 2000);
      }
    } else if (mode === 'forgot') {
      if (!email) {
        setLocalError('Please enter your email');
        return;
      }
      const { error: resetError } = await resetPassword(email);
      if (resetError) {
        setLocalError(resetError);
      } else {
        setSuccess('Password reset email sent! Check your inbox.');
      }
    }
  };

  const displayError = localError || error;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090b14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <style>{`
        .auth-input:focus {
          border-color: rgba(251,146,60,0.5) !important;
          outline: none;
        }
        .auth-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .auth-link:hover {
          color: #d9dff0 !important;
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Back to home */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#484f6b',
            fontSize: 13,
            textDecoration: 'none',
            marginBottom: 32,
          }}
          className="auth-link"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <img src={logo} alt="BugTracker" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
          <span style={{ fontWeight: 700, fontSize: 20, color: '#e8eaf0', letterSpacing: '-0.02em' }}>
            BugTracker
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#111422',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 32,
          }}
        >
          {/* Title */}
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e8eaf0', marginBottom: 4 }}>
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
          </h1>
          <p style={{ fontSize: 14, color: '#7c85a2', marginBottom: 24 }}>
            {mode === 'login'
              ? 'Sign in to your account'
              : mode === 'signup'
              ? 'Get started with BugTracker'
              : 'Enter your email to reset your password'}
          </p>

          {/* Error */}
          {displayError && (
            <div
              style={{
                background: 'rgba(247,95,107,0.1)',
                border: '1px solid rgba(247,95,107,0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: 13,
                color: '#f75f6b',
              }}
            >
              {displayError}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              style={{
                background: 'rgba(61,214,140,0.1)',
                border: '1px solid rgba(61,214,140,0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: 13,
                color: '#3dd68c',
              }}
            >
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Name (signup only) */}
            {mode === 'signup' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#7c85a2', marginBottom: 6 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Serame"
                  className="auth-input"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#e8eaf0',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Company Name (signup only) */}
            {mode === 'signup' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#7c85a2', marginBottom: 6 }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Stargaze Inc"
                  className="auth-input"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#e8eaf0',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#7c85a2', marginBottom: 6 }}>
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@stargaze.com"
                className="auth-input"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#e8eaf0',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password */}
            {mode !== 'forgot' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#7c85a2', marginBottom: 6 }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input"
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      fontSize: 14,
                      color: '#e8eaf0',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#484f6b',
                      padding: 4,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#7c85a2', marginBottom: 6 }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#e8eaf0',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Forgot password link (login only) */}
            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setLocalError(''); setSuccess(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FB923C',
                    fontSize: 13,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  className="auth-link"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
              style={{
                width: '100%',
                padding: '12px 20px',
                background: '#FB923C',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.15s',
              }}
            >
              {loading
                ? 'Loading...'
                : mode === 'login'
                ? 'Sign In'
                : mode === 'signup'
                ? 'Create Account'
                : 'Send Reset Email'}
            </button>
          </form>

          {/* Switch mode */}
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#7c85a2' }}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setLocalError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: '#FB923C', cursor: 'pointer', fontSize: 13 }}
                  className="auth-link"
                >
                  Sign up
                </button>
              </>
            ) : mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setLocalError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: '#FB923C', cursor: 'pointer', fontSize: 13 }}
                  className="auth-link"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Remember your password?{' '}
                <button
                  onClick={() => { setMode('login'); setLocalError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: '#FB923C', cursor: 'pointer', fontSize: 13 }}
                  className="auth-link"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
