import React, { useState } from 'react';
import type { User } from '../types';
import { attendanceApi } from '../api/attendanceApi';
import { Clock, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Shield } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await attendanceApi.login(email, password);
      localStorage.setItem('auth_user', JSON.stringify(user));
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    try {
      setLoading(true);
      setError(null);
      const user = await attendanceApi.login(quickEmail, quickPass);
      localStorage.setItem('auth_user', JSON.stringify(user));
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e2e8f0 100%)',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="logo-icon"
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 1rem auto',
              borderRadius: '14px',
            }}
          >
            <Clock size={30} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            greytAttendance
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            Sign in to mark attendance & manage leaves
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Login Buttons */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', marginBottom: '0.75rem', fontWeight: 600 }}>
            QUICK ONE-CLICK DEMO LOGINS:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('john.doe@company.com', 'Password123')}
              className="btn btn-sm"
              style={{ background: '#f1f5f9', color: '#1e293b', justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
            >
              <UserCheck size={16} color="#2563eb" />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <strong>John Doe</strong> <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Employee)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('manager@company.com', 'Manager123')}
              className="btn btn-sm"
              style={{ background: '#f1f5f9', color: '#1e293b', justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
            >
              <UserCheck size={16} color="#16a34a" />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <strong>Sarah Connor</strong> <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Reporting Manager)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@company.com', 'Admin123')}
              className="btn btn-sm"
              style={{ background: '#f1f5f9', color: '#1e293b', justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
            >
              <Shield size={16} color="#dc2626" />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <strong>HR Admin</strong> <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Full HR Admin Access)</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
