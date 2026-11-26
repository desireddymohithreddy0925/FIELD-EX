# FIELD-EX — B2B International Agro-Export & Cold-Chain Supply Chain Platform

Welcome to the **FIELD-EX** enterprise repository. FIELD-EX is a production-grade, domain-driven B2B international agricultural export platform engineered to streamline the perishable export lifecycle—from farm-gate procurement and digital quality inspection to cold-chain logistics, customs clearance, and overseas port delivery.

---

## 📑 Core Project Documentation

For in-depth analysis, interview findings, presentation material, and scope rationale, see the dedicated documentation files:

- 📋 [**Problem Statement & Stakeholder Interview Notes**](./docs/PROBLEM_STATEMENT_AND_INTERVIEW_NOTES.md): Industry pain points, interview findings with international importers, QC leads, logistics directors, and operations managers.
- 📊 [**Presentation Slides (Markdown / Marp)**](./docs/SLIDES.md): 10-slide executive summary covering architecture, business logic, security, and roadmap.
- 🖥️ [**Interactive Presentation Deck (HTML)**](./docs/slides.html): Self-contained slide deck presentation that can be opened directly in any browser with keyboard navigation.
- 🎯 [**What We Have Not Built (And Why)**](./docs/WHAT_WE_HAVE_NOT_BUILT.md): Transparent, strategic analysis of scope boundaries (physical IoT hardware gateways, SWIFT wire rails, satellite AIS feeds) and architectural trade-offs.

---

## 🚀 Key Platform Capabilities

1. **Role Governance & Delegated Administration**:
   - `ADMIN` maintains global, unrestricted governance: assigns all roles, monitors real-time system activity, and configures enterprise settings.
   - `MANAGER` possesses delegated role assignment authority to provision and assign `BUYER`, `QC_INSPECTOR`, and `LOGISTICS` operators while HQ administrative accounts remain protected.
   - Deprecated standalone `ENGINEER` and `EDITOR` roles were removed and consolidated into unified Admin and Operations Manager consoles.

2. **Produce Catalog, Variety Quality & Commercial Price Fixing**:
   - Comprehensive produce catalog with cultivar varieties (Alphonso, Kesar, Bhagwa, Grand Naine, Thompson Seedless, etc.).
   - Interactive price fixing (`price_per_kg`, `currency`, `available_quantity`, `min_order_quantity`, `unit`).
   - Granular quality specifications: Export Grade A/Extra, Brix sweetness rating (°Bx), and physical characteristics.
   - Accessible by both `ADMIN` and `MANAGER` via `/admin/catalog` and `/manager/catalog`.

3. **Operational Milestones & Calendar API**:
   - Dedicated Calendar Engine (`GET /api/v1/calendar/events`) aggregating milestone dates:
     - `ORDER_PLACED`: Initial procurement registration.
     - `PAYMENT_CONFIRMED`: Financial confirmation.
     - `PACKING_COMPLETE`: Packhouse sorting & pallet staging.
     - `SHIPMENT_DISPATCHED`: Departure to export port.
     - `CUSTOMS_CLEARED`: Customs phytosanitary inspection.
     - `EXPECTED_DELIVERY`: Container port ETA.
     - `ORDER_DELIVERED`: Consignee receipt and delivery confirmation.
   - Interactive timeline calendar view at `/admin/calendar` and `/manager/calendar`.

4. **Order Lifecycle Audit History (Admin & Manager Only)**:
   - Dedicated endpoint `GET /api/v1/admin/orders/{id}/history` guarded by `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")`.
   - Immutable chronological audit trail of state transitions, actor name, actor email, actor role, notes, and timestamps.
   - Accessible from Admin Orders Management and Order Details views.

5. **Real-Time Admin Watchdog & Activity Audit Stream**:
   - Admin observability stream (`GET /api/v1/admin/audit/recent` and `GET /api/v1/admin/audit/logs`) restricted to `ADMIN`.
   - Live real-time dashboard widget monitoring authentication events, role changes, price updates, order transitions, and system executions.

6. **Deterministic B2B State Machines**:
   - Strict transition graphs for order lifecycles (`QUOTE_ACCEPTED` ➔ `PAYMENT_PENDING` ➔ `PAID` ➔ `PROCESSING` ➔ `PACKED` ➔ `DISPATCHED` ➔ `IN_TRANSIT` ➔ `CUSTOMS` ➔ `DELIVERED`).
   - Role-governed authorization: State transitions strictly validated across Admin, Manager, and Logistics roles.

7. **Standardized Digital QC Inspections**:
   - Pre-shipment batch scoring for sugar Brix (°Bx), pulp firmness (kg/cm²), fruit diameter caliber, visual defect percentage, and pest quarantine checks.

8. **Cold-Chain & Telemetry Monitoring**:
   - Out-of-bounds temperature and humidity excursion tracking (+1°C to +4°C tolerance) across warehouse cold rooms and reefer shipping containers.

9. **Digital Export Document Vault**:
   - Linked Phytosanitary Certificates, Certificates of Origin, Bills of Lading, and Commercial Invoices with lifecycle status tracking.

---

## 🔒 5 Dedicated Stakeholder Portals & RBAC Matrix

FIELD-EX provides **5 dedicated portals** with strict role-based access control (RBAC):

| Portal | Role | Route | Key Functions & Responsibilities | Demo Login |
| :--- | :--- | :--- | :--- | :--- |
| **Operations Admin** | `ADMIN` | `/admin` | Unrestricted role assignment, live system watchdog stream, catalog price fixing, order lifecycle history, operations calendar | `admin@field-ex.com` / `password123` |
| **Operations Manager** | `MANAGER` | `/manager` | Delegated role assignment (Buyer, QC, Logistics), produce price fixing, order lifecycle history, operations calendar, order approvals | `manager@field-ex.com` / `password123` |
| **International Buyer** | `BUYER` | `/buyer` | Browse live produce catalog & fixed prices, RFQ quotations, order placement, shipment tracking, calendar milestones | `buyer@field-ex.com` / `password123` |
| **QC Lab Inspector** | `QC_INSPECTOR` | `/qc` | Digital inspection rubric scoring (Brix, caliber, defects), lot approvals, and quarantine controls | `qc@field-ex.com` / `password123` |
| **Logistics Director** | `LOGISTICS` | `/logistics` | Cold storage room allocation, packaging schedules, export document vault, port dispatch | `logistics@field-ex.com` / `password123` |

---

## 🛠 Tech Stack & Architecture

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

- **Backend**: Java 25, Spring Boot 3.x, Spring Security (Stateless JWT), Spring Data JPA, Hibernate Envers, Liquibase.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Database**: PostgreSQL 17 with Liquibase automated migrations; In-memory H2 for tests.
- **Cache & Storage**: Redis 7, MinIO S3 Object Storage, Mailpit.

---

## 🧪 Automated Test Suite (100% Passing)

The test suite covers unit logic, concurrency controls, role permissions, state machines, and full integration workflows:

- **Total Test Classes**: 36
- **Total Tests Run**: **97**
- **Failures / Errors**: **0 / 0**
- **Test Status**: **`BUILD SUCCESS`**

```bash
# Run the complete test suite
cd field-ex-backend
./mvnw test
```

Key test suites include:
- `OrderStateMachineServiceTest`: Verifies transitions across Admin/Manager/Logistics.
- `AuthControllerTests`: Validates BCrypt hashing, JWT generation, registration, and role assignment.
- `SecurityIntegrationTest`: Validates `@PreAuthorize` rules across all role endpoints and prevents IDOR.
- `InventoryConcurrencyTest`: Validates optimistic locking under concurrent order reservations.
- `QualityInspectionControllerTests`, `ProcurementControllerTests`, `WarehouseControllerTests`.

---

## 🚀 Getting Started

### 1. Prerequisites
- Java 21 or Java 25
- Node.js 18+ & npm
- PostgreSQL 17 (port 5432)

### 2. Start PostgreSQL
```bash
# If using Docker
docker-compose up -d postgres
```

### 3. Start Backend
```bash
cd field-ex-backend
./mvnw spring-boot:run
```
*Backend runs on `http://localhost:8080`. API documentation available at `http://localhost:8080/swagger-ui.html`.*

### 4. Start Frontend
```bash
cd field-ex-frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 📜 License & Compliance

Confidential & Proprietary — FIELD-EX International Agro-Export Logistics Platform. All rights reserved.
