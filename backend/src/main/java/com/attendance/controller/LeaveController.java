package com.attendance.controller;

import com.attendance.dto.LeaveApplyRequest;
import com.attendance.entity.LeaveRequest;
import com.attendance.entity.LeaveStatus;
import com.attendance.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping("/apply")
    public ResponseEntity<LeaveRequest> applyLeave(@RequestBody LeaveApplyRequest request) {
        return ResponseEntity.ok(leaveService.applyLeave(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LeaveRequest>> getUserLeaves(@PathVariable Long userId) {
        return ResponseEntity.ok(leaveService.getUserLeaves(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LeaveRequest>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<LeaveRequest>> getLeavesForManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(leaveService.getLeavesForManager(managerId));
    }

    @GetMapping("/manager/{managerId}/pending")
    public ResponseEntity<List<LeaveRequest>> getPendingLeavesForManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(leaveService.getPendingLeavesForManager(managerId));
    }

    @PutMapping("/{leaveId}/status")
    public ResponseEntity<LeaveRequest> updateLeaveStatus(
            @PathVariable Long leaveId,
            @RequestParam LeaveStatus status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(leaveService.updateLeaveStatus(leaveId, status, remarks));
    }
}
