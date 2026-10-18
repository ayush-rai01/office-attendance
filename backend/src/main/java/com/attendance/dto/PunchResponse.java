package com.attendance.dto;

import com.attendance.entity.PunchType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PunchResponse {
    private Long logId;
    private Long userId;
    private String userName;
    private PunchType punchType;
    private LocalDateTime punchTime;
    private Boolean isInsideOffice;
    private Double distanceFromOfficeMeters;
    private Double officeAllowedRadiusMeters;
    private String message;
}
