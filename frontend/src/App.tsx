import { useState, useEffect } from 'react';
import type { User } from './types';
import { attendanceApi } from './api/attendanceApi';
import { Header } from './components/Header';
import { PunchTab } from './components/PunchTab';
import { LeaveTab } from './components/LeaveTab';
import { AdminTab } from './components/AdminTab';
import { Clock, Calendar, Shield, AlertCircle } from 'lucide-react';

type Tab = 'PUNCH' | 'LEAVE' | 'ADMIN';

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('PUNCH');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceApi.getAllUsers();
      setUsers(data);
      if (data.length > 0 && !currentUser) {
        const defaultUser = data.find((u) => u.role === 'EMPLOYEE') || data[0];
        setCurrentUser(defaultUser);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentUser={currentUser}
        users={users}
        onSelectUser={(user) => setCurrentUser(user)}
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
            Loading attendance system...
          </div>
        ) : (
          <>
            <nav className="nav-tabs">
              <button
                onClick={() => setActiveTab('PUNCH')}
                className={`tab-btn ${activeTab === 'PUNCH' ? 'active' : ''}`}
              >
                <Clock size={18} />
                <span>Clock In / Out</span>
              </button>

              <button
                onClick={() => setActiveTab('LEAVE')}
                className={`tab-btn ${activeTab === 'LEAVE' ? 'active' : ''}`}
              >
                <Calendar size={18} />
                <span>Leaves & Time Off</span>
              </button>

              <button
                onClick={() => setActiveTab('ADMIN')}
                className={`tab-btn ${activeTab === 'ADMIN' ? 'active' : ''}`}
              >
                <Shield size={18} />
                <span>Admin & Approvals</span>
              </button>
            </nav>

            {currentUser && (
              <>
                {activeTab === 'PUNCH' && (
                  <PunchTab currentUser={currentUser} onRefresh={loadUsers} />
                )}
                {activeTab === 'LEAVE' && <LeaveTab currentUser={currentUser} />}
                {activeTab === 'ADMIN' && <AdminTab />}
              </>
            )}
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
