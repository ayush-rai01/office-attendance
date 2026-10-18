package com.attendance.service;

import com.attendance.dto.LeaveApplyRequest;
import com.attendance.entity.LeaveRequest;
import com.attendance.entity.LeaveStatus;
import com.attendance.entity.LeaveType;
import com.attendance.entity.User;
import com.attendance.repository.LeaveRequestRepository;
import com.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public LeaveRequest applyLeave(LeaveApplyRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }

        // Check probation and balance constraints
        long requestedDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;

        if (request.getLeaveType() == LeaveType.CASUAL && user.getCasualLeaveBalance() < requestedDays) {
            throw new IllegalArgumentException(String.format(
                    "Insufficient Casual Leave balance! You have %d day(s) available, but requested %d day(s).",
                    user.getCasualLeaveBalance(), requestedDays));
        } else if (request.getLeaveType() == LeaveType.SICK && user.getSickLeaveBalance() < requestedDays) {
            throw new IllegalArgumentException(String.format(
                    "Insufficient Sick Leave balance! You have %d day(s) available, but requested %d day(s).",
                    user.getSickLeaveBalance(), requestedDays));
        } else if (request.getLeaveType() == LeaveType.EARNED && user.getEarnedLeaveBalance() < requestedDays) {
            throw new IllegalArgumentException(String.format(
                    "Insufficient Earned Leave balance! You have %d day(s) available, but requested %d day(s).",
                    user.getEarnedLeaveBalance(), requestedDays));
        }

        LeaveRequest leave = LeaveRequest.builder()
                .user(user)
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        return leaveRequestRepository.save(leave);
    }

    public List<LeaveRequest> getUserLeaves(Long userId) {
        return leaveRequestRepository.findByUserIdOrderByAppliedAtDesc(userId);
    }

    public List<LeaveRequest> getPendingLeaves() {
        return leaveRequestRepository.findByStatusOrderByAppliedAtDesc(LeaveStatus.PENDING);
    }

    public List<LeaveRequest> getLeavesForManager(Long managerId) {
        // Supports both direct Reporting Manager and skip-level Principal Lead
        return leaveRequestRepository.findLeavesForManagerOrLead(managerId);
    }

    public List<LeaveRequest> getPendingLeavesForManager(Long managerId) {
        return leaveRequestRepository.findLeavesForManagerOrLead(managerId).stream()
                .filter(l -> l.getStatus() == LeaveStatus.PENDING)
                .toList();
    }

    @Transactional
    public LeaveRequest updateLeaveStatus(Long leaveId, LeaveStatus status, String managerRemarks) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found with id: " + leaveId));

        // When approved, deduct days from the employee's active balance
        if (leave.getStatus() == LeaveStatus.PENDING && status == LeaveStatus.APPROVED) {
            long days = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
            User user = leave.getUser();

            if (leave.getLeaveType() == LeaveType.CASUAL) {
                user.setCasualLeaveBalance(Math.max(0, user.getCasualLeaveBalance() - (int) days));
            } else if (leave.getLeaveType() == LeaveType.SICK) {
                user.setSickLeaveBalance(Math.max(0, user.getSickLeaveBalance() - (int) days));
            } else if (leave.getLeaveType() == LeaveType.EARNED) {
                user.setEarnedLeaveBalance(Math.max(0, user.getEarnedLeaveBalance() - (int) days));
            }
            userRepository.save(user);
        }

        leave.setStatus(status);
        leave.setManagerRemarks(managerRemarks);
        return leaveRequestRepository.save(leave);
    }
}
