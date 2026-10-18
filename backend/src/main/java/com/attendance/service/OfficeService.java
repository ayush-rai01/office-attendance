package com.attendance.service;

import com.attendance.dto.CreateOfficeRequest;
import com.attendance.entity.Office;
import com.attendance.repository.OfficeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfficeService {

    private final OfficeRepository officeRepository;

    public Office createOffice(CreateOfficeRequest request) {
        Office office = Office.builder()
                .name(request.getName())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .radiusMeters(request.getRadiusMeters() != null ? request.getRadiusMeters() : 150.0)
                .address(request.getAddress())
                .build();
        return officeRepository.save(office);
    }

    public List<Office> getAllOffices() {
        return officeRepository.findAll();
    }

    public Office getOfficeById(Long id) {
        return officeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Office not found with id: " + id));
    }
}
