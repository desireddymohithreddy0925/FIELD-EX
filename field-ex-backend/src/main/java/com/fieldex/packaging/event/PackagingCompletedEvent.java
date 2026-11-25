package com.fieldex.packaging.event;

import com.fieldex.common.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

@Getter
public class PackagingCompletedEvent extends DomainEvent {

    private final UUID packagingRecordId;
    private final UUID orderId;

    public PackagingCompletedEvent(Object source, UUID packagingRecordId, UUID orderId) {
        super(source);
        this.packagingRecordId = packagingRecordId;
        this.orderId = orderId;
    }

    @Override
    public String getEventType() {
        return "PackagingCompletedEvent";
    }
}
