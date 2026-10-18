import React, { useState, useEffect } from 'react';
import type { User, TodayAttendanceResponse, PunchMode } from '../types';
import { attendanceApi } from '../api/attendanceApi';
import {
  LogIn,
  LogOut,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Compass,
} from 'lucide-react';

interface PunchTabProps {
  currentUser: User;
  onRefresh: () => void;
}

export const PunchTab: React.FC<PunchTabProps> = ({ currentUser, onRefresh }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayData, setTodayData] = useState<TodayAttendanceResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [punchMode, setPunchMode] = useState<PunchMode>('OFFICE');
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // GPS State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's status whenever currentUser changes
  const fetchTodayStatus = async () => {
    try {
      const data = await attendanceApi.getTodayStatus(currentUser.id);
      setTodayData(data);
    } catch (err: any) {
      console.error('Failed to fetch today status', err);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
    acquireLocation();
  }, [currentUser.id]);

  // Acquire Browser GPS Coordinates
  const acquireLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        setGpsError(null);

        // Calculate distance to user's assigned office
        if (currentUser.office) {
          const dist = calculateDistance(
            lat,
            lng,
            currentUser.office.latitude,
            currentUser.office.longitude
          );
          setDistanceMeters(Math.round(dist));
        }
      },
      () => {
        setGpsError('Location access denied. Please enable GPS permissions.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Haversine distance calculation in frontend
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handlePunch = async (type: 'IN' | 'OUT') => {
    setActionLoading(true);
    setMessage(null);

    try {
      let lat = userCoords?.lat;
      let lng = userCoords?.lng;

      if (!lat || !lng) {
        if (currentUser.office) {
          lat = currentUser.office.latitude;
          lng = currentUser.office.longitude;
        }
      }

      if (type === 'IN') {
        const res = await attendanceApi.punchIn({
          userId: currentUser.id,
          latitude: lat,
          longitude: lng,
          punchMode,
          remarks: remarks || undefined,
        });
        setMessage({ text: res.message, type: 'success' });
      } else {
        const res = await attendanceApi.punchOut({
          userId: currentUser.id,
          latitude: lat,
          longitude: lng,
          punchMode,
          remarks: remarks || undefined,
        });
        setMessage({ text: res.message, type: 'success' });
      }

      setRemarks('');
      await fetchTodayStatus();
      onRefresh();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.message || 'Failed to complete attendance punch.';
      setMessage({ text: errMsg, type: 'danger' });
    } finally {
      setActionLoading(false);
    }
  };

  const isClockedIn = todayData?.currentStatus === 'CLOCKED_IN';
  const allowedRadius = currentUser.office?.radiusMeters || 150;
  const isInside = distanceMeters !== null && distanceMeters <= allowedRadius;

  return (
    <div>
      {/* Alert Banner */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Punch Card */}
      <div className="card">
        <div className="punch-container">
          <div className="live-time">
            {currentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
          <div className="live-date">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>

          {/* Circular Punch Button */}
          {isClockedIn ? (
            <button
              onClick={() => handlePunch('OUT')}
              disabled={actionLoading}
              className="punch-circle-btn punch-out"
            >
              <LogOut size={38} />
              <span>SIGN OUT</span>
            </button>
          ) : (
            <button
              onClick={() => handlePunch('IN')}
              disabled={actionLoading}
              className="punch-circle-btn punch-in"
            >
              <LogIn size={38} />
              <span>SIGN IN</span>
            </button>
          )}

          {/* Current Punch Status */}
          <div style={{ marginTop: '1.5rem' }}>
            {isClockedIn ? (
              <span className="badge badge-success">
                <CheckCircle size={12} /> Currently Clocked In
              </span>
            ) : (
              <span className="badge badge-warning">
                <Clock size={12} /> Ready to Clock In
              </span>
            )}
          </div>

          {/* Geofence Status Indicator */}
          <div className="geofence-strip">
            <Compass size={24} color={isInside ? '#16a34a' : '#d97706'} />
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Office: {currentUser.office?.name || 'Main Office'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {distanceMeters !== null ? (
                  isInside ? (
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>
                      ✅ Inside Geofence ({distanceMeters}m from office, Max: {allowedRadius}m)
                    </span>
                  ) : (
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>
                      ⚠️ Outside Geofence ({distanceMeters}m away, Allowed: {allowedRadius}m)
                    </span>
                  )
                ) : gpsError ? (
                  <span>{gpsError}</span>
                ) : (
                  <span>Detecting GPS coordinates...</span>
                )}
              </div>
            </div>
            <button
              onClick={acquireLocation}
              className="btn btn-sm"
              style={{ background: '#e2e8f0', color: '#334155' }}
            >
              <MapPin size={14} /> Refresh GPS
            </button>
          </div>

          {/* Punch Mode Selection */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%', maxWidth: '480px' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Punch Mode</label>
              <select
                className="form-select"
                value={punchMode}
                onChange={(e) => setPunchMode(e.target.value as PunchMode)}
              >
                <option value="OFFICE">🏢 Working from Office</option>
                <option value="REMOTE">🏠 Work from Home (Remote)</option>
                <option value="FIELD">🚗 Field Visit / Client Duty</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Remarks (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Client visit, traffic"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">First Sign In</span>
          <span className="stat-value">
            {todayData?.firstPunchIn
              ? new Date(todayData.firstPunchIn).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--:--'}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Last Sign Out</span>
          <span className="stat-value">
            {todayData?.lastPunchOut
              ? new Date(todayData.lastPunchOut).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--:--'}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Work Hours</span>
          <span className="stat-value" style={{ color: '#2563eb' }}>
            {todayData?.totalHoursWorked ? `${todayData.totalHoursWorked} hrs` : '0.0 hrs'}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Today's Status</span>
          <span className="stat-value" style={{ fontSize: '1.1rem' }}>
            {todayData?.currentStatus === 'CLOCKED_IN' ? (
              <span className="badge badge-success">Present (Working)</span>
            ) : todayData?.firstPunchIn ? (
              <span className="badge badge-info">Completed Shift</span>
            ) : (
              <span className="badge badge-warning">Not Started</span>
            )}
          </span>
        </div>
      </div>

      {/* Today's Punches Table */}
      <div className="card">
        <h3 className="card-title">
          <Calendar size={18} /> Today's Punch History ({todayData?.logs.length || 0})
        </h3>
        {todayData?.logs && todayData.logs.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Time</th>
                  <th>Mode</th>
                  <th>Distance to Office</th>
                  <th>Location Verified</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {todayData.logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      {log.punchType === 'IN' ? (
                        <span className="badge badge-success">Sign In</span>
                      ) : (
                        <span className="badge badge-danger">Sign Out</span>
                      )}
                    </td>
                    <td>{new Date(log.punchTime).toLocaleTimeString()}</td>
                    <td>{log.punchMode}</td>
                    <td>
                      {log.distanceFromOfficeMeters !== undefined && log.distanceFromOfficeMeters !== null
                        ? `${Math.round(log.distanceFromOfficeMeters)} meters`
                        : 'N/A'}
                    </td>
                    <td>
                      {log.isInsideOffice ? (
                        <span className="badge badge-success">Inside Geofence</span>
                      ) : (
                        <span className="badge badge-warning">Outside</span>
                      )}
                    </td>
                    <td>{log.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No punches recorded yet for today. Click "Sign In" above to register your attendance!
          </p>
        )}
      </div>
    </div>
  );
};
