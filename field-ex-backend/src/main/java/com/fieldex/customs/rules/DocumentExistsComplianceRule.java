package com.fieldex.customs.rules;

import com.fieldex.customs.CustomsClearance;
import com.fieldex.document.DocumentType;
import com.fieldex.document.ExportDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DocumentExistsComplianceRule implements ComplianceRule {

    private final ExportDocumentRepository exportDocumentRepository;

    @Override
    public boolean isCompliant(CustomsClearance clearance) {
        if (clearance.getOrder() == null) return false;
        
        // Example: Must have a Commercial Invoice
        return exportDocumentRepository.findByOrderId(clearance.getOrder().getId()).stream()
                .anyMatch(doc -> doc.getType() == DocumentType.COMMERCIAL_INVOICE);
    }

    @Override
    public String getErrorMessage() {
        return "Missing required Commercial Invoice for customs submission.";
    }

    @Override
    public boolean appliesTo(CustomsClearance clearance) {
        return true; // Applies universally for this example
    }
}
