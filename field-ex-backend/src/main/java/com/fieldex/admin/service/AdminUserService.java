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

    private static final String SOLE_ADMIN_EMAIL = "desireddymohithreddy@gmail.com";

    @Transactional
    public UserDto assignRole(UUID userId, Role newRole, String operatorUsername) {
        User operator = userRepository.findByEmail(operatorUsername).orElse(null);
        if (operator != null && operator.getRole() != Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Only the Administrator can assign user roles");
        }
        if (newRole == Role.ADMIN) {
            throw new IllegalArgumentException("Administrator is a single reserved position. Additional ADMIN accounts cannot be assigned.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        if (user.getRole() == Role.ADMIN || SOLE_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Cannot modify or reassign the sole Administrator account");
        }

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
                "ASSIGN_ROLE",
                "USER",
                userId.toString(),
                String.format("Operator '%s' reassigned role for %s from %s to %s", operatorUsername, user.getEmail(), oldRole, newRole)
        );

        log.info("Operator '{}' assigned role '{}' to user '{}'", operatorUsername, newRole, user.getEmail());
        return mapToDto(saved);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request, String operatorUsername) {
        User operator = userRepository.findByEmail(operatorUsername).orElse(null);
        if (operator != null && operator.getRole() != Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Only the Administrator can create staff accounts");
        }
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Administrator is a single reserved position. Additional ADMIN accounts cannot be created.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("User with email '" + normalizedEmail + "' already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(normalizedEmail)
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
                "CREATE_USER_WITH_ROLE",
                "USER",
                saved.getId().toString(),
                String.format("Operator '%s' created user '%s' with assigned role '%s'", operatorUsername, saved.getEmail(), request.getRole())
        );

        log.info("Operator '{}' created user '{}' with role '{}'", operatorUsername, saved.getEmail(), request.getRole());
        return mapToDto(saved);
    }

    @Transactional
    public UserDto toggleUserStatus(UUID userId, boolean active, String operatorUsername) {
        User operator = userRepository.findByEmail(operatorUsername).orElse(null);
        if (operator != null && operator.getRole() != Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Only the Administrator can change user account status");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        if (user.getRole() == Role.ADMIN || SOLE_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Cannot modify status of the sole Administrator account");
        }

        user.setActive(active);
        User saved = userRepository.save(user);

        auditLogService.logEvent(
                "TOGGLE_USER_STATUS",
                "USER",
                userId.toString(),
                String.format("Operator '%s' set active=%s for %s", operatorUsername, active, user.getEmail())
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
