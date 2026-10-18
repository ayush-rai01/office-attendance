package com.attendance.dto;

import com.attendance.entity.AttendanceLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodayAttendanceResponse {
    private String currentStatus; // "NOT_STARTED", "CLOCKED_IN", "CLOCKED_OUT"
    private LocalDateTime firstPunchIn;
    private LocalDateTime lastPunchOut;
    private Double totalHoursWorked;
    private List<AttendanceLog> logs;
}
