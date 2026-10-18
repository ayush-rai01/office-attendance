package com.attendance.dto;

import lombok.Data;

@Data
public class CreateOfficeRequest {
    private String name;
    private Double latitude;
    private Double longitude;
    private Double radiusMeters;
    private String address;
}
