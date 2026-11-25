package com.fieldex.common.event;

public interface EventPublisher {
    void publish(DomainEvent event);
}
