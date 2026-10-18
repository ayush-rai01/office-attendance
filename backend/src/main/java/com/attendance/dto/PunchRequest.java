package com.attendance.dto;

import com.attendance.entity.PunchMode;
import lombok.Data;

@Data
public class PunchRequest {
    private Long userId; // For identification (or extracted from auth token)
    private Double latitude;
    private Double longitude;
    private PunchMode punchMode = PunchMode.OFFICE;
    private String remarks;
}
