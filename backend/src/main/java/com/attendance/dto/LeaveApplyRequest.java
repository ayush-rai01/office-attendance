package com.attendance.dto;

import com.attendance.entity.LeaveType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveApplyRequest {
    private Long userId;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
}
