package com.attendance.repository;

import com.attendance.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {

    // Find the latest punch for a specific user
    Optional<AttendanceLog> findFirstByUserIdOrderByPunchTimeDesc(Long userId);

    // Find logs of a user between two timestamps (e.g., today from 00:00 to 23:59:59)
    List<AttendanceLog> findByUserIdAndPunchTimeBetweenOrderByPunchTimeAsc(
            Long userId, LocalDateTime start, LocalDateTime end
    );

    // Find all punches for all users today (for Admin/HR live view)
    List<AttendanceLog> findByPunchTimeBetweenOrderByPunchTimeDesc(
            LocalDateTime start, LocalDateTime end
    );

    // Find user's logs between dates for monthly report
    @Query("SELECT a FROM AttendanceLog a WHERE a.user.id = :userId AND a.punchTime BETWEEN :start AND :end ORDER BY a.punchTime ASC")
    List<AttendanceLog> findUserAttendanceBetween(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
