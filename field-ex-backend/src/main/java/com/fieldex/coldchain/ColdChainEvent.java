package com.fieldex.coldchain;

import com.fieldex.batch.FruitBatch;
import com.fieldex.common.entity.BaseEntity;
import com.fieldex.warehouse.Warehouse;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "cold_chain_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColdChainEvent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private FruitBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private ColdChainEventType eventType;

    @Column(name = "event_timestamp", nullable = false)
    private Instant eventTimestamp;

    @Column(length = 1000)
    private String notes;
}
