package com.attendance.controller;

import com.attendance.dto.CreateOfficeRequest;
import com.attendance.entity.Office;
import com.attendance.service.OfficeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OfficeController {

    private final OfficeService officeService;

    @PostMapping
    public ResponseEntity<Office> createOffice(@RequestBody CreateOfficeRequest request) {
        return ResponseEntity.ok(officeService.createOffice(request));
    }

    @GetMapping
    public ResponseEntity<List<Office>> getAllOffices() {
        return ResponseEntity.ok(officeService.getAllOffices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Office> getOfficeById(@PathVariable Long id) {
        return ResponseEntity.ok(officeService.getOfficeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Office> updateOffice(
            @PathVariable Long id,
            @RequestBody CreateOfficeRequest request) {
        return ResponseEntity.ok(officeService.updateOffice(id, request));
    }
}
