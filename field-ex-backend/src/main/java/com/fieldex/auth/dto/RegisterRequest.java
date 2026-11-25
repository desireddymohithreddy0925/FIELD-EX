package com.fieldex.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    
    @JsonAlias({"fullName", "businessName"})
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @JsonAlias({"username", "email"})
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    public String getName() {
        if (name == null || name.isBlank()) {
            return email != null ? email.split("@")[0] : "User";
        }
        return name;
    }
}
