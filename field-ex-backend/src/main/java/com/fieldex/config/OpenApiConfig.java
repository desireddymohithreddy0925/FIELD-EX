package com.fieldex.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "FIELD-EX B2B Enterprise API",
                version = "1.0",
                description = "Comprehensive API documentation for the FIELD-EX B2B platform. Provides access to procurement, inventory, logistics, and QC services.",
                contact = @Contact(
                        name = "FIELD-EX Engineering",
                        email = "engineering@field-ex.com"
                )
        ),
        security = {
                @SecurityRequirement(name = "bearerAuth")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT Bearer Authentication for securing all endpoints. Obtain a token from the /api/v1/auth/login endpoint.",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class OpenApiConfig {
}
