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
}
