package com.fieldex.quotation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class QuotationRequest {
    @NotEmpty
    private List<@Valid QuotationItemRequest> items;
}
