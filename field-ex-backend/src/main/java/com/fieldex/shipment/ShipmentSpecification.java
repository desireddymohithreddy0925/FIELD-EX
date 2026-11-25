package com.fieldex.shipment;

import com.fieldex.common.specification.SpecificationUtils;
import com.fieldex.shipment.dto.ShipmentFilter;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ShipmentSpecification {

    public static Specification<Shipment> build(ShipmentFilter filter) {
        return (root, query, cb) -> {
            if (filter == null) {
                return cb.conjunction();
            }

            List<Specification<Shipment>> specs = new ArrayList<>();

            if (filter.getCountry() != null) {
                specs.add(SpecificationUtils.<Shipment>likeIgnoreCase("destinationCountry", filter.getCountry()));
            }

            if (filter.getPort() != null) {
                specs.add(SpecificationUtils.<Shipment>likeIgnoreCase("destinationPort", filter.getPort()));
            }

            if (filter.getStatus() != null) {
                try {
                    ShipmentStatus status = ShipmentStatus.valueOf(filter.getStatus());
                    specs.add(SpecificationUtils.equal("status", status));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid enum
                }
            }

            if (filter.getExpectedDeliveryFrom() != null) {
                specs.add(SpecificationUtils.greaterThanOrEqualTo("expectedDelivery", filter.getExpectedDeliveryFrom()));
            }

            if (filter.getExpectedDeliveryTo() != null) {
                specs.add(SpecificationUtils.lessThanOrEqualTo("expectedDelivery", filter.getExpectedDeliveryTo()));
            }

            if (filter.getCustomsStatus() != null) {
                try {
                    com.fieldex.customs.CustomsStatus cStatus = com.fieldex.customs.CustomsStatus.valueOf(filter.getCustomsStatus());
                    specs.add((r, q, c) -> {
                        jakarta.persistence.criteria.Subquery<com.fieldex.customs.CustomsClearance> subquery = q.subquery(com.fieldex.customs.CustomsClearance.class);
                        jakarta.persistence.criteria.Root<com.fieldex.customs.CustomsClearance> clearanceRoot = subquery.from(com.fieldex.customs.CustomsClearance.class);
                        subquery.select(clearanceRoot);
                        subquery.where(
                                c.equal(clearanceRoot.get("order"), r.get("order")),
                                c.equal(clearanceRoot.get("status"), cStatus)
                        );
                        return c.exists(subquery);
                    });
                } catch (IllegalArgumentException e) {
                    // Ignore invalid enum
                }
            }

            Specification<Shipment> result = null;
            for (Specification<Shipment> spec : specs) {
                result = (result == null) ? Specification.where(spec) : result.and(spec);
            }

            return result == null ? cb.conjunction() : result.toPredicate(root, query, cb);
        };
    }
}
