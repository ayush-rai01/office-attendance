import React, { useState, useEffect } from 'react';
import type { LeaveRequest, LeaveStatus, User } from '../types';
import { attendanceApi } from '../api/attendanceApi';
import { ShieldCheck, CheckCircle, XCircle, Bell, User as UserIcon } from 'lucide-react';

interface ManagerApprovalsTabProps {
  currentUser: User;
}

export const ManagerApprovalsTab: React.FC<ManagerApprovalsTabProps> = ({ currentUser }) => {
  const [teamLeaves, setTeamLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [remarksMap, setRemarksMap] = useState<Record<number, string>>({});

  const fetchTeamLeaves = async () => {
    try {
      setLoading(true);
      // If user is ADMIN, show all pending leaves; if MANAGER, show leaves for this manager
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamLeaves();
  }, [currentUser.id]);

  const handleDecision = async (leaveId: number, status: LeaveStatus) => {
    try {
      const remarks = remarksMap[leaveId] || (status === 'APPROVED' ? 'Approved by Reporting Manager' : 'Rejected by Reporting Manager');
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
          }}
        >
          <Bell size={20} color="#b45309" />
          <div>
            <strong>Action Required:</strong> You have <strong>{pendingLeaves.length} pending leave request(s)</strong> awaiting your decision as Reporting Manager.
          </div>
        </div>
      )}

      {actionMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Pending Leave Requests Card */}
      <div className="card">
        <h3 className="card-title">
          <ShieldCheck size={20} color="#2563eb" /> Team Leave Requests ({teamLeaves.length})
        </h3>

        {loading ? (
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
                  <th>Current Status</th>
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Manager remarks (optional)"
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
    </div>
  );
};
