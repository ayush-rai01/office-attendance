package com.attendance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "holidays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Holiday {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate holidayDate;

    private String dayOfWeek;

    private String holidayType; // "National Holiday", "Festival", "Company Holiday", "Optional Holiday"

    private String description;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isGovernmentHoliday = false; // Govt/National holidays cannot be altered
}
