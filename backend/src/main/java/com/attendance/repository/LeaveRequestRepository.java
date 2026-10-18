package com.attendance.repository;

import com.attendance.entity.LeaveRequest;
import com.attendance.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByUserIdOrderByAppliedAtDesc(Long userId);
    List<LeaveRequest> findByStatusOrderByAppliedAtDesc(LeaveStatus status);
    List<LeaveRequest> findByUserReportingManagerIdOrderByAppliedAtDesc(Long managerId);
    List<LeaveRequest> findByUserReportingManagerIdAndStatusOrderByAppliedAtDesc(Long managerId, LeaveStatus status);
}
