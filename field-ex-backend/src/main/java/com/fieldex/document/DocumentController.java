package com.fieldex.document;

import com.fieldex.document.dto.ExportDocumentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Document API", description = "Endpoints for document generation and retrieval")
public class DocumentController {

    private final DocumentGenerationService documentGenerationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "List all generated export documents")
    public ResponseEntity<List<ExportDocumentDto>> getAllDocuments() {
        return ResponseEntity.ok(documentGenerationService.getAllDocuments());
    }

    @PostMapping("/generate/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'MANAGER')")
    @Operation(summary = "Generate export document for an order")
    public ResponseEntity<ExportDocumentDto> generateDocument(
            @PathVariable UUID orderId,
            @RequestParam DocumentType type) {

        ExportDocument document = documentGenerationService.generateDocument(orderId, type);
        return ResponseEntity.ok(documentGenerationService.getDocumentDto(document.getId()));
    }

    @GetMapping("/{documentId}/url")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'BUYER', 'MANAGER')")
    @Operation(summary = "Get download URL for a document")
    public ResponseEntity<Map<String, String>> getDownloadUrl(@PathVariable UUID documentId) {
        String url = documentGenerationService.getPresignedUrl(documentId);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/{documentId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS', 'BUYER', 'MANAGER')")
    @Operation(summary = "Download document PDF bytes directly")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable UUID documentId) {
        ExportDocumentDto meta = documentGenerationService.getDocumentDto(documentId);
        byte[] bytes = documentGenerationService.downloadDocumentContent(documentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + meta.getFilename() + "\"")
                .body(bytes);
    }
}
