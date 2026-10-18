import axios from 'axios';
import type {
  AttendanceLog,
  Holiday,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  Office,
  PunchMode,
  PunchResponse,
  TodayAttendanceResponse,
  User,
} from '../types';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const attendanceApi = {
  // Authentication
  login: async (email: string, password: string): Promise<User> => {
    const res = await api.post<User>('/auth/login', { email, password });
    return res.data;
  },

  // Attendance
  punchIn: async (data: {
    userId: number;
    latitude?: number;
    longitude?: number;
    punchMode: PunchMode;
    remarks?: string;
  }): Promise<PunchResponse> => {
    const res = await api.post<PunchResponse>('/attendance/punch-in', data);
    return res.data;
  },

  punchOut: async (data: {
    userId: number;
    latitude?: number;
    longitude?: number;
    punchMode: PunchMode;
    remarks?: string;
  }): Promise<PunchResponse> => {
    const res = await api.post<PunchResponse>('/attendance/punch-out', data);
    return res.data;
  },

  getTodayStatus: async (userId: number): Promise<TodayAttendanceResponse> => {
    const res = await api.get<TodayAttendanceResponse>(`/attendance/today/${userId}`);
    return res.data;
  },

  getAllTodayLogs: async (): Promise<AttendanceLog[]> => {
    const res = await api.get<AttendanceLog[]>('/attendance/live-all');
    return res.data;
  },

  getUserHistory: async (userId: number, from: string, to: string): Promise<AttendanceLog[]> => {
    const res = await api.get<AttendanceLog[]>(`/attendance/history/${userId}`, {
      params: { from, to },
    });
    return res.data;
  },

  // Users
  getAllUsers: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/users');
    return res.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
  },

  // Offices
  getAllOffices: async (): Promise<Office[]> => {
    const res = await api.get<Office[]>('/offices');
    return res.data;
  },

  updateOffice: async (id: number, data: Partial<Office>): Promise<Office> => {
    const res = await api.put<Office>(`/offices/${id}`, data);
    return res.data;
  },

  // Holidays
  getAllHolidays: async (): Promise<Holiday[]> => {
    const res = await api.get<Holiday[]>('/holidays');
    return res.data;
  },

  createHoliday: async (data: Partial<Holiday>): Promise<Holiday> => {
    const res = await api.post<Holiday>('/holidays', data);
    return res.data;
  },

  updateHoliday: async (id: number, data: Partial<Holiday>): Promise<Holiday> => {
    const res = await api.put<Holiday>(`/holidays/${id}`, data);
    return res.data;
  },

  deleteHoliday: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/holidays/${id}`);
    return res.data;
  },

  // Leaves
  applyLeave: async (data: {
    userId: number;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<LeaveRequest> => {
    const res = await api.post<LeaveRequest>('/leaves/apply', data);
    return res.data;
  },

  getUserLeaves: async (userId: number): Promise<LeaveRequest[]> => {
    const res = await api.get<LeaveRequest[]>(`/leaves/user/${userId}`);
    return res.data;
  },

  getPendingLeaves: async (): Promise<LeaveRequest[]> => {
    const res = await api.get<LeaveRequest[]>('/leaves/pending');
    return res.data;
  },

  getLeavesForManager: async (managerId: number): Promise<LeaveRequest[]> => {
    const res = await api.get<LeaveRequest[]>(`/leaves/manager/${managerId}`);
    return res.data;
  },

  getPendingLeavesForManager: async (managerId: number): Promise<LeaveRequest[]> => {
    const res = await api.get<LeaveRequest[]>(`/leaves/manager/${managerId}/pending`);
    return res.data;
  },

  updateLeaveStatus: async (
    leaveId: number,
    status: LeaveStatus,
    remarks?: string
  ): Promise<LeaveRequest> => {
    const res = await api.put<LeaveRequest>(`/leaves/${leaveId}/status`, null, {
      params: { status, remarks },
    });
    return res.data;
  },
};
