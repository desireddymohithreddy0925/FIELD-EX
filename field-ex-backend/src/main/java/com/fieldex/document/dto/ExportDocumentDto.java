package com.fieldex.document.dto;

import com.fieldex.document.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportDocumentDto {
    private UUID id;
    private UUID orderId;
    private String orderNumber;
    private String buyerCompany;
    private DocumentType type;
    private String filename;
    private String contentType;
    private Long sizeBytes;
    private String generatedBy;
    private OffsetDateTime generatedAt;
    private Integer version;
    private String downloadUrl;
}
