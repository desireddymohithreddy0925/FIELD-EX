package com.fieldex.order;

import com.fieldex.audit.AuditLogService;
import com.fieldex.fruit.FruitVariety;
import com.fieldex.fruit.FruitVarietyRepository;
import com.fieldex.inventory.InventoryService;
import com.fieldex.inventory.dto.InventoryAllocationResult;
import com.fieldex.common.event.EventPublisher;
import com.fieldex.order.event.CustomsClearedEvent;
import com.fieldex.common.event.shipment.ShipmentDeliveredEvent;
import com.fieldex.common.event.shipment.ShipmentDispatchedEvent;
import com.fieldex.user.Role;
import com.fieldex.user.User;
import com.fieldex.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.fieldex.customs.CustomsClearanceRepository;
import com.fieldex.customs.CustomsStatus;
import com.fieldex.customs.CustomsClearance;
import com.fieldex.shipment.Shipment;
import com.fieldex.shipment.ShipmentRepository;
import com.fieldex.shipment.ShipmentStatus;
import com.fieldex.shipment.ShipmentStatusHistory;
import com.fieldex.shipment.ShipmentStatusHistoryRepository;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class OrderStateMachineService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final OrderItemAllocationRepository allocationRepository;
    private final EventPublisher eventPublisher;
    private final CustomsClearanceRepository customsClearanceRepository;

    @Autowired(required = false)
    private FruitVarietyRepository fruitVarietyRepository;

    @Autowired(required = false)
    private AuditLogService auditLogService;

    @Autowired(required = false)
    private ShipmentRepository shipmentRepository;

    @Autowired(required = false)
    private ShipmentStatusHistoryRepository shipmentHistoryRepository;

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = new EnumMap<>(OrderStatus.class);

    static {
        VALID_TRANSITIONS.put(OrderStatus.QUOTE_ACCEPTED, EnumSet.of(OrderStatus.PROCESSING, OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.PAYMENT_PENDING, EnumSet.of(OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.PAID, EnumSet.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.PROCESSING, EnumSet.of(OrderStatus.PACKED, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.PACKED, EnumSet.of(OrderStatus.DISPATCHED, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.DISPATCHED, EnumSet.of(OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED));
        VALID_TRANSITIONS.put(OrderStatus.IN_TRANSIT, EnumSet.of(OrderStatus.CUSTOMS, OrderStatus.DELIVERED));
        VALID_TRANSITIONS.put(OrderStatus.CUSTOMS, EnumSet.of(OrderStatus.DELIVERED));
        VALID_TRANSITIONS.put(OrderStatus.DELIVERED, EnumSet.noneOf(OrderStatus.class));
        VALID_TRANSITIONS.put(OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class));
    }

    @Transactional
    public Order transitionState(UUID orderId, OrderStatus targetStatus, String notes) {
        User actor = getCurrentUser();
        return doTransition(orderId, targetStatus, notes, actor, false);
    }

    @Transactional
    public Order confirmDeliveryByBuyer(UUID orderId, String notes) {
        User actor = getCurrentUser();
        if (actor == null || actor.getRole() != Role.BUYER) {
            throw new org.springframework.security.access.AccessDeniedException("Only the assigned buyer can confirm delivery");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (order.getBuyer() == null || order.getBuyer().getUser() == null
                || !order.getBuyer().getUser().getId().equals(actor.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to confirm delivery for another buyer's order");
        }
        OrderStatus currentStatus = order.getStatus();
        if (currentStatus != OrderStatus.DISPATCHED && currentStatus != OrderStatus.IN_TRANSIT && currentStatus != OrderStatus.CUSTOMS) {
            throw new IllegalStateException("Order must be DISPATCHED, IN_TRANSIT, or CUSTOMS before buyer delivery confirmation. Current status: " + currentStatus);
        }

        executePreconditions(order, OrderStatus.DELIVERED);

        String deliveryNote = (notes != null && !notes.isBlank()) ? notes : "Buyer confirmed physical delivery";
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.DELIVERED)
                .actor(actor)
                .notes(deliveryNote)
                .build();
        history.setActive(true);
        historyRepository.save(history);

        syncShipmentOnOrderTransition(order, OrderStatus.DELIVERED, deliveryNote);
        eventPublisher.publish(new ShipmentDeliveredEvent(this, order.getId()));

        if (auditLogService != null) {
            try {
                auditLogService.logEvent("BUYER_DELIVERY_CONFIRMED", "ORDER", order.getOrderNumber(),
                        String.format("Buyer %s confirmed delivery for order %s (%s -> DELIVERED)",
                                actor.getEmail(), order.getOrderNumber(), currentStatus));
            } catch (Exception ignored) {
            }
        }
        return order;
    }

    @Transactional
    public Order systemTransitionState(UUID orderId, OrderStatus targetStatus, String notes) {
        return doTransition(orderId, targetStatus, notes, null, true);
    }

    private Order doTransition(UUID orderId, OrderStatus targetStatus, String notes, User actor, boolean isSystemAction) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        OrderStatus currentStatus = order.getStatus();

        if (!isValidTransition(currentStatus, targetStatus)) {
            throw new IllegalStateException(String.format("Invalid state transition from %s to %s", currentStatus, targetStatus));
        }

        if (!isSystemAction) {
            verifyAuthorization(actor, targetStatus);
        }
        
        executePreconditions(order, targetStatus);

        order.setStatus(targetStatus);
        orderRepository.save(order);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(targetStatus)
                .actor(actor)
                .notes(notes)
                .build();
        history.setActive(true);
        historyRepository.save(history);

        executePostConditions(order, targetStatus);

        if (auditLogService != null) {
            try {
                auditLogService.logEvent("ORDER_TRANSITION", "ORDER", order.getOrderNumber(),
                        String.format("Order %s transitioned %s -> %s (%s)", order.getOrderNumber(), currentStatus, targetStatus,
                                notes != null ? notes : "Operations update"));
            } catch (Exception ignored) {
            }
        }

        return order;
    }

    private boolean isValidTransition(OrderStatus from, OrderStatus to) {
        Set<OrderStatus> allowed = VALID_TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }

    private void verifyAuthorization(User actor, OrderStatus targetStatus) {
        if (actor == null) return; // System action

        Role role = actor.getRole();
        
        switch (targetStatus) {
            case PAYMENT_PENDING:
            case PAID:
                if (role != Role.ADMIN && role != Role.MANAGER) {
                    throw new org.springframework.security.access.AccessDeniedException("Only ADMIN or MANAGER can update payment status");
                }
                break;
            case PROCESSING:
                if (role != Role.ADMIN && role != Role.MANAGER) {
                    throw new org.springframework.security.access.AccessDeniedException("Only ADMIN or MANAGER can process orders");
                }
                break;
            case PACKED:
            case DISPATCHED:
            case IN_TRANSIT:
            case CUSTOMS:
                if (role != Role.ADMIN && role != Role.MANAGER && role != Role.LOGISTICS) {
                    throw new org.springframework.security.access.AccessDeniedException("Unauthorized to update logistics status");
                }
                break;
            case DELIVERED:
                throw new org.springframework.security.access.AccessDeniedException(
                        "Only the buyer can confirm order delivery via buyer portal");
            case CANCELLED:
                if (role != Role.ADMIN && role != Role.MANAGER) {
                    throw new org.springframework.security.access.AccessDeniedException("Only ADMIN or MANAGER can cancel orders");
                }
                break;
            default:
                break;
        }
    }

    private void executePreconditions(Order order, OrderStatus targetStatus) {
        if (targetStatus == OrderStatus.PACKED && order.getStatus() != OrderStatus.PROCESSING) {
            // Strictly shouldn't happen due to VALID_TRANSITIONS map, but adding a specific business rule check
            throw new IllegalStateException("Order must be in PROCESSING to become PACKED");
        }
        
        if (targetStatus == OrderStatus.DELIVERED || targetStatus == OrderStatus.IN_TRANSIT) {
            // Check if customs clearance exists and is CLEARED (assuming all international orders need customs)
            // Note: If domestic orders don't need customs, we would add logic to check order.isInternational()
            CustomsClearance clearance = customsClearanceRepository.findByOrderId(order.getId()).orElse(null);
            
            // To prevent breaking existing flows where Customs isn't started yet, 
            // we enforce it if it exists. If the business rule strictly requires it for ALL orders, 
            // we throw if null. Let's assume strict rule: if there's a clearance, it MUST be CLEARED.
            // If the system requires a clearance to even proceed, we throw if null. Let's just check if it exists and is not CLEARED.
            if (clearance != null && clearance.getStatus() != CustomsStatus.CLEARED) {
                throw new IllegalStateException("Cannot deliver/transit order. Customs clearance is not CLEARED. Current status: " + clearance.getStatus());
            }
        }
    }

    private void executePostConditions(Order order, OrderStatus targetStatus) {
        if (targetStatus == OrderStatus.PROCESSING) {
            reserveInventory(order);
            ensureShipmentInitialized(order);
        } else if (targetStatus == OrderStatus.CANCELLED) {
            releaseInventory(order);
            syncShipmentOnOrderTransition(order, OrderStatus.CANCELLED, "Order cancelled");
        } else if (targetStatus == OrderStatus.PACKED) {
            syncShipmentOnOrderTransition(order, OrderStatus.PACKED, "Order packed at packhouse");
        } else if (targetStatus == OrderStatus.DISPATCHED) {
            syncShipmentOnOrderTransition(order, OrderStatus.DISPATCHED, "Order dispatched from origin packhouse");
            eventPublisher.publish(new ShipmentDispatchedEvent(this, order.getId()));
        } else if (targetStatus == OrderStatus.IN_TRANSIT) {
            syncShipmentOnOrderTransition(order, OrderStatus.IN_TRANSIT, "Order in transit");
        } else if (targetStatus == OrderStatus.CUSTOMS) {
            syncShipmentOnOrderTransition(order, OrderStatus.CUSTOMS, "Customs cleared");
            eventPublisher.publish(new CustomsClearedEvent(this, order.getId()));
        } else if (targetStatus == OrderStatus.DELIVERED) {
            syncShipmentOnOrderTransition(order, OrderStatus.DELIVERED, "Delivered");
            eventPublisher.publish(new ShipmentDeliveredEvent(this, order.getId()));
        }
    }

    private void ensureShipmentInitialized(Order order) {
        if (shipmentRepository == null || shipmentRepository.findByOrderId(order.getId()).isPresent()) {
            return;
        }
        String destPort = (order.getBuyer() != null && order.getBuyer().getDestinationPort() != null && !order.getBuyer().getDestinationPort().isBlank())
                ? order.getBuyer().getDestinationPort()
                : "Port of Felixstowe";
        String destCountry = toIsoCountryCode(order.getBuyer() != null ? order.getBuyer().getCountry() : null);

        Shipment shipment = Shipment.builder()
                .order(order)
                .status(ShipmentStatus.PREPARING)
                .originPort("JNPT Port, Mumbai")
                .destinationPort(destPort)
                .destinationCountry(destCountry)
                .expectedDelivery(OffsetDateTime.now().plusDays(10))
                .build();
        shipment.setActive(true);
        shipment = shipmentRepository.save(shipment);

        if (shipmentHistoryRepository != null) {
            ShipmentStatusHistory hist = ShipmentStatusHistory.builder()
                    .shipment(shipment)
                    .status(ShipmentStatus.PREPARING)
                    .notes("Shipment automatically initialized on order acceptance")
                    .build();
            hist.setActive(true);
            shipmentHistoryRepository.save(hist);
        }
    }

    private void syncShipmentOnOrderTransition(Order order, OrderStatus orderStatus, String notes) {
        if (shipmentRepository == null) return;
        Shipment shipment = shipmentRepository.findByOrderId(order.getId()).orElse(null);
        if (shipment == null) {
            if (orderStatus == OrderStatus.CANCELLED || orderStatus == OrderStatus.DELIVERED) {
                return;
            }
            ensureShipmentInitialized(order);
            shipment = shipmentRepository.findByOrderId(order.getId()).orElse(null);
            if (shipment == null) return;
        }
        ShipmentStatus target = switch (orderStatus) {
            case PROCESSING -> ShipmentStatus.PREPARING;
            case PACKED -> ShipmentStatus.PACKED;
            case DISPATCHED -> ShipmentStatus.DISPATCHED;
            case IN_TRANSIT -> ShipmentStatus.IN_TRANSIT;
            case CUSTOMS -> ShipmentStatus.CUSTOMS;
            case DELIVERED -> ShipmentStatus.DELIVERED;
            case CANCELLED -> ShipmentStatus.CANCELLED;
            default -> null;
        };
        if (target == null || shipment.getStatus() == target) return;

        shipment.setStatus(target);
        if (target == ShipmentStatus.DISPATCHED && shipment.getShipmentDate() == null) {
            shipment.setShipmentDate(OffsetDateTime.now());
        } else if (target == ShipmentStatus.DELIVERED) {
            shipment.setActualDelivery(OffsetDateTime.now());
        }
        shipmentRepository.save(shipment);

        if (shipmentHistoryRepository != null) {
            ShipmentStatusHistory hist = ShipmentStatusHistory.builder()
                    .shipment(shipment)
                    .status(target)
                    .notes(notes != null && !notes.isBlank() ? notes : ("Synchronized with Order status " + orderStatus))
                    .build();
            hist.setActive(true);
            shipmentHistoryRepository.save(hist);
        }
    }

    private String toIsoCountryCode(String country) {
        if (country == null || country.isBlank()) return "GB";
        String trimmed = country.trim();
        if (trimmed.length() == 2) return trimmed.toUpperCase();
        String lower = trimmed.toLowerCase();
        if (lower.contains("united kingdom") || lower.contains("uk") || lower.contains("britain")) return "GB";
        if (lower.contains("netherlands") || lower.contains("holland")) return "NL";
        if (lower.contains("united arab") || lower.contains("uae") || lower.contains("dubai")) return "AE";
        if (lower.contains("united states") || lower.contains("usa")) return "US";
        if (lower.contains("germany")) return "DE";
        if (lower.contains("singapore")) return "SG";
        if (lower.contains("india")) return "IN";
        return trimmed.substring(0, 2).toUpperCase();
    }

    private void reserveInventory(Order order) {
        if (order.getItems() == null) return;
        for (OrderItem item : order.getItems()) {
            try {
                List<InventoryAllocationResult> results = inventoryService.allocateFIFO(
                        item.getFruit().getId(),
                        item.getVariety().getId(),
                        item.getQuantity(),
                        "Order " + order.getOrderNumber(),
                        order.getId().toString()
                );

                for (InventoryAllocationResult result : results) {
                    com.fieldex.batch.FruitBatch batchProxy = new com.fieldex.batch.FruitBatch();
                    batchProxy.setId(result.getBatchId());

                    OrderItemAllocation allocation = OrderItemAllocation.builder()
                            .orderItem(item)
                            .fruitBatch(batchProxy)
                            .quantity(result.getAllocatedQuantity())
                            .build();
                    allocation.setActive(true);
                    allocationRepository.save(allocation);

                    item.getAllocations().add(allocation);
                }

                // Sync remaining commercial catalog available quantity
                decrementCatalogVarietyStock(item);
            } catch (IllegalStateException ex) {
                // Allow reservation against admin/manager catalog stock if physical warehouse batch was not manually pre-created
                if (!decrementCatalogVarietyStockIfAvailable(item)) {
                    throw ex;
                }
            }
        }
    }

    private void decrementCatalogVarietyStock(OrderItem item) {
        if (fruitVarietyRepository == null || item.getVariety() == null || item.getQuantity() == null) return;
        FruitVariety variety = fruitVarietyRepository.findById(item.getVariety().getId()).orElse(null);
        if (variety != null && variety.getAvailableQuantity() != null) {
            double remaining = Math.max(0.0, variety.getAvailableQuantity() - item.getQuantity().doubleValue());
            variety.setAvailableQuantity(remaining);
            fruitVarietyRepository.save(variety);
        }
    }

    private boolean decrementCatalogVarietyStockIfAvailable(OrderItem item) {
        if (fruitVarietyRepository == null || item.getVariety() == null || item.getQuantity() == null) return false;
        FruitVariety variety = fruitVarietyRepository.findById(item.getVariety().getId()).orElse(null);
        if (variety != null && variety.getAvailableQuantity() != null
                && variety.getAvailableQuantity() >= item.getQuantity().doubleValue()) {
            variety.setAvailableQuantity(variety.getAvailableQuantity() - item.getQuantity().doubleValue());
            fruitVarietyRepository.save(variety);
            return true;
        }
        return false;
    }

    private void releaseInventory(Order order) {
        if (order.getItems() == null) return;
        for (OrderItem item : order.getItems()) {
            if (item.getAllocations() == null) continue;
            for (OrderItemAllocation allocation : item.getAllocations()) {
                if (allocation.isActive() && allocation.getFruitBatch() != null) {
                    try {
                        com.fieldex.inventory.dto.InventoryDto inv = inventoryService.getInventoryByBatchId(allocation.getFruitBatch().getId());
                        if (inv != null) {
                            com.fieldex.inventory.dto.InventoryOperationRequest releaseReq = com.fieldex.inventory.dto.InventoryOperationRequest.builder()
                                    .quantity(allocation.getQuantity())
                                    .reason("Order " + (order.getOrderNumber() != null ? order.getOrderNumber() : order.getId()) + " cancelled")
                                    .reference(order.getId().toString())
                                    .build();
                            inventoryService.release(inv.getId(), releaseReq);
                        }
                    } catch (Exception ignored) {
                        // Best effort inventory release per allocation
                    }
                    allocation.setActive(false);
                    allocationRepository.save(allocation);
                }
            }
        }
    }

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }
}
