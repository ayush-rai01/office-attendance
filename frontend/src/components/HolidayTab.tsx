import React, { useState, useEffect } from 'react';
import type { Holiday, User } from '../types';
import { attendanceApi } from '../api/attendanceApi';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Lock,
  Edit2,
  Trash2,
  Sparkles,
  Shield,
  CheckCircle,
  AlertTriangle,
  X,
  List,
  Grid,
} from 'lucide-react';

interface HolidayTabProps {
  currentUser: User;
}

export const HolidayTab: React.FC<HolidayTabProps> = ({ currentUser }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [_loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'LIST'>('CALENDAR');

  // Month navigation state (defaults to current date, e.g. Oct 2026 or today)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Default to Oct 2026
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Modal State for HR Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formDate, setFormDate] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Company Holiday');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentUser.role === 'ADMIN';

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const data = await attendanceApi.getAllHolidays();
      setHolidays(data);
    } catch (err: any) {
      console.error('Failed to load holidays', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Open modal to add a new holiday (optionally on a preselected date)
  const openAddModal = (dateStr?: string) => {
    setEditingHoliday(null);
    setFormDate(dateStr || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`);
    setFormName('');
    setFormType('Company Holiday');
    setFormDesc('');
    setIsModalOpen(true);
  };

  // Open modal to edit existing non-government holiday
  const openEditModal = (h: Holiday) => {
    if (h.isGovernmentHoliday) {
      alert('Government and National Holidays are protected by law and cannot be modified.');
      return;
    }
    setEditingHoliday(h);
    setFormDate(h.holidayDate);
    setFormName(h.name);
    setFormType(h.holidayType);
    setFormDesc(h.description || '');
    setIsModalOpen(true);
  };

  const handleDeleteHoliday = async (h: Holiday) => {
    if (h.isGovernmentHoliday) {
      alert('Government and National Holidays are protected by law and cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to remove '${h.name}' from company holidays?`)) {
      return;
    }

    try {
      await attendanceApi.deleteHoliday(h.id);
      setMessage({ text: `Holiday '${h.name}' removed successfully.`, type: 'success' });
      await fetchHolidays();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to delete holiday.';
      setMessage({ text: errMsg, type: 'danger' });
    }
  };

  const handleSaveHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formName) {
      alert('Please fill in holiday date and name.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingHoliday) {
        await attendanceApi.updateHoliday(editingHoliday.id, {
          name: formName,
          holidayDate: formDate,
          holidayType: formType,
          description: formDesc,
        });
        setMessage({ text: `Holiday '${formName}' updated successfully!`, type: 'success' });
      } else {
        await attendanceApi.createHoliday({
          name: formName,
          holidayDate: formDate,
          holidayType: formType,
          description: formDesc,
          isGovernmentHoliday: false,
        });
        setMessage({ text: `Company holiday '${formName}' declared successfully!`, type: 'success' });
      }

      setIsModalOpen(false);
      await fetchHolidays();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to save holiday.';
      setMessage({ text: errMsg, type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('en-US', { month: 'long' });
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon, ...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map holidays by Date string (YYYY-MM-DD)
  const holidayMap = new Map<string, Holiday>();
  holidays.forEach((h) => {
    holidayMap.set(h.holidayDate, h);
  });

  const calendarDays = [];
  // Empty slots for previous month padding
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const holiday = holidayMap.get(dateStr);
    const dayOfWeek = (firstDayIndex + day - 1) % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    calendarDays.push({
      day,
      dateStr,
      holiday,
      isWeekend,
    });
  }

  const holidaysInThisMonth = holidays.filter((h) => {
    const d = new Date(h.holidayDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  return (
    <div>
      {/* Alert banner */}
      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.25rem' }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Banner with Stats & Controls */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: 'white',
          border: 'none',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Sparkles size={22} color="#fde047" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Company Holiday Calendar</h2>
            </div>
            <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
              Monthly calendar with government statutory holidays and company observed non-working days.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* View Switcher */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '8px', padding: '2px' }}>
              <button
                onClick={() => setViewMode('CALENDAR')}
                style={{
                  background: viewMode === 'CALENDAR' ? 'white' : 'transparent',
                  color: viewMode === 'CALENDAR' ? '#1e3a8a' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Grid size={14} /> Monthly Grid
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                style={{
                  background: viewMode === 'LIST' ? 'white' : 'transparent',
                  color: viewMode === 'LIST' ? '#1e3a8a' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <List size={14} /> Year Table
              </button>
            </div>

            {/* HR Admin Add Holiday Button */}
            {isAdmin && (
              <button
                onClick={() => openAddModal()}
                className="btn btn-sm"
                style={{
                  background: '#16a34a',
                  color: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontWeight: 700,
                }}
              >
                <Plus size={16} /> Declare Company Holiday
              </button>
            )}
          </div>
        </div>

        {/* HR Privileges Notice */}
        {isAdmin && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.5rem 0.85rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Shield size={16} color="#4ade80" />
            <span>
              <strong>HR Access Enabled:</strong> You have permission to declare new company holidays and modify observed holidays. Mandatory Government / National Holidays (🔒) are protected by policy and cannot be altered.
            </span>
          </div>
        )}
      </div>

      {viewMode === 'CALENDAR' ? (
        /* ================= MONTHLY CALENDAR GRID ================= */
        <div className="card" style={{ padding: '1.25rem' }}>
          {/* Calendar Header with Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={handlePrevMonth}
                className="btn btn-sm"
                style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1' }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', minWidth: '170px', textAlign: 'center' }}>
                {monthName} {year}
              </h3>
              <button
                onClick={handleNextMonth}
                className="btn btn-sm"
                style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1' }}
              >
                Next <ChevronRight size={16} />
              </button>
              <button
                onClick={handleCurrentMonth}
                className="btn btn-sm"
                style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}
              >
                Current Date
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>
                Holidays in {monthName}: <strong>{holidaysInThisMonth.length} day(s)</strong>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
                <span>Govt Holiday</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                <span>Company Holiday</span>
              </div>
            </div>
          </div>

          {/* 7-Day Grid Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.5rem',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#64748b',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: '0.5rem',
            }}
          >
            <div style={{ color: '#dc2626' }}>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div style={{ color: '#2563eb' }}>SAT</div>
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.5rem',
            }}
          >
            {calendarDays.map((item, idx) => {
              if (!item) {
                return (
                  <div
                    key={`empty-${idx}`}
                    style={{
                      minHeight: '105px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      opacity: 0.4,
                    }}
                  />
                );
              }

              const { day, dateStr, holiday, isWeekend } = item;
              const isGovt = holiday?.isGovernmentHoliday;

              return (
                <div
                  key={dateStr}
                  style={{
                    minHeight: '105px',
                    borderRadius: '10px',
                    border: holiday ? (isGovt ? '2px solid #f87171' : '2px solid #60a5fa') : '1px solid #e2e8f0',
                    background: holiday
                      ? isGovt
                        ? '#fef2f2'
                        : '#eff6ff'
                      : isWeekend
                      ? '#f8fafc'
                      : 'white',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Date Number Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: holiday ? (isGovt ? '#991b1b' : '#1e40af') : isWeekend ? '#94a3b8' : '#1e293b',
                      }}
                    >
                      {day}
                    </span>

                    {/* Admin Add Quick Button for Empty Days */}
                    {isAdmin && !holiday && (
                      <button
                        onClick={() => openAddModal(dateStr)}
                        title={`Declare holiday on ${dateStr}`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>

                  {/* Holiday Badge Content if Date is Holiday */}
                  {holiday && (
                    <div style={{ margin: '0.25rem 0' }}>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isGovt ? '#991b1b' : '#1e40af',
                          lineHeight: 1.2,
                          marginBottom: '0.2rem',
                        }}
                      >
                        {holiday.name}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {isGovt ? (
                          <span
                            className="badge badge-danger"
                            style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', gap: '2px' }}
                            title="Mandatory Government Holiday - Cannot be modified"
                          >
                            <Lock size={10} /> Govt
                          </span>
                        ) : (
                          <span
                            className="badge badge-info"
                            style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}
                          >
                            Company
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Bar for Existing Holidays (HR Admin Only) */}
                  {holiday && isAdmin && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.25rem',
                        marginTop: 'auto',
                        paddingTop: '0.25rem',
                        borderTop: '1px dashed rgba(0,0,0,0.08)',
                      }}
                    >
                      {isGovt ? (
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Lock size={10} /> Protected
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => openEditModal(holiday)}
                            title="Edit this company holiday"
                            style={{
                              background: '#e0f2fe',
                              border: 'none',
                              color: '#0284c7',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              padding: '2px 4px',
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteHoliday(holiday)}
                            title="Delete this company holiday"
                            style={{
                              background: '#fee2e2',
                              border: 'none',
                              color: '#dc2626',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              padding: '2px 4px',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= FULL YEAR LIST TABLE VIEW ================= */
        <div className="card">
          <h3 className="card-title">
            <CalendarIcon size={18} /> Official Holidays List ({holidays.length})
          </h3>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Holiday Name</th>
                  <th>Classification</th>
                  <th>Protected Status</th>
                  <th>Description</th>
                  {isAdmin && <th>HR Actions</th>}
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => {
                  const isGovt = h.isGovernmentHoliday;
                  const formattedDate = new Date(h.holidayDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={h.id}>
                      <td>
                        <strong>{formattedDate}</strong>
                      </td>
                      <td>{h.dayOfWeek}</td>
                      <td>
                        <strong>{h.name}</strong>
                      </td>
                      <td>
                        <span className={`badge ${isGovt ? 'badge-danger' : 'badge-info'}`}>
                          {h.holidayType}
                        </span>
                      </td>
                      <td>
                        {isGovt ? (
                          <span className="badge badge-danger" style={{ gap: '4px' }}>
                            <Lock size={11} /> Govt (Locked)
                          </span>
                        ) : (
                          <span className="badge badge-success">Company (Flexible)</span>
                        )}
                      </td>
                      <td style={{ color: '#64748b' }}>{h.description || '-'}</td>
                      {isAdmin && (
                        <td>
                          {isGovt ? (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              Protected by law
                            </span>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                onClick={() => openEditModal(h)}
                                className="btn btn-sm"
                                style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.5rem' }}
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteHoliday(h)}
                                className="btn btn-sm btn-danger"
                                style={{ padding: '0.25rem 0.5rem' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT COMPANY HOLIDAY ================= */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingHoliday ? 'Edit Company Holiday' : 'Declare Company Holiday'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday}>
              <div className="form-group">
                <label className="form-label">Holiday Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Holiday Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Founder's Day, Diwali Floating Off"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Holiday Type</label>
                <select
                  className="form-select"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                >
                  <option value="Company Holiday">Company Holiday</option>
                  <option value="Festival">Festival Celebration</option>
                  <option value="Optional Holiday">Optional / Floating Holiday</option>
                  <option value="Special Off">Special Office Day Off</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Notes about observance, office closure, etc."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.78rem',
                  color: '#64748b',
                  marginBottom: '1.25rem',
                }}
              >
                🔒 <strong>Policy Note:</strong> Government/National statutory holidays (Republic Day, Independence Day, etc.) remain fixed and cannot be changed here.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn"
                  style={{ background: '#f1f5f9', color: '#334155' }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingHoliday ? 'Update Holiday' : 'Declare Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
