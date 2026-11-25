package com.fieldex.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {
    
    @EntityGraph(attributePaths = {"buyer", "quotation"})
    Optional<Order> findByOrderNumber(String orderNumber);
    
    @EntityGraph(attributePaths = {"buyer", "quotation"})
    Optional<Order> findById(UUID id);

    @EntityGraph(attributePaths = {"buyer", "quotation"})
    Page<Order> findAll(Pageable pageable);

    boolean existsByQuotationId(UUID quotationId);
}
