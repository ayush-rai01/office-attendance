import React, { useState, useEffect } from 'react';
import type { Holiday } from '../types';
import { attendanceApi } from '../api/attendanceApi';
import { Calendar, Sparkles } from 'lucide-react';

export const HolidayTab: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    fetchHolidays();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: 'white',
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Sparkles size={20} color="#fde047" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Company Holiday Calendar 2026</h2>
            </div>
            <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
              Official list of holidays and scheduled non-working days for the organization.
            </p>
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '0.6rem 1.25rem',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{holidays.length}</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Holidays
            </div>
          </div>
        </div>
      </div>

      {/* Holiday Table Card */}
      <div className="card">
        <h3 className="card-title">
          <Calendar size={18} /> Official Holidays List ({holidays.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
            Loading holiday schedule...
          </div>
        ) : holidays.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Holiday Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => {
                  const isUpcoming = h.holidayDate >= todayStr;
                  const formattedDate = new Date(h.holidayDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={h.id} style={{ background: isUpcoming ? '#ffffff' : '#f8fafc' }}>
                      <td>
                        <strong>{formattedDate}</strong>
                      </td>
                      <td>{h.dayOfWeek}</td>
                      <td>
                        <strong>{h.name}</strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            h.holidayType === 'National Holiday' ? 'badge-danger' : 'badge-info'
                          }`}
                        >
                          {h.holidayType}
                        </span>
                      </td>
                      <td>
                        {isUpcoming ? (
                          <span className="badge badge-success">Upcoming</span>
                        ) : (
                          <span className="badge" style={{ background: '#e2e8f0', color: '#64748b' }}>
                            Past
                          </span>
                        )}
                      </td>
                      <td style={{ color: '#64748b' }}>{h.description || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No holidays found in the database.
          </p>
        )}
      </div>
    </div>
  );
};
