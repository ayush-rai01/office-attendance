package com.attendance.service;

import com.attendance.dto.RegisterUserRequest;
import com.attendance.entity.Office;
import com.attendance.entity.User;
import com.attendance.repository.OfficeRepository;
import com.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OfficeRepository officeRepository;

    public User registerUser(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with email " + request.getEmail() + " already exists.");
        }

        Office office = null;
        if (request.getOfficeId() != null) {
            office = officeRepository.findById(request.getOfficeId()).orElse(null);
        }

        User user = User.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .password(request.getPassword()) // Plain text or hashed
                .employeeCode(request.getEmployeeCode())
                .department(request.getDepartment())
                .role(request.getRole())
                .office(office)
                .build();

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }
}
