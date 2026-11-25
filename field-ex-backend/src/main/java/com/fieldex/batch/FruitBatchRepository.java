package com.fieldex.batch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface FruitBatchRepository extends JpaRepository<FruitBatch, UUID>, JpaSpecificationExecutor<FruitBatch> {
    
    @EntityGraph(attributePaths = {"supplier", "fruit", "variety", "warehouse"})
    Optional<FruitBatch> findByBatchNumber(String batchNumber);

    @EntityGraph(attributePaths = {"supplier", "fruit", "variety", "warehouse"})
    Optional<FruitBatch> findById(UUID id);

    @EntityGraph(attributePaths = {"supplier", "fruit", "variety", "warehouse"})
    Page<FruitBatch> findAll(Pageable pageable);

    List<FruitBatch> findByStatusAndExpirationDateBefore(BatchStatus status, Instant date);
    List<FruitBatch> findByStatusAndExpirationDateBetween(BatchStatus status, Instant start, Instant end);
}
