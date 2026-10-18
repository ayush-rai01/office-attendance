import React, { useState, useEffect } from 'react';
import type { AttendanceLog, LeaveRequest, Office, LeaveStatus } from '../types';
import { attendanceApi } from '../api/attendanceApi';
import { Users, CheckCircle, XCircle, MapPin, Building, ShieldCheck } from 'lucide-react';

export const AdminTab: React.FC = () => {
  const [allLogs, setAllLogs] = useState<AttendanceLog[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

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
        <h3 className="card-title">
          <Building size={18} /> Configured Office Locations & Geofences
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {offices.map((off) => (
            <div
              key={off.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <MapPin size={18} color="#2563eb" />
                <strong style={{ fontSize: '1rem' }}>{off.name}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>
                Latitude: {off.latitude}, Longitude: {off.longitude}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
                Allowed Punch Radius: {off.radiusMeters} meters
              </div>
              {off.address && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                  {off.address}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
