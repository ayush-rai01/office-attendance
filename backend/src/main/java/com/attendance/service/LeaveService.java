package com.attendance.service;

import com.attendance.dto.LeaveApplyRequest;
import com.attendance.entity.LeaveRequest;
import com.attendance.entity.LeaveStatus;
import com.attendance.entity.User;
import com.attendance.repository.LeaveRequestRepository;
import com.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public LeaveRequest updateLeaveStatus(Long leaveId, LeaveStatus status, String managerRemarks) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found with id: " + leaveId));

        leave.setStatus(status);
        leave.setManagerRemarks(managerRemarks);
        return leaveRequestRepository.save(leave);
    }
}
