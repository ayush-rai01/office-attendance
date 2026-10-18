import React, { useState, useEffect } from 'react';
import type { AttendanceLog, LeaveRequest, Office, LeaveStatus } from '../types';
import { attendanceApi } from '../api/attendanceApi';
import {
  Users,
  CheckCircle,
  XCircle,
  MapPin,
  Building,
  ShieldCheck,
  Edit2,
  X,
  Compass,
} from 'lucide-react';

export const AdminTab: React.FC = () => {
  const [allLogs, setAllLogs] = useState<AttendanceLog[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Office Edit Modal State
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [officeName, setOfficeName] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [officeLat, setOfficeLat] = useState<number>(0);
  const [officeLng, setOfficeLng] = useState<number>(0);
  const [officeRadius, setOfficeRadius] = useState<number>(150);
  const [savingOffice, setSavingOffice] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [logsData, leavesData, officesData] = await Promise.all([
        attendanceApi.getAllTodayLogs(),
        attendanceApi.getPendingLeaves(),
        attendanceApi.getAllOffices(),
      ]);
      setAllLogs(logsData);
      setPendingLeaves(leavesData);
      setOffices(officesData);
    } catch (err: any) {
      console.error('Error fetching admin data', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleLeaveDecision = async (leaveId: number, status: LeaveStatus) => {
    try {
      await attendanceApi.updateLeaveStatus(
        leaveId,
        status,
        status === 'APPROVED' ? 'Approved by Admin' : 'Rejected by Admin'
      );
      setActionMsg(`Leave request #${leaveId} has been ${status.toLowerCase()}!`);
      setTimeout(() => setActionMsg(null), 4000);
      await fetchAdminData();
    } catch (err: any) {
      alert('Failed to update leave request status');
    }
  };

  // Open Edit Modal for an Office
  const openEditOfficeModal = (office: Office) => {
    setEditingOffice(office);
    setOfficeName(office.name);
    setOfficeAddress(office.address || '');
    setOfficeLat(office.latitude);
    setOfficeLng(office.longitude);
    setOfficeRadius(office.radiusMeters);
  };

  // Auto-detect current device GPS coordinates for the office
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOfficeLat(Number(pos.coords.latitude.toFixed(7)));
        setOfficeLng(Number(pos.coords.longitude.toFixed(7)));
        alert('Office GPS coordinates filled with your current location!');
      },
      () => {
        alert('Could not detect GPS location. Please allow browser location permissions.');
      },
      { enableHighAccuracy: true }
    );
  };

  // Save updated office address & geofence
  const handleSaveOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffice) return;

    try {
      setSavingOffice(true);
      await attendanceApi.updateOffice(editingOffice.id, {
        name: officeName,
        address: officeAddress,
        latitude: officeLat,
        longitude: officeLng,
        radiusMeters: officeRadius,
      });

      setActionMsg(`Office address & geofence for '${officeName}' updated successfully!`);
      setTimeout(() => setActionMsg(null), 4000);
      setEditingOffice(null);
      await fetchAdminData();
    } catch (err: any) {
      alert('Failed to update office address.');
    } finally {
      setSavingOffice(false);
    }
  };

  return (
    <div>
      {actionMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Pending Leave Approvals Section */}
      <div className="card">
        <h3 className="card-title">
          <ShieldCheck size={18} /> Pending Leave Approvals ({pendingLeaves.length})
        </h3>

        {pendingLeaves.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>From - To</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <strong>{leave.user.fullName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {leave.user.email}
                      </div>
                    </td>
                    <td>{leave.user.department || 'N/A'}</td>
                    <td>
                      <span className="badge badge-info">{leave.leaveType}</span>
                    </td>
                    <td>
                      {leave.startDate} to {leave.endDate}
                    </td>
                    <td>{leave.reason || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleLeaveDecision(leave.id, 'APPROVED')}
                          className="btn btn-sm btn-success"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleLeaveDecision(leave.id, 'REJECTED')}
                          className="btn btn-sm btn-danger"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No pending leave requests requiring approval.
          </p>
        )}
      </div>

      {/* Live Today Attendance Log for All Employees */}
      <div className="card">
        <h3 className="card-title">
          <Users size={18} /> Real-Time Office Presence Today ({allLogs.length} punches)
        </h3>

        {allLogs.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Punch Time</th>
                  <th>Mode</th>
                  <th>Distance from Office</th>
                  <th>Geofence Status</th>
                </tr>
              </thead>
              <tbody>
                {allLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <strong>{log.user.fullName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {log.user.employeeCode || log.user.email}
                      </div>
                    </td>
                    <td>
                      {log.punchType === 'IN' ? (
                        <span className="badge badge-success">IN</span>
                      ) : (
                        <span className="badge badge-danger">OUT</span>
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
                        <span className="badge badge-success">Verified Inside</span>
                      ) : (
                        <span className="badge badge-warning">Outside Office</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No employee punches recorded yet today.
          </p>
        )}
      </div>

      {/* Office Locations & Geofence Config */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            <Building size={18} /> Office Locations & Geofence Configuration
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            HR can update building address & GPS radius
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {offices.map((off) => (
            <div
              key={off.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} color="#2563eb" />
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{off.name}</strong>
                  </div>
                  <button
                    onClick={() => openEditOfficeModal(off)}
                    className="btn btn-sm"
                    style={{ background: '#e0f2fe', color: '#0284c7', gap: '0.35rem' }}
                  >
                    <Edit2 size={13} /> Edit Address
                  </button>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem' }}>
                  <strong>Address:</strong> {off.address || 'Address not configured'}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  Coordinates: <code>{off.latitude}, {off.longitude}</code>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
                  Allowed Punch Radius: {off.radiusMeters} meters
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL: EDIT OFFICE ADDRESS & GEOFENCE ================= */}
      {editingOffice && (
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
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Update Office Address & Geofence
                </h3>
              </div>
              <button
                onClick={() => setEditingOffice(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveOffice}>
              <div className="form-group">
                <label className="form-label">Office Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Office Physical Address</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. 100 Feet Road, Tower B, Cyber City, Bangalore"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={officeLat}
                    onChange={(e) => setOfficeLat(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={officeLng}
                    onChange={(e) => setOfficeLng(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={handleDetectCurrentLocation}
                  className="btn btn-sm"
                  style={{ background: '#f1f5f9', color: '#2563eb', border: '1px solid #bfdbfe' }}
                >
                  <Compass size={14} /> Detect & Use My Current Location
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  Allowed Geofence Radius (meters)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={officeRadius}
                  onChange={(e) => setOfficeRadius(parseFloat(e.target.value) || 100)}
                  min="20"
                  max="5000"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Employees must be within this distance from the office building coordinates to punch in as 'OFFICE'.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingOffice(null)}
                  className="btn"
                  style={{ background: '#f1f5f9', color: '#334155' }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingOffice} className="btn btn-primary">
                  {savingOffice ? 'Saving...' : 'Save Office Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
