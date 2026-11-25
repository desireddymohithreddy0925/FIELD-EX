---
marp: true
theme: default
paginate: true
header: "FIELD-EX | B2B Agro-Export & Supply Chain Platform"
footer: "Confidential & Proprietary"
---

# FIELD-EX
## B2B International Agro-Export & Cold-Chain Supply Chain Platform
### End-to-End Perishable Export Orchestration

**Presenter:** Engineering & Product Architecture Team  
**Date:** November 2026  

---

# 1. The Core Industry Problem

- **Perishability & Post-Harvest Losses**: Over 25% of fresh horticultural produce degrades between farm harvest and international port arrival.
- **Cold-Chain Opacity**: International buyers face "blind transit"—a single +4°C excursion destroys containerloads of Alphonso mangoes or table grapes.
- **Quality & Commercial Disputes**: Discrepancies in Brix (°Bx), fruit size, or pest marks cause catastrophic destination claims and write-downs.
- **Fragmented Communication**: Fragmented communication across WhatsApp, spreadsheets, and emails causes clearance delays and high demurrage fees.

---

# 2. The FIELD-EX Solution

**A unified, role-governed digital operating system bridging farm-gate procurement to international destination delivery.**

- **Transparent B2B Catalog**: Real-time export cultivar specs, Brix grading, and seasonal calendars.
- **Deterministic State Machines**: Strict order and shipment lifecycles with transition authorization checks.
- **Integrated Cold-Chain Monitoring**: Temperature excursion alerts and audit trails.
- **Customs & Documentation Hub**: Phytosanitary certificates, Bill of Lading, and invoices linked to physical batches.

---

# 3. Dedicated Stakeholder Portals (7 Roles)

To guarantee operational security and focused workflows, FIELD-EX provides **7 role-specific portals**:

1. **International Buyer (`/buyer`)**: Browse cultivars, negotiate quotations, approve orders, and track reefer temps.
2. **Operations Manager (`/manager`)**: Executive command center, operational KPIs, throughput charts, and order queue overrides.
3. **Produce Catalog Editor (`/editor`)**: Manage produce lines, cultivars, specifications, and seasonal harvest windows.
4. **Operations Admin (`/admin`)**: System-wide governance, global user access, and enterprise configuration.
5. **Quality Control Lab (`/qc`)**: Digital inspection scoring (Brix, firmness, defects), lot approvals, and quarantine controls.
6. **Systems Engineer (`/engineer`)**: Live system telemetry, service health, and audit logs.
7. **Logistics Director (`/logistics`)**: Cold storage room allocation, packaging schedules, and customs clearance.

---

# 4. System Architecture

```
                  ┌────────────────────────────────────────┐
                  │       React 19 + TypeScript (Vite)     │
                  │   7 Role-Based Portals & Dashboards    │
                  └───────────────────┬────────────────────┘
                                      │ REST API / JWT
                  ┌───────────────────▼────────────────────┐
                  │          Spring Boot 3 (Java 21)       │
                  │         Modular Monolith Core          │
                  ├────────────────────────────────────────┤
                  │  Auth (RBAC)  │  State Machines (Order) │
                  │  QC Inspection│  Cold-Chain Telemetry   │
                  │  Procurement  │  Audit Ledger (Envers)  │
                  └─────────┬──────────────────┬───────────┘
                            │                  │
         ┌──────────────────▼──────┐   ┌───────▼─────────────────┐
         │       PostgreSQL 17     │   │   In-Memory H2 Engine   │
         │   (Production / Live)   │   │  (Automated Test Suite) │
         └─────────────────────────┘   └─────────────────────────┘
```

---

# 5. Business Logic & State Machines

Every critical lifecycle is governed by a **strict finite state machine**:

### B2B Order Lifecycle:
`REQUESTED` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `PACKED` ➔ `IN_TRANSIT` ➔ `DELIVERED` *(or `CANCELLED`)*
- Only `ADMIN` and `MANAGER` can confirm or cancel orders.
- Orders cannot transition to `PACKED` without verified QC batch approval.

### Quality Inspection Lifecycle:
`PENDING_INSPECTION` ➔ `INSPECTION_IN_PROGRESS` ➔ `APPROVED` / `REJECTED`
- Automatic rejection if Brix sugar content is below threshold or pest larvae detected.

---

# 6. Enterprise Data Integrity & Security

- **Stateless Authentication**: High-entropy JWT tokens with embedded role authorizations.
- **Defense in Depth**: Spring Security `@PreAuthorize` method annotations across all service endpoints.
- **Concurrency & Race Condition Control**: Optimistic locking (`@Version`) preventing double-allocation of pallet lots.
- **Immutable Audit Logging**: Hibernate Envers tracks every mutation, actor timestamp, and revision history.
- **Zero Schema Drift**: Version-controlled Liquibase changelog migrations.

---

# 7. Automated Test Suite Verification

Rigorous testing guarantees zero regressions across the codebase:

- **Total Test Classes**: 36
- **Total Tests Run**: **98**
- **Failures / Errors**: **0 / 0** (100% Green)
- **Status**: **`BUILD SUCCESS`**

**Verified Suites**:
- `OrderStateMachineServiceTest` (Manager approval & Editor forbidden enforcement)
- `AuthControllerTests` (BCrypt password encoding, JWT claims, registration)
- `SecurityIntegrationTest` (RBAC access rules across all 7 endpoints)
- `PackagingServiceTest` & `ShipmentStateMachineServiceTest`
- `InventoryConcurrencyTest` & `QualityInspectionControllerTests`

---

# 8. Live Portal Demonstration Highlights

- **International Buyer**: Real-time view of Alphonso Mango batches, live reefer pulp temp (+1.2°C), and verified phyto-certificates.
- **Operations Manager**: Interactive volume throughput analytics, urgent orders queue, and inventory alerts.
- **Catalog Editor**: Dynamic variety specifications (Brix, caliber, season window) with instant live filtering.
- **QC Lab**: Pass/fail rubric evaluation automatically updating batch availability in warehouses.

---

# 9. Pragmatic Scope: What We Deferred & Why

1. **Physical IoT Gateways**: Modeled via clean REST API abstraction to enable hardware-agnostic Phase 2 integration.
2. **Live SWIFT Banking Wire**: Full escrow state-machine lifecycle built without premature international banking licensing overhead.
3. **Satellite AIS Vessel Tracking**: Milestone waypoint progression implemented without costly commercial maritime API subscriptions.
4. **Native Mobile Codebases**: Unified responsive Web PWA provided single-source-of-truth across all devices.
5. **Distributed Sharding**: Single PostgreSQL instance easily handles target scale without distributed commit latency.

---

# 10. Future Roadmap & Scaling

- **Phase 2 (Q1 2027)**:
  - Integration of physical BLE/LoRaWAN temperature sensors with automated MQTT ingest.
  - Integration with APEDA/ICEGATE customs XML electronic filing.
- **Phase 3 (Q2 2027)**:
  - Computer vision edge models for automated optical fruit sorting at conveyor belts.
  - Smart-contract escrow release upon port RFID gate-in confirmation.

---

# FIELD-EX
### The Future of Resilient Global Agro-Export
*Thank you! Questions & Discussion.*
