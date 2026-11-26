package com.fieldex.jobs;

import com.fieldex.notification.MailService;
import com.fieldex.notification.NotificationType;
import com.fieldex.shipment.Shipment;
import com.fieldex.shipment.ShipmentRepository;
import com.fieldex.shipment.ShipmentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

import com.fieldex.shipment.ShipmentStateMachineService;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentJobService {

    private final ShipmentRepository shipmentRepository;
    private final MailService mailService;
    private final ShipmentStateMachineService shipmentStateMachineService;

    @Scheduled(cron = "0 0 * * * *") // Every hour
    @Transactional
    public void detectDelayedShipments() {
        log.info("Running job to detect delayed shipments...");
        OffsetDateTime now = OffsetDateTime.now();
        
        List<ShipmentStatus> activeStatuses = List.of(
                ShipmentStatus.PREPARING,
                ShipmentStatus.PACKED,
                ShipmentStatus.DISPATCHED,
                ShipmentStatus.IN_TRANSIT,
                ShipmentStatus.CUSTOMS
        );
        
        List<Shipment> delayedShipments = shipmentRepository.findByStatusInAndExpectedDeliveryBefore(
                activeStatuses, now
        );

        for (Shipment shipment : delayedShipments) {
            shipmentStateMachineService.transitionState(shipment.getId(), ShipmentStatus.DELAYED, "Marked delayed by system job");
            log.info("Shipment {} marked as delayed.", shipment.getId());

            String key = "delayed_shipment_" + shipment.getId() + "_" + now.toEpochSecond();
            String buyerEmail = null;
            if (shipment.getOrder() != null) {
                if (shipment.getOrder().getBuyer() != null) {
                    buyerEmail = shipment.getOrder().getBuyer().getContactEmail();
                } else if (shipment.getOrder().getQuotation() != null && shipment.getOrder().getQuotation().getBuyer() != null) {
                    buyerEmail = shipment.getOrder().getQuotation().getBuyer().getContactEmail();
                }
            }
            if (buyerEmail != null) {
                mailService.sendEmailIdempotent(
                        key,
                        buyerEmail,
                        "Delayed Shipment Alert",
                        "Shipment " + shipment.getId() + " is delayed.",
                        NotificationType.DELAYED_SHIPMENT
                );
            }
        }

        log.info("Marked {} shipments as delayed.", delayedShipments.size());
    }
}
