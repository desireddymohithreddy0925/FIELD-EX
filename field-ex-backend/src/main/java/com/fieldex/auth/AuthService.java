package com.fieldex.auth;

import com.fieldex.audit.AuditLogService;
import com.fieldex.auth.dto.AuthResponse;
import com.fieldex.auth.dto.ChangePasswordRequest;
import com.fieldex.auth.dto.LoginRequest;
import com.fieldex.auth.dto.RegisterRequest;
import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.security.CustomUserDetails;
import com.fieldex.security.JwtService;
import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BuyerRepository buyerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(com.fieldex.user.Role.BUYER)
                .build();
        user.setActive(true);

        userRepository.save(user);

        Buyer buyer = Buyer.builder()
                .companyName(user.getName() + " Enterprise")
                .contactPerson(user.getName())
                .contactEmail(user.getEmail())
                .user(user)
                .build();
        buyer.setActive(true);
        buyerRepository.save(buyer);

        auditLogService.logEvent("REGISTER_USER", "USER", user.getId().toString(), "User registered as BUYER: " + user.getEmail());

        String jwtToken = jwtService.generateToken(new CustomUserDetails(user));
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        normalizedEmail,
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        auditLogService.logEvent("LOGIN", "USER", user.getId().toString(), "User logged in: " + user.getEmail());

        String jwtToken = jwtService.generateToken(new CustomUserDetails(user));
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (request.getNewPassword().equals(request.getCurrentPassword())) {
            throw new IllegalArgumentException("New password must differ from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.logEvent("PASSWORD_CHANGED", "USER", user.getId().toString(),
                "Password changed for account: " + user.getEmail());
    }
}
