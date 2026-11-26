package com.fieldex.user.dto;

import com.fieldex.user.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleAssignRequest {
    @NotNull(message = "Role is required and must be assigned by Administrator")
    private Role role;
}
