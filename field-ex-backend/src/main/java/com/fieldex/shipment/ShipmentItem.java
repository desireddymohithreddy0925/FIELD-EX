package com.fieldex.shipment;

import com.fieldex.batch.FruitBatch;
import com.fieldex.common.entity.BaseEntity;
import com.fieldex.packaging.PackagingRecord;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shipment_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.envers.Audited
public class ShipmentItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "packaging_id", nullable = false)
    @org.hibernate.envers.Audited(targetAuditMode = org.hibernate.envers.RelationTargetAuditMode.NOT_AUDITED)
    private PackagingRecord packagingRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private FruitBatch batch;
}
