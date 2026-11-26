package com.fieldex.order;

import com.fieldex.buyer.Buyer;
import com.fieldex.buyer.BuyerRepository;
import com.fieldex.order.dto.CalendarEventDto;
import com.fieldex.shipment.Shipment;
import com.fieldex.shipment.ShipmentRepository;
import com.fieldex.user.Role;
import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalendarService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final BuyerRepository buyerRepository;

    @Transactional(readOnly = true)
    public List<CalendarEventDto> getCalendarEvents() {
        User currentUser = getCurrentUser();
        List<Order> orders;

        if (currentUser != null && currentUser.getRole() == Role.BUYER) {
            Buyer buyer = buyerRepository.findByUserId(currentUser.getId()).orElse(null);
            if (buyer == null) {
                return List.of();
            }
            orders = orderRepository.findAll().stream()
                    .filter(o -> o.getBuyer().getId().equals(buyer.getId()))
                    .toList();
        } else {
            orders = orderRepository.findAll();
        }

        List<CalendarEventDto> events = new ArrayList<>();

        for (Order order : orders) {
            String buyerName = order.getBuyer() != null ? order.getBuyer().getCompanyName() : "Buyer";
            String orderNum = order.getOrderNumber();

            // 1. Order Placed Date
            if (order.getCreatedAt() != null) {
                events.add(CalendarEventDto.builder()
                        .id("placed-" + order.getId())
                        .title("Order Placed: " + orderNum)
                        .eventType("ORDER_PLACED")
                        .date(order.getCreatedAt())
                        .orderId(order.getId())
                        .orderNumber(orderNum)
                        .buyerName(buyerName)
                        .status(order.getStatus().name())
                        .details(String.format("Initial order registered for %s (Total: %s %s)", 
                                buyerName, order.getCurrencyCode(), order.getTotalAmount()))
                        .badgeColor("blue")
                        .build());
            }

            // 2. Status History Transitions
            List<OrderStatusHistory> histories = historyRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
            for (OrderStatusHistory h : histories) {
                // Initial QUOTE_ACCEPTED state is already covered by ORDER_PLACED milestone
                if (h.getStatus() == OrderStatus.QUOTE_ACCEPTED) {
                    continue;
                }

                String eventType;
                String title;
                String badgeColor;

                switch (h.getStatus()) {
                    case PAYMENT_PENDING -> {
                        eventType = "PAYMENT_PENDING";
                        title = "Payment Awaiting Verification: " + orderNum;
                        badgeColor = "amber";
                    }
                    case PAID -> {
                        eventType = "PAYMENT_CONFIRMED";
                        title = "Payment Confirmed: " + orderNum;
                        badgeColor = "emerald";
                    }
                    case PROCESSING -> {
                        eventType = "ORDER_ACCEPTED";
                        title = "Order Accepted & Processing: " + orderNum;
                        badgeColor = "purple";
                    }
                    case PACKED -> {
                        eventType = "PACKING_COMPLETE";
                        title = "Packhouse Sorting Done: " + orderNum;
                        badgeColor = "indigo";
                    }
                    case DISPATCHED -> {
                        eventType = "SHIPMENT_DISPATCHED";
                        title = "Dispatched to Export Port: " + orderNum;
                        badgeColor = "indigo";
                    }
                    case IN_TRANSIT -> {
                        eventType = "IN_TRANSIT";
                        title = "Vessel Ocean Transit: " + orderNum;
                        badgeColor = "cyan";
                    }
                    case CUSTOMS -> {
                        eventType = "CUSTOMS_CLEARED";
                        title = "Customs Inspection: " + orderNum;
                        badgeColor = "amber";
                    }
                    case DELIVERED -> {
                        eventType = "ORDER_DELIVERED";
                        title = "Consignee Received: " + orderNum;
                        badgeColor = "emerald";
                    }
                    case CANCELLED -> {
                        eventType = "ORDER_CANCELLED";
                        title = "Order Rejected / Cancelled: " + orderNum;
                        badgeColor = "rose";
                    }
                    default -> {
                        eventType = "STATUS_" + h.getStatus().name();
                        title = h.getStatus().name().replace('_', ' ') + ": " + orderNum;
                        badgeColor = "gray";
                    }
                }

                events.add(CalendarEventDto.builder()
                        .id("history-" + h.getId())
                        .title(title)
                        .eventType(eventType)
                        .date(h.getCreatedAt())
                        .orderId(order.getId())
                        .orderNumber(orderNum)
                        .buyerName(buyerName)
                        .status(h.getStatus().name())
                        .details(h.getNotes() != null ? h.getNotes() : ("Order transitioned to " + h.getStatus().name()))
                        .badgeColor(badgeColor)
                        .build());
            }

            // 3. Shipment Dates
            shipmentRepository.findByOrderId(order.getId()).ifPresent(shipment -> {
                if (shipment.getShipmentDate() != null) {
                    events.add(CalendarEventDto.builder()
                            .id("ship-dispatch-" + shipment.getId())
                            .title("Vessel Departs Port: " + orderNum)
                            .eventType("VESSEL_DEPARTED")
                            .date(shipment.getShipmentDate().toInstant())
                            .orderId(order.getId())
                            .orderNumber(orderNum)
                            .buyerName(buyerName)
                            .status(shipment.getStatus().name())
                            .details(String.format("Carrier %s | Tracking: %s | Origin: %s -> Dest: %s",
                                    shipment.getShippingCompany(), shipment.getTrackingNumber(),
                                    shipment.getOriginPort(), shipment.getDestinationPort()))
                            .badgeColor("cyan")
                            .build());
                }

                if (shipment.getExpectedDelivery() != null) {
                    events.add(CalendarEventDto.builder()
                            .id("ship-expected-" + shipment.getId())
                            .title("Port ETA Delivery: " + orderNum)
                            .eventType("EXPECTED_DELIVERY")
                            .date(shipment.getExpectedDelivery().toInstant())
                            .orderId(order.getId())
                            .orderNumber(orderNum)
                            .buyerName(buyerName)
                            .status(shipment.getStatus().name())
                            .details(String.format("Estimated arrival at %s (%s)", 
                                    shipment.getDestinationPort(), shipment.getDestinationCountry()))
                            .badgeColor("amber")
                            .build());
                }

                if (shipment.getActualDelivery() != null) {
                    events.add(CalendarEventDto.builder()
                            .id("ship-actual-" + shipment.getId())
                            .title("Delivery Received at Destination: " + orderNum)
                            .eventType("DELIVERY_CONFIRMED")
                            .date(shipment.getActualDelivery().toInstant())
                            .orderId(order.getId())
                            .orderNumber(orderNum)
                            .buyerName(buyerName)
                            .status(shipment.getStatus().name())
                            .details("Port cargo released to consignee.")
                            .badgeColor("emerald")
                            .build());
                }
            });
        }

        // Sort events chronologically descending
        events.sort(Comparator.comparing(CalendarEventDto::getDate, Comparator.nullsLast(Comparator.reverseOrder())));
        return events;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return userRepository.findByEmail(auth.getName()).orElse(null);
        }
        return null;
    }
}
