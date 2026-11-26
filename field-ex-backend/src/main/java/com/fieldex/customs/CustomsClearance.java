package com.fieldex.customs;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fieldex.common.entity.BaseEntity;
import com.fieldex.order.Order;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

import org.hibernate.envers.Audited;

@Entity
@Table(name = "customs_clearances")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomsClearance extends BaseEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "declaration_id")
    @org.hibernate.envers.Audited(targetAuditMode = org.hibernate.envers.RelationTargetAuditMode.NOT_AUDITED)
    private CustomsDeclaration declaration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomsStatus status;

    @Column(name = "inspection_status")
    private String inspectionStatus;

    @Column(length = 2000)
    private String remarks;

    @Column(name = "clearance_date")
    private OffsetDateTime clearanceDate;
}
