package com.fieldex.packaging;

import com.fieldex.common.entity.BaseEntity;
import com.fieldex.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "packaging_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackagingStatusHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "packaging_record_id", nullable = false)
    private PackagingRecord packagingRecord;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PackagingStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @Column
    private String notes;
}
