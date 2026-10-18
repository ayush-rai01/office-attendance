import axios from 'axios';
import type {
  AttendanceLog,
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

  getAllUsers: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/users');
    return res.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
  },

  getAllOffices: async (): Promise<Office[]> => {
    const res = await api.get<Office[]>('/offices');
    return res.data;
  },

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
