package com.attendance.controller;

import com.attendance.dto.PunchRequest;
import com.attendance.dto.PunchResponse;
import com.attendance.dto.TodayAttendanceResponse;
import com.attendance.entity.AttendanceLog;
import com.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows React dev server to communicate
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/punch-in")
    public ResponseEntity<PunchResponse> punchIn(@RequestBody PunchRequest request) {
        PunchResponse response = attendanceService.processPunchIn(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/punch-out")
    public ResponseEntity<PunchResponse> punchOut(@RequestBody PunchRequest request) {
        PunchResponse response = attendanceService.processPunchOut(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/today/{userId}")
    public ResponseEntity<TodayAttendanceResponse> getTodayStatus(@PathVariable Long userId) {
        TodayAttendanceResponse response = attendanceService.getTodayStatus(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/live-all")
    public ResponseEntity<List<AttendanceLog>> getAllTodayLogs() {
        return ResponseEntity.ok(attendanceService.getAllTodayLogs());
    }

    @GetMapping("/team-today/{managerId}")
    public ResponseEntity<List<AttendanceLog>> getTeamTodayLogs(@PathVariable Long managerId) {
        return ResponseEntity.ok(attendanceService.getTeamTodayLogs(managerId));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<AttendanceLog>> getUserHistory(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(attendanceService.getUserAttendanceHistory(userId, from, to));
    }
}
