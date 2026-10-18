import React, { useState, useEffect } from 'react';
import type { AttendanceLog, LeaveRequest, Office, LeaveStatus, User } from '../types';
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
  UserPlus,
  UserCheck,
  Briefcase,
  Shield,
  Layers,
} from 'lucide-react';

export const AdminTab: React.FC = () => {
  const [allLogs, setAllLogs] = useState<AttendanceLog[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Office Edit Modal State
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [officeName, setOfficeName] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [officeLat, setOfficeLat] = useState<number>(0);
  const [officeLng, setOfficeLng] = useState<number>(0);
  const [officeRadius, setOfficeRadius] = useState<number>(150);
  const [savingOffice, setSavingOffice] = useState(false);

  // Create User Modal State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Password123');
  const [newEmployeeCode, setNewEmployeeCode] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newRole, setNewRole] = useState<'EMPLOYEE' | 'REPORTING_MANAGER' | 'PRINCIPAL_LEAD' | 'ADMIN'>('EMPLOYEE');
  const [newOfficeId, setNewOfficeId] = useState<number | undefined>(undefined);
  const [newReportingManagerId, setNewReportingManagerId] = useState<number | undefined>(undefined);
  const [newIsProbation, setNewIsProbation] = useState(false);
  const [newCasualLeave, setNewCasualLeave] = useState(12);
  const [newSickLeave, setNewSickLeave] = useState(8);
  const [newEarnedLeave, setNewEarnedLeave] = useState(15);
  const [creatingUser, setCreatingUser] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editEmployeeCode, setEditEmployeeCode] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<'EMPLOYEE' | 'REPORTING_MANAGER' | 'PRINCIPAL_LEAD' | 'ADMIN'>('EMPLOYEE');
  const [editOfficeId, setEditOfficeId] = useState<number | undefined>(undefined);
  const [editReportingManagerId, setEditReportingManagerId] = useState<number | undefined>(undefined);
  const [editIsProbation, setEditIsProbation] = useState(false);
  const [editCasualLeave, setEditCasualLeave] = useState(12);
  const [editSickLeave, setEditSickLeave] = useState(8);
  const [editEarnedLeave, setEditEarnedLeave] = useState(15);
  const [savingUser, setSavingUser] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [logsData, leavesData, officesData, usersData] = await Promise.all([
        attendanceApi.getAllTodayLogs(),
        attendanceApi.getPendingLeaves(),
        attendanceApi.getAllOffices(),
        attendanceApi.getAllUsers(),
      ]);
      setAllLogs(logsData);
      setPendingLeaves(leavesData);
      setOffices(officesData);
      setUsers(usersData);
      if (officesData.length > 0 && !newOfficeId) {
        setNewOfficeId(officesData[0].id);
      }
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

  // Toggle Probation for New User
  const handleNewProbationToggle = (isProbation: boolean) => {
    setNewIsProbation(isProbation);
    if (isProbation) {
      setNewCasualLeave(1); // Probation rule: only 1 CL
      setNewSickLeave(0);
      setNewEarnedLeave(0);
    } else {
      setNewCasualLeave(12);
      setNewSickLeave(8);
      setNewEarnedLeave(15);
    }
  };

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingUser(true);
      await attendanceApi.createUser({
        fullName: newFullName,
        email: newEmail,
        password: newPassword,
        employeeCode: newEmployeeCode,
        department: newDepartment,
        role: newRole,
        officeId: newOfficeId,
        reportingManagerId: newReportingManagerId || null,
        casualLeaveBalance: newCasualLeave,
        sickLeaveBalance: newSickLeave,
        earnedLeaveBalance: newEarnedLeave,
        isProbation: newIsProbation,
      });

      setActionMsg(`Employee '${newFullName}' onboarded successfully with role ${newRole}!`);
      setTimeout(() => setActionMsg(null), 4000);
      setShowCreateUserModal(false);
      // Reset form
      setNewFullName('');
      setNewEmail('');
      setNewPassword('Password123');
      setNewEmployeeCode('');
      setNewDepartment('Engineering');
      setNewRole('EMPLOYEE');
      setNewIsProbation(false);
      setNewCasualLeave(12);
      setNewSickLeave(8);
      setNewEarnedLeave(15);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create employee. Email might already exist.');
    } finally {
      setCreatingUser(false);
    }
  };

  // Open Edit User Modal
  const openEditUserModal = (u: User) => {
    setEditingUser(u);
    setEditFullName(u.fullName);
    setEditPassword('');
    setEditEmployeeCode(u.employeeCode || '');
    setEditDepartment(u.department || 'General');
    setEditRole(u.role);
    setEditOfficeId(u.office?.id);
    setEditReportingManagerId(u.reportingManager?.id);
    setEditIsProbation(u.isProbation || false);
    setEditCasualLeave(u.casualLeaveBalance ?? 12);
    setEditSickLeave(u.sickLeaveBalance ?? 8);
    setEditEarnedLeave(u.earnedLeaveBalance ?? 15);
  };

  // Toggle Probation for Editing User
  const handleEditProbationToggle = (isProbation: boolean) => {
    setEditIsProbation(isProbation);
    if (isProbation) {
      setEditCasualLeave(1);
      setEditSickLeave(0);
      setEditEarnedLeave(0);
    }
  };

  // Handle Save User Changes
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSavingUser(true);
      await attendanceApi.updateUser(editingUser.id, {
        fullName: editFullName,
        password: editPassword ? editPassword : null,
        employeeCode: editEmployeeCode,
        department: editDepartment,
        role: editRole,
        officeId: editOfficeId,
        reportingManagerId: editReportingManagerId || null,
        casualLeaveBalance: editCasualLeave,
        sickLeaveBalance: editSickLeave,
        earnedLeaveBalance: editEarnedLeave,
        isProbation: editIsProbation,
      });

      setActionMsg(`Profile and role for '${editFullName}' updated successfully!`);
      setTimeout(() => setActionMsg(null), 4000);
      setEditingUser(null);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update employee details.');
    } finally {
      setSavingUser(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', fontWeight: 700 }}>
            <Shield size={12} style={{ display: 'inline', marginRight: 4 }} /> HR Admin
          </span>
        );
      case 'PRINCIPAL_LEAD':
        return (
          <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9', fontWeight: 700 }}>
            <Layers size={12} style={{ display: 'inline', marginRight: 4 }} /> Principal Lead
          </span>
        );
      case 'REPORTING_MANAGER':
        return (
          <span className="badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
            <Briefcase size={12} style={{ display: 'inline', marginRight: 4 }} /> Reporting Manager
          </span>
        );
      default:
        return (
          <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
            <UserCheck size={12} style={{ display: 'inline', marginRight: 4 }} /> Employee
          </span>
        );
    }
  };

  return (
    <div>
      {actionMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* ================= SECTION 1: EMPLOYEE DIRECTORY & ROLE MANAGEMENT ================= */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="#2563eb" /> Employee Directory & Role Hierarchy ({users.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
              Create new staff, assign roles (Employee, RM, PL, HR), set credentials, reporting manager & leave quotas
            </p>
          </div>
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem' }}
          >
            <UserPlus size={16} /> + Onboard New Employee
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee & Code</th>
                <th>Work Email (User ID)</th>
                <th>Department</th>
                <th>Role</th>
                <th>Reporting Manager</th>
                <th>Leave Quota (CL/SL/EL)</th>
                <th>Probation Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.fullName}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {u.employeeCode || 'No Code'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>{u.email}</span>
                  </td>
                  <td>{u.department || 'N/A'}</td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td>
                    {u.reportingManager ? (
                      <div>
                        <strong>{u.reportingManager.fullName}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {u.reportingManager.role}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>None (Top Level)</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.8rem' }}>
                      <span className="badge badge-info" title="Casual Leave">{u.casualLeaveBalance ?? 12} CL</span>
                      <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }} title="Sick Leave">{u.sickLeaveBalance ?? 8} SL</span>
                      <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }} title="Earned Leave">{u.earnedLeaveBalance ?? 15} EL</span>
                    </div>
                  </td>
                  <td>
                    {u.isProbation ? (
                      <span className="badge badge-danger" title="Probation limit: 1 CL only">
                        Probation (1 CL)
                      </span>
                    ) : (
                      <span className="badge badge-success">Confirmed</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => openEditUserModal(u)}
                      className="btn btn-sm"
                      style={{ background: '#f1f5f9', color: '#2563eb', gap: '0.35rem' }}
                    >
                      <Edit2 size={13} /> Edit Role & Quota
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= SECTION 2: PENDING LEAVE APPROVALS ================= */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
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

      {/* ================= SECTION 3: OFFICE LOCATIONS & GEOFENCE CONFIG ================= */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} color="#2563eb" /> Office Locations & Geofence Configuration
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              HR has full authority to change office physical address & GPS verification radius
            </span>
          </div>
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
                    <Edit2 size={13} /> Edit Address & Geofence
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

      {/* ================= SECTION 4: REAL-TIME COMPANY-WIDE ATTENDANCE LOG ================= */}
      <div className="card">
        <h3 className="card-title">
          <Users size={18} /> Company-Wide Real-Time Office Presence Today ({allLogs.length} punches)
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

      {/* ================= MODAL: ONBOARD NEW EMPLOYEE ================= */}
      {showCreateUserModal && (
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
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={22} color="#2563eb" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Onboard New Employee
                </h3>
              </div>
              <button
                onClick={() => setShowCreateUserModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Michael Scott"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email (Login User ID) *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. michael@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Initial Password *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Temporary login password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. EMP005"
                    value={newEmployeeCode}
                    onChange={(e) => setNewEmployeeCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Engineering, Sales, HR"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Role *</label>
                  <select
                    className="form-select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Standard Access)</option>
                    <option value="REPORTING_MANAGER">REPORTING_MANAGER (Approve Leaves & See Punches)</option>
                    <option value="PRINCIPAL_LEAD">PRINCIPAL_LEAD (Skip-Level Lead over RMs & Teams)</option>
                    <option value="ADMIN">ADMIN (Full HR Administrative Control)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Assigned Office Location</label>
                  <select
                    className="form-select"
                    value={newOfficeId || ''}
                    onChange={(e) => setNewOfficeId(Number(e.target.value))}
                  >
                    {offices.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Reporting Manager</label>
                  <select
                    className="form-select"
                    value={newReportingManagerId || ''}
                    onChange={(e) =>
                      setNewReportingManagerId(e.target.value ? Number(e.target.value) : undefined)
                    }
                  >
                    <option value="">None (Top Level / Direct to Admin)</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Probation Period Setting */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={newIsProbation}
                    onChange={(e) => handleNewProbationToggle(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Employee is in Probation Period</span>
                </label>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.35rem 0 0 1.5rem' }}>
                  When checked, automatically restricts leave quota to <strong>1 Casual Leave (1 CL)</strong> and 0 Sick/Earned leaves.
                </p>
              </div>

              {/* Leave Balances */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Casual Leaves (CL)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newCasualLeave}
                    onChange={(e) => setNewCasualLeave(parseInt(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sick Leaves (SL)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newSickLeave}
                    onChange={(e) => setNewSickLeave(parseInt(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Earned Leaves (EL)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newEarnedLeave}
                    onChange={(e) => setNewEarnedLeave(parseInt(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="btn"
                  style={{ background: '#f1f5f9', color: '#334155' }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={creatingUser} className="btn btn-primary">
                  {creatingUser ? 'Creating...' : 'Create & Onboard Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT EMPLOYEE PROFILE & ROLE ================= */}
      {editingUser && (
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
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Edit Profile & Role: {editingUser.fullName}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editEmployeeCode}
                    onChange={(e) => setEditEmployeeCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Reset Password (leave empty to keep current)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="New password if resetting"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Role Assignment *</label>
                  <select
                    className="form-select"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Standard Access)</option>
                    <option value="REPORTING_MANAGER">REPORTING_MANAGER (Approve Leaves & See Punches)</option>
                    <option value="PRINCIPAL_LEAD">PRINCIPAL_LEAD (Skip-Level Lead over RMs & Teams)</option>
                    <option value="ADMIN">ADMIN (Full HR Administrative Control)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reporting Manager</label>
                  <select
                    className="form-select"
                    value={editReportingManagerId || ''}
                    onChange={(e) =>
                      setEditReportingManagerId(e.target.value ? Number(e.target.value) : undefined)
                    }
                  >
                    <option value="">None (Top Level / Direct to Admin)</option>
                    {users
                      .filter((u) => u.id !== editingUser.id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Probation Period Setting */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={editIsProbation}
                    onChange={(e) => handleEditProbationToggle(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Mark as Probation Employee</span>
                </label>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.35rem 0 0 1.5rem' }}>
                  If on probation, standard quota is locked to 1 Casual Leave (1 CL).
                </p>
              </div>

              {/* Leave Balances */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Casual Leaves (CL)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editCasualLeave}
                    onChange={(e) => setEditCasualLeave(parseInt(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sick Leaves (SL)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editSickLeave}
                    onChange={(e) => setEditSickLeave(parseInt(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Earned Leaves (EL)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editEarnedLeave}
                    onChange={(e) => setEditEarnedLeave(parseInt(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn"
                  style={{ background: '#f1f5f9', color: '#334155' }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingUser} className="btn btn-primary">
                  {savingUser ? 'Saving...' : 'Save Employee Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
