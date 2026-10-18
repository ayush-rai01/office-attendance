package com.attendance.controller;

import com.attendance.entity.Holiday;
import com.attendance.service.HolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HolidayController {

    private final HolidayService holidayService;

    @GetMapping
    public ResponseEntity<List<Holiday>> getAllHolidays() {
        return ResponseEntity.ok(holidayService.getAllHolidays());
    }

    @PostMapping
    public ResponseEntity<Holiday> createHoliday(@RequestBody Holiday holiday) {
        return ResponseEntity.ok(holidayService.createHoliday(holiday));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateHoliday(@PathVariable Long id, @RequestBody Holiday holiday) {
        try {
            return ResponseEntity.ok(holidayService.updateHoliday(id, holiday));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHoliday(@PathVariable Long id) {
        try {
            holidayService.deleteHoliday(id);
            return ResponseEntity.ok(Map.of("message", "Holiday deleted successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
