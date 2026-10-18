export interface Office {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address?: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  password?: string;
  employeeCode?: string;
  department?: string;
  role: 'EMPLOYEE' | 'REPORTING_MANAGER' | 'PRINCIPAL_LEAD' | 'ADMIN';
  office?: Office;
  reportingManager?: User;
  casualLeaveBalance?: number;
  sickLeaveBalance?: number;
  earnedLeaveBalance?: number;
  isProbation?: boolean;
}

export type PunchType = 'IN' | 'OUT';
export type PunchMode = 'OFFICE' | 'REMOTE' | 'FIELD';

export interface AttendanceLog {
  id: number;
  user: User;
  punchType: PunchType;
  punchTime: string;
  latitude?: number;
  longitude?: number;
  distanceFromOfficeMeters?: number;
  isInsideOffice?: boolean;
  punchMode: PunchMode;
  remarks?: string;
}

export interface TodayAttendanceResponse {
  currentStatus: 'NOT_STARTED' | 'CLOCKED_IN' | 'CLOCKED_OUT';
  firstPunchIn: string | null;
  lastPunchOut: string | null;
  totalHoursWorked: number;
  logs: AttendanceLog[];
}

export interface PunchResponse {
  logId: number;
  userId: number;
  userName: string;
  punchType: PunchType;
  punchTime: string;
  isInsideOffice: boolean;
  distanceFromOfficeMeters: number;
  officeAllowedRadiusMeters: number;
  message: string;
}

export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: number;
  user: User;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  managerRemarks?: string;
  appliedAt: string;
}

export interface Holiday {
  id: number;
  name: string;
  holidayDate: string;
  dayOfWeek: string;
  holidayType: string;
  description?: string;
  isGovernmentHoliday?: boolean;
}

