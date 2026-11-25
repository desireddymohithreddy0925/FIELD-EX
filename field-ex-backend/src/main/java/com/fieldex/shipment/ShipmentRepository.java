package com.fieldex.shipment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID>, JpaSpecificationExecutor<Shipment> {
    Optional<Shipment> findByOrderId(UUID orderId);
    List<Shipment> findByOrderBuyerId(UUID buyerId);
    List<Shipment> findByStatusInAndExpectedDeliveryBefore(List<ShipmentStatus> statuses, Instant date);
}
