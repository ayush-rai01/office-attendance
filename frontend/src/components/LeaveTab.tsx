import React, { useState, useEffect } from 'react';
import type { User, LeaveRequest, LeaveType } from '../types';
import { attendanceApi } from '../api/attendanceApi';
import { Calendar, CheckCircle, PlusCircle, AlertCircle } from 'lucide-react';

interface LeaveTabProps {
  currentUser: User;
}

export const LeaveTab: React.FC<LeaveTabProps> = ({ currentUser }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      const data = await attendanceApi.getUserLeaves(currentUser.id);
      setLeaves(data);
    } catch (err: any) {
      console.error('Failed to fetch leaves', err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [currentUser.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      setMessage({ text: 'Please fill in all leave details.', type: 'danger' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      await attendanceApi.applyLeave({
        userId: currentUser.id,
        leaveType,
        startDate,
        endDate,
        reason,
      });

      setMessage({ text: 'Leave application submitted successfully!', type: 'success' });
      setReason('');
      setStartDate('');
      setEndDate('');
      await fetchLeaves();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to submit leave application.';
      setMessage({ text: errMsg, type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Leave Balances Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Casual Leave</span>
          <span className="stat-value" style={{ color: '#2563eb' }}>
            10 <span style={{ fontSize: '0.85rem', color: '#64748b' }}>days available</span>
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Sick Leave</span>
          <span className="stat-value" style={{ color: '#16a34a' }}>
            8 <span style={{ fontSize: '0.85rem', color: '#64748b' }}>days available</span>
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Earned Leave</span>
          <span className="stat-value" style={{ color: '#d97706' }}>
            15 <span style={{ fontSize: '0.85rem', color: '#64748b' }}>days available</span>
          </span>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Apply Leave Card */}
      <div className="card">
        <h3 className="card-title">
          <PlusCircle size={18} /> Apply for Leave
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select
                className="form-select"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              >
                <option value="CASUAL">Casual Leave (CL)</option>
                <option value="SICK">Sick Leave (SL)</option>
                <option value="EARNED">Earned Leave (EL)</option>
                <option value="UNPAID">Loss of Pay (Unpaid)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Leave</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Family function, medical checkup, personal work"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </form>
      </div>

      {/* My Leave Requests History */}
      <div className="card">
        <h3 className="card-title">
          <Calendar size={18} /> My Leave Applications ({leaves.length})
        </h3>

        {leaves.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Manager Remarks</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.leaveType}</strong></td>
                    <td>{l.startDate} to {l.endDate}</td>
                    <td>{l.reason || '-'}</td>
                    <td>
                      {l.status === 'APPROVED' ? (
                        <span className="badge badge-success">Approved</span>
                      ) : l.status === 'REJECTED' ? (
                        <span className="badge badge-danger">Rejected</span>
                      ) : (
                        <span className="badge badge-warning">Pending Review</span>
                      )}
                    </td>
                    <td>{l.managerRemarks || '-'}</td>
                    <td>{new Date(l.appliedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
            You haven't applied for any leaves yet.
          </p>
        )}
      </div>
    </div>
  );
};
