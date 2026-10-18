package com.attendance.service;

import com.attendance.dto.RegisterUserRequest;
import com.attendance.entity.Office;
import com.attendance.entity.User;
import com.attendance.repository.OfficeRepository;
import com.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OfficeRepository officeRepository;

    @Transactional
    public User registerUser(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with email " + request.getEmail() + " already exists.");
        }

        Office office = null;
        if (request.getOfficeId() != null) {
            office = officeRepository.findById(request.getOfficeId()).orElse(null);
        }

        User reportingManager = null;
        if (request.getReportingManagerId() != null) {
            reportingManager = userRepository.findById(request.getReportingManagerId()).orElse(null);
        }

        // Handle Probation Rule: In probation, default to 1 Casual Leave, 0 Sick, 0 Earned unless specified
        int cl = request.getCasualLeaveBalance() != null ? request.getCasualLeaveBalance() : (Boolean.TRUE.equals(request.getIsProbation()) ? 1 : 12);
        int sl = request.getSickLeaveBalance() != null ? request.getSickLeaveBalance() : (Boolean.TRUE.equals(request.getIsProbation()) ? 0 : 8);
        int el = request.getEarnedLeaveBalance() != null ? request.getEarnedLeaveBalance() : (Boolean.TRUE.equals(request.getIsProbation()) ? 0 : 15);

        User user = User.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .password(request.getPassword())
                .employeeCode(request.getEmployeeCode())
                .department(request.getDepartment())
                .role(request.getRole())
                .office(office)
                .reportingManager(reportingManager)
                .casualLeaveBalance(cl)
                .sickLeaveBalance(sl)
                .earnedLeaveBalance(el)
                .isProbation(Boolean.TRUE.equals(request.getIsProbation()))
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, RegisterUserRequest request) {
        User user = getUserById(id);

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPassword() != null && !request.getPassword().isBlank()) user.setPassword(request.getPassword());
        if (request.getEmployeeCode() != null) user.setEmployeeCode(request.getEmployeeCode());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getRole() != null) user.setRole(request.getRole());

        if (request.getOfficeId() != null) {
            Office office = officeRepository.findById(request.getOfficeId()).orElse(null);
            user.setOffice(office);
        }

        if (request.getReportingManagerId() != null) {
            User rm = userRepository.findById(request.getReportingManagerId()).orElse(null);
            user.setReportingManager(rm);
        } else if (request.getReportingManagerId() == null && request.getRole() != null) {
            // Keep existing or allow clearing if needed
        }

        if (request.getCasualLeaveBalance() != null) user.setCasualLeaveBalance(request.getCasualLeaveBalance());
        if (request.getSickLeaveBalance() != null) user.setSickLeaveBalance(request.getSickLeaveBalance());
        if (request.getEarnedLeaveBalance() != null) user.setEarnedLeaveBalance(request.getEarnedLeaveBalance());
        if (request.getIsProbation() != null) user.setIsProbation(request.getIsProbation());

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }
}
