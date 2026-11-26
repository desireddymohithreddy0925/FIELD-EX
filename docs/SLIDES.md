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
- **Fragmented Communication**: Communication scattered across WhatsApp, spreadsheets, and emails causes clearance delays and high port demurrage fees.

---

# 2. The FIELD-EX Solution

**A unified, role-governed digital operating system bridging farm-gate procurement to international destination delivery.**

- **Transparent B2B Catalog & Fixed Pricing**: Real-time export cultivar specs, Brix grading, metric tonnage inventory, and fixed FOB prices.
- **Deterministic State Machines**: Strict order and shipment lifecycles with transition authorization checks.
- **Operations Calendar API**: Real-time milestone tracking for order placement, packhouse packing, export dispatch, customs, and port delivery.
- **Order Lifecycle History**: Immutable audit log of every state change, actor, and compliance note accessible to Admin and Manager.
- **Real-Time Admin Watchdog**: Live system event stream for total platform observability.

---

# 3. Dedicated Stakeholder Portals (5 Roles)

To guarantee operational security and focused workflows, FIELD-EX provides **5 role-specific portals**:

1. **Operations Admin (`/admin`)**: Global governance, unrestricted user provisioning, live system watchdog stream, catalog price fixing, order lifecycle history.
2. **Operations Manager (`/manager`)**: Delegated role assignment (Buyer, QC, Logistics), produce price fixing, order lifecycle history, operations calendar.
3. **International Buyer (`/buyer`)**: Browse cultivars, review fixed prices, submit RFQs, accept quotations, track shipments and calendar milestones.
4. **Quality Control Lab (`/qc`)**: Digital inspection scoring (Brix, firmness, defects), lot approvals, and quarantine controls.
5. **Logistics Director (`/logistics`)**: Cold storage room allocation, packaging schedules, and customs clearance.

---

# 4. System Architecture

```
                  ┌────────────────────────────────────────┐
                  │       React 19 + TypeScript (Vite)     │
                  │   5 Role-Based Portals & Dashboards    │
                  └───────────────────┬────────────────────┘
                                      │ REST API / JWT
                  ┌───────────────────▼────────────────────┐
                  │          Spring Boot 3 (Java 25)       │
                  │         Modular Monolith Core          │
                  ├────────────────────────────────────────┤
                  │  Auth (RBAC)  │  State Machines (Order) │
                  │  QC Inspection│  Cold-Chain Telemetry   │
                  │  Calendar API │  Audit Stream / Envers  │
                  │  Price Fixing │  Variety & Inventory    │
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

- **Order State Machine & Acceptance Gate**:
  `QUOTE_ACCEPTED` (*Awaiting Acceptance*) ➔ `PROCESSING` (*Accepted by Admin/Manager & FIFO Inventory Reserved*) ➔ `PACKED` ➔ `DISPATCHED` ➔ `IN_TRANSIT` ➔ `CUSTOMS` ➔ `DELIVERED`
- **Exclusive Operational Acceptance**:
  - Buyer-placed orders enter `QUOTE_ACCEPTED` and cannot be self-transitioned.
  - Dedicated endpoints `POST /api/v1/admin/orders/{id}/accept` and `/reject` restricted to `ADMIN` and `MANAGER`.
  - Acceptance automatically triggers FIFO batch inventory allocation.
- **Shipment State Machine**:
  `PREPARING` ➔ `PACKED` ➔ `DISPATCHED` ➔ `IN_TRANSIT` ➔ `CUSTOMS_HOLD` ➔ `DELIVERED`
- **Quality Inspection Lifecycle**:
  `PENDING_INSPECTION` ➔ `IN_PROGRESS` ➔ `APPROVED` / `REJECTED` (Triggers cold storage quarantine)

---

# 6. Commercial Price Fixing & Catalog Governance

- **Cultivar-Level Pricing**:
  - Currency-denominated fixed pricing per kg / MT (`USD`, `EUR`, `GBP`, `AED`, `INR`).
  - Available stock quantity and Minimum Order Quantity (MOQ) controls.
- **Export Quality Specifications**:
  - Quality Grade classification (Export Grade A, Super Grade, Jumbo).
  - Sugar sweetness rating (°Bx) and post-harvest shelf-life tracking.
- **Dual Management Access**:
  - Both `ADMIN` and `MANAGER` can update pricing and variety specs on the fly via `/admin/catalog` and `/manager/catalog`.

---

# 7. Operational Calendar & Milestones API

- **Calendar Event Stream (`/api/v1/calendar/events`)**:
  - Automatically aggregates placed order dates, payment verifications, packhouse packing completions, port departures, and destination receipts.
- **Carrier Telemetry & Port ETA**:
  - Vessel tracking, bill of lading numbers, container numbers, and estimated port arrival dates.
- **Role Scoping**:
  - Buyers see their own procurement milestones; Admins and Managers monitor all global shipments.

---

# 8. Enterprise Role Delegation & Security

- **Strict Role-Based Access Control**:
  - Self-assignment of staff roles is blocked at the gateway level.
  - `ADMIN` provisions and assigns all roles across the enterprise.
  - `MANAGER` holds delegated authority to provision `BUYER`, `QC_INSPECTOR`, and `LOGISTICS` roles.
  - Privileged HQ accounts (`ADMIN`, `MANAGER`) are protected against tampering.
- **Admin & Manager Order Acceptance Authority**:
  - Buyers cannot self-authorize fulfillment of their placed orders.
  - Only `ADMIN` and `MANAGER` can approve orders into processing or reject/cancel them.
- **Immutable Order Lifecycle History**:
  - Every status change records the actor, email, role, reason notes, and UTC timestamp.
  - Restricted strictly to `ADMIN` and `MANAGER`.

---

# 9. Verification & Code Quality

- **Backend Automated Test Suite**:
  - **100 tests passing (100% success rate, 0 failures, 0 errors)**.
  - Unit tests, state machine transitions, order acceptance authorization, concurrency locks, security `@PreAuthorize` verification.
- **Clean Production Build**:
  - Frontend built with Vite and TypeScript with 0 compilation errors.
  - Deprecated dialects and verbose startup queries eliminated.

---

# 10. Summary & Immediate Next Steps

- **Completed**:
  - Buyer order acceptance exclusively restricted to `ADMIN` and `MANAGER` roles.
  - Delegated role administration for Operations Managers (`BUYER`, `QC_INSPECTOR`, `LOGISTICS`).
  - Deprecated `ENGINEER` and `EDITOR` roles eradicated across the entire project.
  - Cultivar variety pricing and specifications editing for both `ADMIN` and `MANAGER`.
  - Operational Calendar API (`/api/v1/calendar/events`) and interactive calendar view.
  - Order Lifecycle Audit History API (`/api/v1/admin/orders/{id}/history`) with UI modal.
  - Real-time Admin activity watchdog stream (`/api/v1/admin/audit/recent`).
  - Produce inventory management and digital export document generation.
  - Full B2B export workflow from quotation to delivery.
  - Manager role assignment delegation.
  - Produce catalog variety pricing and inventory.
  - Real-time Admin watchdog stream.
  - Operational calendar and order lifecycle history.
- **Phase 2 Expansion**:
  - Physical IoT hardware gateway integration.
  - Live banking SWIFT rails.
  - Commercial AIS satellite vessel tracking feeds.

---
### Thank You — FIELD-EX Engineering Team
