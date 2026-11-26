package com.fieldex.admin.controllers;

import com.fieldex.admin.service.AdminUserService;
import com.fieldex.user.dto.CreateUserRequest;
import com.fieldex.user.dto.RoleAssignRequest;
import com.fieldex.user.dto.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin User & Role Management", description = "Endpoints for administrators to strictly assign roles and govern users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Get all users", description = "Lists all registered users with their currently assigned roles")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @PutMapping("/{userId}/role")
    @Operation(summary = "Assign role to user", description = "Strictly assigns or updates the role of a user (ADMIN only)")
    public ResponseEntity<UserDto> assignRole(
            @PathVariable UUID userId,
            @Valid @RequestBody RoleAssignRequest request,
            Principal principal) {
        String admin = principal != null ? principal.getName() : "ADMIN";
        return ResponseEntity.ok(adminUserService.assignRole(userId, request.getRole(), admin));
    }

    @PostMapping
    @Operation(summary = "Create user with assigned role", description = "Admin creates a user account and assigns their role directly")
    public ResponseEntity<UserDto> createUser(
            @Valid @RequestBody CreateUserRequest request,
            Principal principal) {
        String admin = principal != null ? principal.getName() : "ADMIN";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminUserService.createUser(request, admin));
    }

    @PatchMapping("/{userId}/status")
    @Operation(summary = "Toggle user active status", description = "Admin activates or deactivates a user account")
    public ResponseEntity<UserDto> toggleUserStatus(
            @PathVariable UUID userId,
            @RequestParam boolean active,
            Principal principal) {
        String admin = principal != null ? principal.getName() : "ADMIN";
        return ResponseEntity.ok(adminUserService.toggleUserStatus(userId, active, admin));
    }
}
