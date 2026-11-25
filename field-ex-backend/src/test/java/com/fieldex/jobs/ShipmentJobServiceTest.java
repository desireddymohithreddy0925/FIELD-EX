package com.fieldex.jobs;

import com.fieldex.buyer.Buyer;
import com.fieldex.notification.MailService;
import com.fieldex.notification.NotificationType;
import com.fieldex.order.Order;
import com.fieldex.quotation.Quotation;
import com.fieldex.shipment.Shipment;
import com.fieldex.shipment.ShipmentRepository;
import com.fieldex.shipment.ShipmentStateMachineService;
import com.fieldex.shipment.ShipmentStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.startsWith;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShipmentJobServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private MailService mailService;

    @Mock
    private ShipmentStateMachineService shipmentStateMachineService;

    @InjectMocks
    private ShipmentJobService shipmentJobService;

    @Test
    void detectDelayedShipments_TransitionsToDelayedAndSendsEmail() {
        Buyer buyer = new Buyer();
        buyer.setContactEmail("buyer@example.com");

        Quotation quotation = new Quotation();
        quotation.setBuyer(buyer);

        Order order = new Order();
        order.setQuotation(quotation);

        Shipment shipment = new Shipment();
        shipment.setId(UUID.randomUUID());
        shipment.setOrder(order);

        List<ShipmentStatus> activeStatuses = List.of(
                ShipmentStatus.PREPARING,
                ShipmentStatus.PACKED,
                ShipmentStatus.DISPATCHED,
                ShipmentStatus.IN_TRANSIT,
                ShipmentStatus.CUSTOMS
        );

        when(shipmentRepository.findByStatusInAndExpectedDeliveryBefore(
                anyList(), any(Instant.class))).thenReturn(Collections.singletonList(shipment));

        shipmentJobService.detectDelayedShipments();

        verify(shipmentStateMachineService).transitionState(shipment.getId(), ShipmentStatus.DELAYED, "Marked delayed by system job");

        verify(mailService).sendEmailIdempotent(
                startsWith("delayed_shipment_" + shipment.getId()),
                eq("buyer@example.com"),
                eq("Delayed Shipment Alert"),
                eq("Shipment " + shipment.getId() + " is delayed."),
                eq(NotificationType.DELAYED_SHIPMENT)
        );
    }
}
