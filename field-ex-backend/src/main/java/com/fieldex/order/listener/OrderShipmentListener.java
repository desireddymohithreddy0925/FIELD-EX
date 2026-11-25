package com.fieldex.order.listener;

import com.fieldex.common.event.shipment.CustomsRequiredEvent;
import com.fieldex.common.event.shipment.ShipmentDeliveredEvent;
import com.fieldex.common.event.shipment.ShipmentDispatchedEvent;
import com.fieldex.order.Order;
import com.fieldex.order.OrderRepository;
import com.fieldex.order.OrderStateMachineService;
import com.fieldex.order.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderShipmentListener {

    private final OrderStateMachineService orderStateMachineService;
    private final OrderRepository orderRepository;

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void onShipmentDispatched(ShipmentDispatchedEvent event) {
        log.info("Handling ShipmentDispatchedEvent for Order: {}", event.getOrderId());
        Order order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order != null) {
            if (order.getStatus() == OrderStatus.PACKED) {
                orderStateMachineService.systemTransitionState(event.getOrderId(), OrderStatus.DISPATCHED, "Shipment dispatched");
            }
            // Transition to IN_TRANSIT once dispatched
            Order refreshed = orderRepository.findById(event.getOrderId()).orElse(order);
            if (refreshed.getStatus() == OrderStatus.DISPATCHED) {
                orderStateMachineService.systemTransitionState(event.getOrderId(), OrderStatus.IN_TRANSIT, "Shipment in transit");
            }
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void onCustomsRequired(CustomsRequiredEvent event) {
        log.info("Handling CustomsRequiredEvent for Order: {}", event.getOrderId());
        Order order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order != null && order.getStatus() == OrderStatus.IN_TRANSIT) {
            orderStateMachineService.systemTransitionState(event.getOrderId(), OrderStatus.CUSTOMS, "Customs clearance required");
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void onShipmentDelivered(ShipmentDeliveredEvent event) {
        log.info("Handling ShipmentDeliveredEvent for Order: {}", event.getOrderId());
        Order order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order != null && (order.getStatus() == OrderStatus.IN_TRANSIT || order.getStatus() == OrderStatus.CUSTOMS)) {
            orderStateMachineService.systemTransitionState(event.getOrderId(), OrderStatus.DELIVERED, "Shipment delivered");
        }
    }
}

