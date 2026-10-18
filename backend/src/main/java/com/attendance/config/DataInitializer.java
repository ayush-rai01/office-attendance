package com.attendance.config;

import com.attendance.entity.Holiday;
import com.attendance.entity.Office;
import com.attendance.entity.Role;
import com.attendance.entity.User;
import com.attendance.repository.HolidayRepository;
import com.attendance.repository.OfficeRepository;
import com.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final OfficeRepository officeRepository;
    private final UserRepository userRepository;
    private final HolidayRepository holidayRepository;

    @Override
    public void run(String... args) {
        Office office = null;

        if (officeRepository.count() == 0) {
            log.info("Seeding Office...");
            Office hq = Office.builder()
                    .name("Main Office Headquarters")
                    .latitude(12.9715987)
                    .longitude(77.5945627)
                    .radiusMeters(300.0)
                    .address("100 Feet Road, Tech Park, City")
                    .build();
            office = officeRepository.save(hq);
        } else {
            office = officeRepository.findAll().get(0);
        }

        // 1. Create or Find Reporting Manager (Sarah Connor)
        User manager = userRepository.findByEmail("manager@company.com").orElse(null);
        if (manager == null) {
            manager = User.builder()
                    .fullName("Sarah Connor (Reporting Manager)")
                    .email("manager@company.com")
                    .password("Manager123")
                    .employeeCode("MGR001")
                    .department("Engineering")
                    .role(Role.MANAGER)
                    .office(office)
                    .build();
            manager = userRepository.save(manager);
            log.info("Reporting Manager created: ID={}, Email={}", manager.getId(), manager.getEmail());
        }

        // 2. Create or Find Employee (John Doe) and assign to manager
        User employee = userRepository.findByEmail("john.doe@company.com").orElse(null);
        if (employee == null) {
            employee = User.builder()
                    .fullName("John Doe")
                    .email("john.doe@company.com")
                    .password("Password123")
                    .employeeCode("EMP001")
                    .department("Engineering")
                    .role(Role.EMPLOYEE)
                    .office(office)
                    .reportingManager(manager)
                    .build();
            userRepository.save(employee);
        } else if (employee.getReportingManager() == null) {
            employee.setReportingManager(manager);
            userRepository.save(employee);
        }

        // 3. Create or Find HR Admin
        if (userRepository.findByEmail("admin@company.com").isEmpty()) {
            User admin = User.builder()
                    .fullName("HR Admin")
                    .email("admin@company.com")
                    .password("Admin123")
                    .employeeCode("ADM001")
                    .department("Human Resources")
                    .role(Role.ADMIN)
                    .office(office)
                    .build();
            userRepository.save(admin);
            log.info("HR Admin created: ID={}, Email={}", admin.getId(), admin.getEmail());
        }

        // 4. Seed 2026 Company Holiday Calendar with Government Flag
        if (holidayRepository.count() == 0) {
            List<Holiday> holidays = List.of(
                    Holiday.builder().name("New Year's Day").holidayDate(LocalDate.of(2026, 1, 1)).dayOfWeek("Thursday").holidayType("National Holiday").isGovernmentHoliday(true).description("Celebration of the New Year").build(),
                    Holiday.builder().name("Republic Day").holidayDate(LocalDate.of(2026, 1, 26)).dayOfWeek("Monday").holidayType("National Holiday").isGovernmentHoliday(true).description("Honoring the Constitution of India").build(),
                    Holiday.builder().name("Maha Shivratri").holidayDate(LocalDate.of(2026, 2, 17)).dayOfWeek("Tuesday").holidayType("Festival").isGovernmentHoliday(false).description("Spiritual observance").build(),
                    Holiday.builder().name("Holi (Festival of Colors)").holidayDate(LocalDate.of(2026, 3, 4)).dayOfWeek("Wednesday").holidayType("Festival").isGovernmentHoliday(false).description("Celebration of colors and spring").build(),
                    Holiday.builder().name("Good Friday").holidayDate(LocalDate.of(2026, 4, 3)).dayOfWeek("Friday").holidayType("National Holiday").isGovernmentHoliday(true).description("Christian remembrance").build(),
                    Holiday.builder().name("Eid ul-Fitr").holidayDate(LocalDate.of(2026, 3, 20)).dayOfWeek("Friday").holidayType("Festival").isGovernmentHoliday(false).description("End of Ramadan").build(),
                    Holiday.builder().name("Independence Day").holidayDate(LocalDate.of(2026, 8, 15)).dayOfWeek("Saturday").holidayType("National Holiday").isGovernmentHoliday(true).description("Commemoration of Nation's Independence").build(),
                    Holiday.builder().name("Gandhi Jayanti").holidayDate(LocalDate.of(2026, 10, 2)).dayOfWeek("Friday").holidayType("National Holiday").isGovernmentHoliday(true).description("Birth anniversary of Mahatma Gandhi").build(),
                    Holiday.builder().name("Dussehra (Vijayadashami)").holidayDate(LocalDate.of(2026, 10, 20)).dayOfWeek("Tuesday").holidayType("Festival").isGovernmentHoliday(false).description("Triumph of good over evil").build(),
                    Holiday.builder().name("Diwali (Deepavali)").holidayDate(LocalDate.of(2026, 11, 8)).dayOfWeek("Sunday").holidayType("Festival").isGovernmentHoliday(false).description("Festival of Lights").build(),
                    Holiday.builder().name("Christmas Day").holidayDate(LocalDate.of(2026, 12, 25)).dayOfWeek("Friday").holidayType("National Holiday").isGovernmentHoliday(true).description("Celebration of Christmas").build()
            );
            holidayRepository.saveAll(holidays);
            log.info("Seeded {} Company Holidays for 2026", holidays.size());
        } else {
            // Update government holiday flags for existing records
            holidayRepository.findAll().forEach(h -> {
                if ("National Holiday".equalsIgnoreCase(h.getHolidayType()) && !Boolean.TRUE.equals(h.getIsGovernmentHoliday())) {
                    h.setIsGovernmentHoliday(true);
                    holidayRepository.save(h);
                }
            });
        }
    }
}
