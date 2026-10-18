import React from 'react';
import type { User } from '../types';
import { Clock, Shield, User as UserIcon, LogOut, Briefcase } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  users: User[];
  onSelectUser: (user: User) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSelectUser,
  onLogout,
}) => {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-area">
          <div className="logo-icon">
            <Clock size={22} />
          </div>
          <div className="logo-text">
            <h1>greytAttendance</h1>
            <span>Office Presence & Leave System</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Persona Switcher for Quick Testing */}
          <div className="user-switcher">
            {currentUser?.role === 'ADMIN' ? (
              <Shield size={16} color="#dc2626" />
            ) : currentUser?.role === 'MANAGER' ? (
              <Briefcase size={16} color="#16a34a" />
            ) : (
              <UserIcon size={16} color="#2563eb" />
            )}
            <select
              value={currentUser?.id || ''}
              onChange={(e) => {
                const selected = users.find((u) => u.id === Number(e.target.value));
                if (selected) onSelectUser(selected);
              }}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.role}) - {u.employeeCode || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="btn btn-sm"
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 600,
            }}
            title="Sign out of your account"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
