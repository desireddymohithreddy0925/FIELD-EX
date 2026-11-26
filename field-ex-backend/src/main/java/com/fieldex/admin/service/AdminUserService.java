package com.fieldex.admin.service;

import com.fieldex.audit.AuditLogService;
import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.user.Role;
import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import com.fieldex.user.dto.CreateUserRequest;
import com.fieldex.user.dto.UserDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserService {

    private final UserRepository userRepository;
    private final BuyerRepository buyerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto assignRole(UUID userId, Role newRole, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        Role oldRole = user.getRole();
        user.setRole(newRole);

        // If newly assigned BUYER role, ensure Buyer entity profile exists
        if (newRole == Role.BUYER && buyerRepository.findByUserId(user.getId()).isEmpty()) {
            Buyer buyer = Buyer.builder()
                    .companyName(user.getName() + " Enterprise")
                    .contactPerson(user.getName())
                    .contactEmail(user.getEmail())
                    .user(user)
                    .build();
            buyer.setActive(true);
            buyerRepository.save(buyer);
        }

        User saved = userRepository.save(user);

        auditLogService.logEvent(
                "ADMIN_ASSIGN_ROLE",
                "USER",
                userId.toString(),
                String.format("Admin '%s' reassigned role for %s from %s to %s", adminUsername, user.getEmail(), oldRole, newRole)
        );

        log.info("Admin '{}' assigned role '{}' to user '{}'", adminUsername, newRole, user.getEmail());
        return mapToDto(saved);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request, String adminUsername) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with email '" + request.getEmail() + "' already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        user.setActive(true);

        User saved = userRepository.save(user);

        if (request.getRole() == Role.BUYER) {
            Buyer buyer = Buyer.builder()
                    .companyName(user.getName() + " Enterprise")
                    .contactPerson(user.getName())
                    .contactEmail(user.getEmail())
                    .user(saved)
                    .build();
            buyer.setActive(true);
            buyerRepository.save(buyer);
        }

        auditLogService.logEvent(
                "ADMIN_CREATE_USER",
                "USER",
                saved.getId().toString(),
                String.format("Admin '%s' created user '%s' with assigned role '%s'", adminUsername, saved.getEmail(), request.getRole())
        );

        log.info("Admin '{}' created user '{}' with role '{}'", adminUsername, saved.getEmail(), request.getRole());
        return mapToDto(saved);
    }

    @Transactional
    public UserDto toggleUserStatus(UUID userId, boolean active, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        user.setActive(active);
        User saved = userRepository.save(user);

        auditLogService.logEvent(
                "ADMIN_TOGGLE_STATUS",
                "USER",
                userId.toString(),
                String.format("Admin '%s' set active=%s for %s", adminUsername, active, user.getEmail())
        );

        return mapToDto(saved);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
