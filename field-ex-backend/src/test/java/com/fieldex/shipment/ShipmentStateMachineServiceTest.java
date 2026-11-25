package com.fieldex.shipment;

import com.fieldex.common.event.EventPublisher;
import com.fieldex.common.event.shipment.CustomsRequiredEvent;
import com.fieldex.common.event.shipment.ShipmentDeliveredEvent;
import com.fieldex.common.event.shipment.ShipmentDispatchedEvent;
import com.fieldex.customs.CustomsClearance;
import com.fieldex.customs.CustomsClearanceRepository;
import com.fieldex.customs.CustomsStatus;
import com.fieldex.document.DocumentType;
import com.fieldex.document.ExportDocument;
import com.fieldex.document.ExportDocumentRepository;
import com.fieldex.order.Order;
import com.fieldex.order.OrderRepository;
import com.fieldex.order.OrderStatus;
import com.fieldex.packaging.PackagingRecord;
import com.fieldex.packaging.PackagingStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShipmentStateMachineServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;
    @Mock
    private ShipmentStatusHistoryRepository historyRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CustomsClearanceRepository customsClearanceRepository;
    @Mock
    private ExportDocumentRepository exportDocumentRepository;
    @Mock
    private EventPublisher eventPublisher;

    @InjectMocks
    private ShipmentStateMachineService service;

    private Order order;
    private Shipment shipment;
    private UUID orderId = UUID.randomUUID();
    private UUID shipmentId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        order = new Order();
        order.setId(orderId);
        order.setStatus(OrderStatus.PROCESSING);

        shipment = new Shipment();
        shipment.setId(shipmentId);
        shipment.setOrder(order);
        shipment.setStatus(ShipmentStatus.PREPARING);
    }

    @Test
    void testCreateShipment_Success() {
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(shipmentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        Shipment created = service.createShipment(orderId);
        assertNotNull(created);
        assertEquals(ShipmentStatus.PREPARING, created.getStatus());
    }

    @Test
    void testTransitionToPacked_FailNotPaid() {
        order.setStatus(OrderStatus.QUOTE_ACCEPTED);
        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));

        assertThrows(IllegalStateException.class, () -> service.transitionState(shipmentId, ShipmentStatus.PACKED, ""));
    }

    @Test
    void testTransitionToPacked_FailMissingPackaging() {
        order.setStatus(OrderStatus.PAID);
        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));

        assertThrows(IllegalStateException.class, () -> service.transitionState(shipmentId, ShipmentStatus.PACKED, ""));
    }

    @Test
    void testTransitionToPacked_Success() {
        order.setStatus(OrderStatus.PAID);
        PackagingRecord pr = new PackagingRecord();
        pr.setStatus(PackagingStatus.COMPLETED);
        
        ShipmentItem item = new ShipmentItem();
        item.setPackagingRecord(pr);
        shipment.getItems().add(item);
        
        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        Shipment result = service.transitionState(shipmentId, ShipmentStatus.PACKED, "Packed");
        assertEquals(ShipmentStatus.PACKED, result.getStatus());
    }

    @Test
    void testTransitionToDispatched_FailMissingBL() {
        shipment.setStatus(ShipmentStatus.PACKED);
        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));
        when(exportDocumentRepository.findByOrderId(orderId)).thenReturn(Collections.emptyList());

        assertThrows(IllegalStateException.class, () -> service.transitionState(shipmentId, ShipmentStatus.DISPATCHED, ""));
    }

    @Test
    void testTransitionToDispatched_Success() {
        shipment.setStatus(ShipmentStatus.PACKED);
        
        ExportDocument doc = new ExportDocument();
        doc.setType(DocumentType.BILL_OF_LADING);
        
        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));
        when(exportDocumentRepository.findByOrderId(orderId)).thenReturn(Collections.singletonList(doc));
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        Shipment result = service.transitionState(shipmentId, ShipmentStatus.DISPATCHED, "Go");
        assertEquals(ShipmentStatus.DISPATCHED, result.getStatus());
        verify(eventPublisher).publish(any(ShipmentDispatchedEvent.class));
    }

    @Test
    void testTransitionToDelivered_FailCustoms() {
        shipment.setStatus(ShipmentStatus.CUSTOMS);
        
        CustomsClearance clearance = new CustomsClearance();
        clearance.setStatus(CustomsStatus.UNDER_REVIEW);
        
        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));
        when(customsClearanceRepository.findByOrderId(orderId)).thenReturn(Optional.of(clearance));

        assertThrows(IllegalStateException.class, () -> service.transitionState(shipmentId, ShipmentStatus.DELIVERED, ""));
    }
}
