package com.fieldex.notification;

import com.fieldex.buyer.Buyer;
import com.fieldex.common.event.shipment.ShipmentDeliveredEvent;
import com.fieldex.common.event.shipment.ShipmentDispatchedEvent;
import com.fieldex.inventory.event.InventoryLowEvent;
import com.fieldex.order.Order;
import com.fieldex.order.OrderRepository;
import com.fieldex.order.event.OrderPlacedEvent;
import com.fieldex.quotation.Quotation;
import com.fieldex.quotation.QuotationRepository;
import com.fieldex.quotation.event.QuotationAcceptedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final MailService mailService;
    private final OrderRepository orderRepository;
    private final QuotationRepository quotationRepository;

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void onOrderPlaced(OrderPlacedEvent event) {
        Order order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order != null) {
            Buyer buyer = order.getBuyer() != null ? order.getBuyer() :
                    (order.getQuotation() != null ? order.getQuotation().getBuyer() : null);
            if (buyer != null && buyer.getContactEmail() != null) {
                String key = "order_placed_" + order.getId();
                mailService.sendEmailIdempotent(
                        key,
                        buyer.getContactEmail(),
                        "Order Placed Successfully",
                        "Your order " + order.getId() + " has been placed successfully.",
                        NotificationType.ORDER
                );
            }
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void onShipmentDispatched(ShipmentDispatchedEvent event) {
        Order order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order != null) {
            Buyer buyer = order.getBuyer() != null ? order.getBuyer() :
                    (order.getQuotation() != null ? order.getQuotation().getBuyer() : null);
            if (buyer != null && buyer.getContactEmail() != null) {
                String key = "shipment_dispatched_" + event.getOrderId();
                mailService.sendEmailIdempotent(
                        key,
                        buyer.getContactEmail(),
                        "Shipment Dispatched",
                        "Your shipment for order " + event.getOrderId() + " has been dispatched.",
                        NotificationType.SHIPMENT
                );
            }
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void onShipmentDelivered(ShipmentDeliveredEvent event) {
        Order order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order != null) {
            Buyer buyer = order.getBuyer() != null ? order.getBuyer() :
                    (order.getQuotation() != null ? order.getQuotation().getBuyer() : null);
            if (buyer != null && buyer.getContactEmail() != null) {
                String key = "shipment_delivered_" + event.getOrderId();
                mailService.sendEmailIdempotent(
                        key,
                        buyer.getContactEmail(),
                        "Shipment Delivered",
                        "Your shipment for order " + event.getOrderId() + " has been delivered successfully.",
                        NotificationType.DELIVERY
                );
            }
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void onInventoryLow(InventoryLowEvent event) {
        String key = "inventory_low_" + event.getFruitId() + "_" + event.getEventTimestamp().toEpochMilli();
        mailService.sendEmailIdempotent(
                key,
                "admin@field-ex.com",
                "Low Inventory Alert",
                "Low inventory detected for fruit ID: " + event.getFruitId(),
                NotificationType.LOW_INVENTORY
        );
    }
}
