import React, { useState, useEffect } from 'react';
import type { AttendanceLog, LeaveRequest, LeaveStatus, User } from '../types';
import { attendanceApi } from '../api/attendanceApi';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Bell,
  User as UserIcon,
  Clock,
  Users,
  RefreshCw,
  MapPin,
} from 'lucide-react';

interface ManagerApprovalsTabProps {
  currentUser: User;
}

export const ManagerApprovalsTab: React.FC<ManagerApprovalsTabProps> = ({ currentUser }) => {
  const [teamLeaves, setTeamLeaves] = useState<LeaveRequest[]>([]);
  const [teamLogs, setTeamLogs] = useState<AttendanceLog[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [loadingPunches, setLoadingPunches] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [remarksMap, setRemarksMap] = useState<Record<number, string>>({});

  const fetchTeamLeaves = async () => {
    try {
      setLoadingLeaves(true);
      let data: LeaveRequest[] = [];
      if (currentUser.role === 'ADMIN') {
        data = await attendanceApi.getPendingLeaves();
      } else {
        data = await attendanceApi.getLeavesForManager(currentUser.id);
      }
      setTeamLeaves(data);
    } catch (err: any) {
      console.error('Failed to load team leaves', err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const fetchTeamPunches = async () => {
    try {
      setLoadingPunches(true);
      let logs: AttendanceLog[] = [];
      if (currentUser.role === 'ADMIN') {
        logs = await attendanceApi.getAllTodayLogs();
      } else {
        logs = await attendanceApi.getTeamTodayLogs(currentUser.id);
      }
      setTeamLogs(logs);
    } catch (err: any) {
      console.error('Failed to load team punches', err);
    } finally {
      setLoadingPunches(false);
    }
  };

  const refreshAll = () => {
    fetchTeamLeaves();
    fetchTeamPunches();
  };

  useEffect(() => {
    refreshAll();
  }, [currentUser.id]);

  const handleDecision = async (leaveId: number, status: LeaveStatus) => {
    try {
      const remarks =
        remarksMap[leaveId] ||
        (status === 'APPROVED' ? 'Approved by Manager' : 'Rejected by Manager');
      await attendanceApi.updateLeaveStatus(leaveId, status, remarks);
      setActionMsg(`Leave request #${leaveId} has been successfully ${status.toLowerCase()}!`);
      setTimeout(() => setActionMsg(null), 4000);
      await fetchTeamLeaves();
    } catch (err: any) {
      alert('Failed to update leave status');
    }
  };

  const pendingLeaves = teamLeaves.filter((l) => l.status === 'PENDING');

  return (
    <div>
      {/* Notice Alert Banner for RM */}
      {pendingLeaves.length > 0 && (
        <div
          className="alert alert-warning"
          style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <Bell size={20} color="#b45309" />
          <div>
            <strong>Action Required:</strong> You have <strong>{pendingLeaves.length} pending leave request(s)</strong> awaiting your decision as Reporting Manager / Lead.
          </div>
        </div>
      )}

      {actionMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* ================= SECTION 1: TEAM LEAVE APPROVALS ================= */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            <ShieldCheck size={20} color="#2563eb" /> Team Leave Requests ({teamLeaves.length})
          </h3>
          <button
            onClick={fetchTeamLeaves}
            className="btn btn-sm"
            style={{ background: '#f1f5f9', color: '#334155', gap: '0.35rem' }}
          >
            <RefreshCw size={13} className={loadingLeaves ? 'animate-spin' : ''} /> Refresh Leaves
          </button>
        </div>

        {loadingLeaves ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
            Loading team leaves...
          </div>
        ) : teamLeaves.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Remarks & Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamLeaves.map((leave) => {
                  const isPending = leave.status === 'PENDING';

                  return (
                    <tr key={leave.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <UserIcon size={16} color="#64748b" />
                          <div>
                            <strong>{leave.user.fullName}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {leave.user.employeeCode || 'EMP'} • {leave.user.department || 'General'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{leave.leaveType}</span>
                      </td>
                      <td>
                        <strong>{leave.startDate}</strong> to <strong>{leave.endDate}</strong>
                      </td>
                      <td style={{ maxWidth: '200px' }}>{leave.reason || '-'}</td>
                      <td>
                        {leave.status === 'APPROVED' ? (
                          <span className="badge badge-success">Approved</span>
                        ) : leave.status === 'REJECTED' ? (
                          <span className="badge badge-danger">Rejected</span>
                        ) : (
                          <span className="badge badge-warning">Pending Approval</span>
                        )}
                      </td>
                      <td>
                        {isPending ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Remarks (optional)"
                              value={remarksMap[leave.id] || ''}
                              onChange={(e) =>
                                setRemarksMap({ ...remarksMap, [leave.id]: e.target.value })
                              }
                              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleDecision(leave.id, 'APPROVED')}
                                className="btn btn-sm btn-success"
                                style={{ flex: 1 }}
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button
                                onClick={() => handleDecision(leave.id, 'REJECTED')}
                                className="btn btn-sm btn-danger"
                                style={{ flex: 1 }}
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {leave.managerRemarks || 'Decision finalized'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No leave requests found for your team.
          </p>
        )}
      </div>

      {/* ================= SECTION 2: TEAM DAILY ATTENDANCE (PUNCHES) ================= */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="#059669" /> Team Today Attendance & Punches ({teamLogs.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
              Real-time sign in & sign out details of your direct and skip-level reportees
            </p>
          </div>
          <button
            onClick={fetchTeamPunches}
            className="btn btn-sm"
            style={{ background: '#f1f5f9', color: '#334155', gap: '0.35rem' }}
          >
            <RefreshCw size={13} className={loadingPunches ? 'animate-spin' : ''} /> Refresh Punches
          </button>
        </div>

        {loadingPunches ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
            Loading team attendance...
          </div>
        ) : teamLogs.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Punch Type</th>
                  <th>Time</th>
                  <th>Mode</th>
                  <th>Office Distance</th>
                  <th>Geofence Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {teamLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserIcon size={16} color="#64748b" />
                        <div>
                          <strong>{log.user.fullName}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {log.user.employeeCode || log.user.email} • {log.user.department || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {log.punchType === 'IN' ? (
                        <span className="badge badge-success" style={{ fontWeight: 700 }}>
                          SIGN IN
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                          SIGN OUT
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} color="#64748b" />
                        <strong>{new Date(log.punchTime).toLocaleTimeString()}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{log.punchMode}</span>
                    </td>
                    <td>
                      {log.distanceFromOfficeMeters !== undefined && log.distanceFromOfficeMeters !== null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                          <MapPin size={13} color="#64748b" />
                          <span>{Math.round(log.distanceFromOfficeMeters)} m</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td>
                      {log.isInsideOffice ? (
                        <span className="badge badge-success">Inside Office</span>
                      ) : (
                        <span className="badge badge-warning">Outside Office</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {log.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No sign-in / sign-out punches recorded by your team yet today.
          </p>
        )}
      </div>
    </div>
  );
};
