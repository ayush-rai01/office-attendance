package com.attendance.service;

import com.attendance.dto.PunchRequest;
import com.attendance.dto.PunchResponse;
import com.attendance.dto.TodayAttendanceResponse;
import com.attendance.entity.*;
import com.attendance.repository.AttendanceLogRepository;
import com.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceLogRepository attendanceLogRepository;
    private final UserRepository userRepository;
    private final GeofenceService geofenceService;

    @Transactional
    public PunchResponse processPunchIn(PunchRequest request) {
        User user = getUserOrThrow(request.getUserId());

        // Check last punch to prevent double Punch-In
        Optional<AttendanceLog> lastPunchOpt = attendanceLogRepository.findFirstByUserIdOrderByPunchTimeDesc(user.getId());
        if (lastPunchOpt.isPresent() && lastPunchOpt.get().getPunchType() == PunchType.IN) {
            throw new IllegalStateException("You are already signed in. Please sign out before signing in again.");
        }

        double distance = 0.0;
        boolean inside = true;
        double allowedRadius = 150.0; // default 150 meters if no office assigned

        if (user.getOffice() != null) {
            Office office = user.getOffice();
            allowedRadius = office.getRadiusMeters();
            if (request.getLatitude() != null && request.getLongitude() != null) {
                distance = geofenceService.calculateDistanceMeters(
                        request.getLatitude(), request.getLongitude(),
                        office.getLatitude(), office.getLongitude()
                );
                inside = distance <= allowedRadius;
            }
        }

        // If punch mode is OFFICE and user is outside geofence, reject or flag
        if (request.getPunchMode() == PunchMode.OFFICE && !inside) {
            throw new IllegalArgumentException(String.format(
                    "Sign-in rejected: You are %.1f meters away from office '%s' (Allowed: %.0f meters).",
                    distance, user.getOffice() != null ? user.getOffice().getName() : "Office", allowedRadius
            ));
        }

        AttendanceLog log = AttendanceLog.builder()
                .user(user)
                .punchType(PunchType.IN)
                .punchTime(LocalDateTime.now())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .distanceFromOfficeMeters(distance)
                .isInsideOffice(inside)
                .punchMode(request.getPunchMode())
                .remarks(request.getRemarks())
                .build();

        AttendanceLog saved = attendanceLogRepository.save(log);

        return PunchResponse.builder()
                .logId(saved.getId())
                .userId(user.getId())
                .userName(user.getFullName())
                .punchType(PunchType.IN)
                .punchTime(saved.getPunchTime())
                .isInsideOffice(inside)
                .distanceFromOfficeMeters(distance)
                .officeAllowedRadiusMeters(allowedRadius)
                .message("Signed in successfully!")
                .build();
    }

    @Transactional
    public PunchResponse processPunchOut(PunchRequest request) {
        User user = getUserOrThrow(request.getUserId());

        Optional<AttendanceLog> lastPunchOpt = attendanceLogRepository.findFirstByUserIdOrderByPunchTimeDesc(user.getId());
        if (lastPunchOpt.isEmpty() || lastPunchOpt.get().getPunchType() == PunchType.OUT) {
            throw new IllegalStateException("You are not signed in. You must sign in before signing out.");
        }

        double distance = 0.0;
        boolean inside = true;
        double allowedRadius = 150.0;

        if (user.getOffice() != null && request.getLatitude() != null && request.getLongitude() != null) {
            Office office = user.getOffice();
            allowedRadius = office.getRadiusMeters();
            distance = geofenceService.calculateDistanceMeters(
                    request.getLatitude(), request.getLongitude(),
                    office.getLatitude(), office.getLongitude()
            );
            inside = distance <= allowedRadius;
        }

        AttendanceLog log = AttendanceLog.builder()
                .user(user)
                .punchType(PunchType.OUT)
                .punchTime(LocalDateTime.now())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .distanceFromOfficeMeters(distance)
                .isInsideOffice(inside)
                .punchMode(request.getPunchMode())
                .remarks(request.getRemarks())
                .build();

        AttendanceLog saved = attendanceLogRepository.save(log);

        return PunchResponse.builder()
                .logId(saved.getId())
                .userId(user.getId())
                .userName(user.getFullName())
                .punchType(PunchType.OUT)
                .punchTime(saved.getPunchTime())
                .isInsideOffice(inside)
                .distanceFromOfficeMeters(distance)
                .officeAllowedRadiusMeters(allowedRadius)
                .message("Signed out successfully!")
                .build();
    }

    public TodayAttendanceResponse getTodayStatus(Long userId) {
        getUserOrThrow(userId);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<AttendanceLog> todayLogs = attendanceLogRepository.findByUserIdAndPunchTimeBetweenOrderByPunchTimeAsc(
                userId, startOfDay, endOfDay
        );

        if (todayLogs.isEmpty()) {
            return TodayAttendanceResponse.builder()
                    .currentStatus("NOT_STARTED")
                    .firstPunchIn(null)
                    .lastPunchOut(null)
                    .totalHoursWorked(0.0)
                    .logs(List.of())
                    .build();
        }

        AttendanceLog firstIn = null;
        AttendanceLog lastOut = null;
        long totalSeconds = 0;
        LocalDateTime tempIn = null;

        for (AttendanceLog l : todayLogs) {
            if (l.getPunchType() == PunchType.IN) {
                if (firstIn == null) firstIn = l;
                tempIn = l.getPunchTime();
            } else if (l.getPunchType() == PunchType.OUT) {
                lastOut = l;
                if (tempIn != null) {
                    totalSeconds += Duration.between(tempIn, l.getPunchTime()).getSeconds();
                    tempIn = null;
                }
            }
        }

        // If currently still signed in, count time up to now
        if (tempIn != null) {
            totalSeconds += Duration.between(tempIn, LocalDateTime.now()).getSeconds();
        }

        AttendanceLog lastLog = todayLogs.get(todayLogs.size() - 1);
        String currentStatus = lastLog.getPunchType() == PunchType.IN ? "CLOCKED_IN" : "CLOCKED_OUT";
        double totalHours = Math.round((totalSeconds / 3600.0) * 100.0) / 100.0;

        return TodayAttendanceResponse.builder()
                .currentStatus(currentStatus)
                .firstPunchIn(firstIn != null ? firstIn.getPunchTime() : null)
                .lastPunchOut(lastOut != null ? lastOut.getPunchTime() : null)
                .totalHoursWorked(totalHours)
                .logs(todayLogs)
                .build();
    }

    public List<AttendanceLog> getAllTodayLogs() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return attendanceLogRepository.findByPunchTimeBetweenOrderByPunchTimeDesc(startOfDay, endOfDay);
    }

    public List<AttendanceLog> getTeamTodayLogs(Long managerId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return attendanceLogRepository.findTeamTodayLogs(managerId, startOfDay, endOfDay);
    }

    public List<AttendanceLog> getUserAttendanceHistory(Long userId, LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);
        return attendanceLogRepository.findUserAttendanceBetween(userId, start, end);
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
    }
}
