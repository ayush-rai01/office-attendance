import { useState, useEffect } from 'react';
import type { User } from './types';
import { attendanceApi } from './api/attendanceApi';
import { Header } from './components/Header';
import { PunchTab } from './components/PunchTab';
import { LeaveTab } from './components/LeaveTab';
import { HolidayTab } from './components/HolidayTab';
import { ManagerApprovalsTab } from './components/ManagerApprovalsTab';
import { AdminTab } from './components/AdminTab';
import { LoginPage } from './components/LoginPage';
import { Clock, Calendar, Shield, Sparkles, UserCheck, AlertCircle } from 'lucide-react';

type Tab = 'PUNCH' | 'LEAVE' | 'HOLIDAYS' | 'APPROVALS' | 'ADMIN';

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState<Tab>('PUNCH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceApi.getAllUsers();
      setUsers(data);

      // If currentUser is already set from localStorage, sync with fresh DB data
      if (currentUser) {
        const freshUser = data.find((u) => u.id === currentUser.id);
        if (freshUser) {
          setCurrentUser(freshUser);
          localStorage.setItem('auth_user', JSON.stringify(freshUser));
        }
      }
    } catch (err: any) {
      console.error('Error connecting to backend', err);
      setError(
        'Unable to connect to Spring Boot backend at http://localhost:8080. Please ensure your backend is running in IntelliJ.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    setCurrentUser(null);
    setActiveTab('PUNCH');
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('auth_user', JSON.stringify(user));
  };

  // If not logged in, render the Login Screen
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          loadUsers();
        }}
      />
    );
  }

  const isManagerOrAdmin = currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN';
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Header
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
      />

      <main className="container" style={{ flex: 1 }}>
        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={20} />
            <div>
              <strong>Backend Disconnected:</strong> {error}
            </div>
          </div>
        )}

        {loading && users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
            Loading attendance system...
          </div>
        ) : (
          <>
            {/* Navigation Tabs - greytHR Sections */}
            <nav className="nav-tabs">
              <button
                onClick={() => setActiveTab('PUNCH')}
                className={`tab-btn ${activeTab === 'PUNCH' ? 'active' : ''}`}
              >
                <Clock size={18} />
                <span>Attendance (Punch)</span>
              </button>

              <button
                onClick={() => setActiveTab('LEAVE')}
                className={`tab-btn ${activeTab === 'LEAVE' ? 'active' : ''}`}
              >
                <Calendar size={18} />
                <span>Leave & Time Off</span>
              </button>

              <button
                onClick={() => setActiveTab('HOLIDAYS')}
                className={`tab-btn ${activeTab === 'HOLIDAYS' ? 'active' : ''}`}
              >
                <Sparkles size={18} />
                <span>Holiday Calendar</span>
              </button>

              {/* Team Approvals Tab for Reporting Managers and Admins */}
              {isManagerOrAdmin && (
                <button
                  onClick={() => setActiveTab('APPROVALS')}
                  className={`tab-btn ${activeTab === 'APPROVALS' ? 'active' : ''}`}
                >
                  <UserCheck size={18} />
                  <span>Team Approvals (RM)</span>
                </button>
              )}

              {/* Full HR Admin Dashboard Tab for HR Admin */}
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('ADMIN')}
                  className={`tab-btn ${activeTab === 'ADMIN' ? 'active' : ''}`}
                >
                  <Shield size={18} />
                  <span>HR Administration</span>
                </button>
              )}
            </nav>

            {/* Render Selected View */}
            {activeTab === 'PUNCH' && (
              <PunchTab currentUser={currentUser} onRefresh={loadUsers} />
            )}

            {activeTab === 'LEAVE' && <LeaveTab currentUser={currentUser} />}

            {activeTab === 'HOLIDAYS' && <HolidayTab />}

            {activeTab === 'APPROVALS' && isManagerOrAdmin && (
              <ManagerApprovalsTab currentUser={currentUser} />
            )}

            {activeTab === 'ADMIN' && isAdmin && <AdminTab />}
          </>
        )}
      </main>

      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          background: 'white',
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#64748b',
        }}
      >
        Office Attendance System • Built with Spring Boot (Java 21) & React
      </footer>
    </div>
  );
}

export default App;
