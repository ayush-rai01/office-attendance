package com.attendance.repository;

import com.attendance.entity.LeaveRequest;
import com.attendance.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByUserIdOrderByAppliedAtDesc(Long userId);
    List<LeaveRequest> findByStatusOrderByAppliedAtDesc(LeaveStatus status);
    List<LeaveRequest> findByUserReportingManagerIdOrderByAppliedAtDesc(Long managerId);
    List<LeaveRequest> findByUserReportingManagerIdAndStatusOrderByAppliedAtDesc(Long managerId, LeaveStatus status);

    // Skip-level query for Principal Lead & Reporting Manager:
    // Fetches leaves for direct reportees OR reportees of reportees
    @Query("SELECT l FROM LeaveRequest l WHERE l.user.reportingManager.id = :managerId OR l.user.reportingManager.reportingManager.id = :managerId ORDER BY l.appliedAt DESC")
    List<LeaveRequest> findLeavesForManagerOrLead(@Param("managerId") Long managerId);
}
