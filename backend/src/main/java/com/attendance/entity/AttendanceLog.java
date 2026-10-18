package com.attendance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PunchType punchType; // IN or OUT

    @Column(nullable = false)
    private LocalDateTime punchTime;

    private Double latitude;

    private Double longitude;

    private Double distanceFromOfficeMeters;

    private Boolean isInsideOffice;

    @Enumerated(EnumType.STRING)
    private PunchMode punchMode; // OFFICE, REMOTE, FIELD

    private String remarks;
}
