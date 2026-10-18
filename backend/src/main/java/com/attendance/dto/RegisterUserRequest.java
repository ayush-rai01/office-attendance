package com.attendance.dto;

import com.attendance.entity.Role;
import lombok.Data;

@Data
public class RegisterUserRequest {
    private String email;
    private String fullName;
    private String password;
    private String employeeCode;
    private String department;
    private Role role = Role.EMPLOYEE;
    private Long officeId;
    private Long reportingManagerId;
    private Integer casualLeaveBalance = 12;
    private Integer sickLeaveBalance = 8;
    private Integer earnedLeaveBalance = 15;
    private Boolean isProbation = false;
}
