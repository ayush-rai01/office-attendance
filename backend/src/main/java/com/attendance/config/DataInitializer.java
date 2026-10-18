package com.attendance.config;

import com.attendance.entity.Office;
import com.attendance.entity.Role;
import com.attendance.entity.User;
import com.attendance.repository.OfficeRepository;
import com.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final OfficeRepository officeRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (officeRepository.count() == 0) {
            log.info("Seeding initial Office and Sample Users...");

            // 1. Create Default Office
            Office hq = Office.builder()
                    .name("Main Office Headquarters")
                    .latitude(12.9715987)   // Sample lat (can be updated to actual office coordinates)
                    .longitude(77.5945627)  // Sample lng
                    .radiusMeters(300.0)    // 300 meters radius
                    .address("100 Feet Road, Tech Park, City")
                    .build();
            Office savedOffice = officeRepository.save(hq);

            // 2. Create Sample Employee
            User employee = User.builder()
                    .fullName("John Doe")
                    .email("john.doe@company.com")
                    .password("Password123")
                    .employeeCode("EMP001")
                    .department("Engineering")
                    .role(Role.EMPLOYEE)
                    .office(savedOffice)
                    .build();
            userRepository.save(employee);

            // 3. Create Sample Admin
            User admin = User.builder()
                    .fullName("HR Admin")
                    .email("admin@company.com")
                    .password("Admin123")
                    .employeeCode("ADM001")
                    .department("Human Resources")
                    .role(Role.ADMIN)
                    .office(savedOffice)
                    .build();
            userRepository.save(admin);

            log.info("Default Office created: ID={}, Name={}", savedOffice.getId(), savedOffice.getName());
            log.info("Sample Employee created: ID={}, Email={}", employee.getId(), employee.getEmail());
            log.info("Sample Admin created: ID={}, Email={}", admin.getId(), admin.getEmail());
        }
    }
}
