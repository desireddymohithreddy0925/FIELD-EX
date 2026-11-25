package com.fieldex.batch.event;

import com.fieldex.common.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

@Getter
public class BatchNearExpiryEvent extends DomainEvent {
    private final UUID batchId;

    public BatchNearExpiryEvent(Object source, UUID batchId) {
        super(source);
        this.batchId = batchId;
    }

    @Override
    public String getEventType() {
        return "BatchNearExpiryEvent";
    }
}
