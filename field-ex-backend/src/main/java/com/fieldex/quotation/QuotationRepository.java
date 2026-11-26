package com.fieldex.quotation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, UUID>, JpaSpecificationExecutor<Quotation> {
    List<Quotation> findByStatusAndValidityDateBefore(QuotationStatus status, OffsetDateTime date);

    @EntityGraph(attributePaths = {"buyer"})
    Page<Quotation> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"buyer", "items"})
    Optional<Quotation> findById(UUID id);
}
