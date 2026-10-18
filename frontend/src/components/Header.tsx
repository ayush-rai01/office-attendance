import React from 'react';
import type { User } from '../types';
import { Clock, Shield, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  users: User[];
  onSelectUser: (user: User) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, users, onSelectUser }) => {
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

        <div className="user-switcher">
          {currentUser?.role === 'ADMIN' ? (
            <Shield size={16} color="#dc2626" />
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
      </div>
    </header>
  );
};
