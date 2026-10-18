package com.attendance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String password;

    private String employeeCode; // e.g. EMP001

    private String department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // EMPLOYEE, REPORTING_MANAGER, PRINCIPAL_LEAD, ADMIN

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "office_id")
    private Office office;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manager_id")
    private User reportingManager;

    @Builder.Default
    private Integer casualLeaveBalance = 12;

    @Builder.Default
    private Integer sickLeaveBalance = 8;

    @Builder.Default
    private Integer earnedLeaveBalance = 15;

    @Builder.Default
    private Boolean isProbation = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.casualLeaveBalance == null) this.casualLeaveBalance = 12;
        if (this.sickLeaveBalance == null) this.sickLeaveBalance = 8;
        if (this.earnedLeaveBalance == null) this.earnedLeaveBalance = 15;
        if (this.isProbation == null) this.isProbation = false;
    }
}
