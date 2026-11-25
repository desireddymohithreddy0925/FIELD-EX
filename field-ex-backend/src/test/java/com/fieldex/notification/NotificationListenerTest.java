package com.fieldex.notification;

import com.fieldex.buyer.Buyer;
import com.fieldex.common.event.shipment.ShipmentDeliveredEvent;
import com.fieldex.common.event.shipment.ShipmentDispatchedEvent;
import com.fieldex.inventory.event.InventoryLowEvent;
import com.fieldex.order.Order;
import com.fieldex.order.OrderRepository;
import com.fieldex.order.event.OrderPlacedEvent;
import com.fieldex.quotation.Quotation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.startsWith;

@ExtendWith(MockitoExtension.class)
class NotificationListenerTest {

    @Mock
    private MailService mailService;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private NotificationListener notificationListener;

    @Test
    void onOrderPlaced_SendsEmail() {
        UUID orderId = UUID.randomUUID();
        Order order = createOrderWithBuyer("buyer@example.com", orderId);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        OrderPlacedEvent event = new OrderPlacedEvent(this, orderId);
        notificationListener.onOrderPlaced(event);

        verify(mailService).sendEmailIdempotent(
                eq("order_placed_" + orderId),
                eq("buyer@example.com"),
                eq("Order Placed Successfully"),
                eq("Your order " + orderId + " has been placed successfully."),
                eq(NotificationType.ORDER)
        );
    }

    @Test
    void onShipmentDispatched_SendsEmail() {
        UUID orderId = UUID.randomUUID();
        Order order = createOrderWithBuyer("buyer@example.com", orderId);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        ShipmentDispatchedEvent event = new ShipmentDispatchedEvent(this, orderId);
        notificationListener.onShipmentDispatched(event);

        verify(mailService).sendEmailIdempotent(
                eq("shipment_dispatched_" + orderId),
                eq("buyer@example.com"),
                eq("Shipment Dispatched"),
                eq("Your shipment for order " + orderId + " has been dispatched."),
                eq(NotificationType.SHIPMENT)
        );
    }

    @Test
    void onShipmentDelivered_SendsEmail() {
        UUID orderId = UUID.randomUUID();
        Order order = createOrderWithBuyer("buyer@example.com", orderId);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        ShipmentDeliveredEvent event = new ShipmentDeliveredEvent(this, orderId);
        notificationListener.onShipmentDelivered(event);

        verify(mailService).sendEmailIdempotent(
                eq("shipment_delivered_" + orderId),
                eq("buyer@example.com"),
                eq("Shipment Delivered"),
                eq("Your shipment for order " + orderId + " has been delivered successfully."),
                eq(NotificationType.DELIVERY)
        );
    }

    @Test
    void onInventoryLow_SendsEmail() {
        UUID fruitId = UUID.randomUUID();
        UUID varietyId = UUID.randomUUID();
        InventoryLowEvent event = new InventoryLowEvent(this, fruitId, varietyId);

        notificationListener.onInventoryLow(event);

        verify(mailService).sendEmailIdempotent(
                startsWith("inventory_low_" + fruitId),
                eq("admin@field-ex.com"),
                eq("Low Inventory Alert"),
                eq("Low inventory detected for fruit ID: " + fruitId),
                eq(NotificationType.LOW_INVENTORY)
        );
    }

    private Order createOrderWithBuyer(String email, UUID orderId) {
        Buyer buyer = new Buyer();
        buyer.setContactEmail(email);
        
        Quotation quotation = new Quotation();
        quotation.setBuyer(buyer);
        
        Order order = new Order();
        order.setId(orderId);
        order.setQuotation(quotation);
        
        return order;
    }
}
