package com.fieldex.order;

import com.fieldex.batch.FruitBatch;
import com.fieldex.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_item_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.envers.Audited
public class OrderItemAllocation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fruit_batch_id", nullable = false)
    private FruitBatch fruitBatch;

    @Column(nullable = false)
    private BigDecimal quantity;
}
