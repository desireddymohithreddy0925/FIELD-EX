# FIELD-EX — B2B International Agro-Export & Cold-Chain Supply Chain Platform

Welcome to the **FIELD-EX** enterprise repository. FIELD-EX is a production-grade, domain-driven B2B international agricultural export platform engineered to streamline the perishable export lifecycle—from farm-gate procurement and digital quality inspection to cold-chain logistics, customs clearance, and overseas port delivery.

---

## 📑 Core Project Documentation

For in-depth analysis, interview findings, presentation material, and scope rationale, see the dedicated documentation files:

- 📋 [**Problem Statement & Stakeholder Interview Notes**](./docs/PROBLEM_STATEMENT_AND_INTERVIEW_NOTES.md): Industry pain points, interview findings with international importers, QC leads, logistics directors, and operations managers.
- 📊 [**Presentation Slides (Markdown / Marp)**](./docs/SLIDES.md): 10-slide executive summary covering architecture, business logic, security, and roadmap.
- 🖥️ [**Interactive Presentation Deck (HTML)**](./docs/slides.html): Self-contained slide deck presentation that can be opened directly in any browser with keyboard navigation.
- 🎯 [**What We Have Not Built (And Why)**](./docs/WHAT_WE_HAVE_NOT_BUILT.md): Transparent, strategic analysis of scope boundaries (IoT hardware gateways, SWIFT rails, satellite AIS feeds) and architectural trade-offs.

---

## 🚀 Key Platform Capabilities

1. **Deterministic B2B State Machines**:
   - Strict transition graphs for order lifecycles (`REQUESTED` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `PACKED` ➔ `IN_TRANSIT` ➔ `DELIVERED`).
   - Role-governed authorization: Only `ADMIN` and `MANAGER` can approve state transitions; `EDITOR` is restricted to produce catalog management.
2. **Standardized Digital QC Inspections**:
   - Pre-shipment batch scoring for sugar Brix (°Bx), pulp firmness (kg/cm²), fruit diameter caliber, visual defect percentage, and pest quarantine checks.
3. **Cold-Chain & Telemetry Monitoring**:
   - Out-of-bounds temperature and humidity excursion tracking (+1°C to +4°C tolerance) across warehouse cold rooms and reefer shipping containers.
4. **Digital Export Document Vault**:
   - Linked Phytosanitary Certificates, Certificates of Origin, Bills of Lading, and Commercial Invoices with lifecycle status tracking.
5. **Immutable Audit Ledger**:
   - Hibernate Envers tracks every entity revision, actor timestamp, and state transition history for dispute prevention.

---

## 🔒 7 Stakeholder Portals & RBAC

FIELD-EX provides **7 dedicated portals** with strict role-based access control (RBAC):

| Portal | Role | Route | Key Functions & Responsibilities | Demo Login |
| :--- | :--- | :--- | :--- | :--- |
| **International Buyer** | `BUYER` | `/buyer` | Browse produce catalog, request quotations, view orders, track reefer temps | `buyer@field-ex.com` / `password123` |
| **Operations Manager** | `MANAGER` | `/manager` | Executive KPI overview, volume throughput chart, urgent order queue approval | `manager@field-ex.com` / `password123` |
| **Produce Catalog Editor** | `EDITOR` | `/editor` | Produce lines & varieties management, specifications, seasonal windows | `editor@field-ex.com` / `password123` |
| **Operations Admin** | `ADMIN` | `/admin` | Global platform governance, system configuration, user role management | `admin@field-ex.com` / `password123` |
| **QC Lab Inspector** | `QC_INSPECTOR` | `/qc` | Digital inspection rubric scoring (Brix, caliber, defects), lot quarantine | `qc@field-ex.com` / `password123` |
| **Systems Engineer** | `ENGINEER` | `/engineer` | System telemetry, database metrics, health monitoring, service status | `eng@field-ex.com` / `password123` |
| **Logistics Director** | `LOGISTICS` | `/logistics` | Cold storage room allocation, packaging schedules, export document vault | `logistics@field-ex.com` / `password123` |

---

## 🛠 Tech Stack & Architecture

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

- **Backend**: Java 21, Spring Boot 3.x, Spring Security (Stateless JWT), Spring Data JPA, Hibernate Envers, Liquibase.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Database**: PostgreSQL 17 (Live/Dev) with automated Liquibase migrations; In-memory H2 for tests.
- **Cache & Storage**: Redis 7, MinIO S3 Object Storage, Mailpit.

---

## 🧪 Automated Test Suite (100% Passing)

The test suite covers unit logic, concurrency controls, role permissions, and full integration workflows:

- **Total Test Classes**: 36
- **Total Tests Run**: **98**
- **Failures / Errors**: **0 / 0**
- **Test Status**: **`BUILD SUCCESS`**

```bash
# Run the complete test suite
cd field-ex-backend
./mvnw test
```

Key test suites include:
- `OrderStateMachineServiceTest`: Verifies transitions for Manager/Admin and access rejection for Editor.
- `AuthControllerTests`: Validates BCrypt hashing, JWT generation, registration, and role assignment.
- `SecurityIntegrationTest`: Validates `@PreAuthorize` rules across all 7 role endpoints and prevents IDOR.
- `InventoryConcurrencyTest`: Validates optimistic locking under concurrent order reservations.
- `QualityInspectionControllerTests`, `ProcurementControllerTests`, `WarehouseControllerTests`.

---

## 🏃 Getting Started

### Prerequisites
- Java 21+ SDK
- Node.js 20+ & npm
- PostgreSQL 17 (or Docker)

### 1. Run the Backend Server
```bash
cd field-ex-backend
./mvnw spring-boot:run
```
The backend starts on `http://localhost:8080`. Seed data and default demo accounts are automatically initialized.

### 2. Run the Frontend Client
In a separate terminal:
```bash
cd field-ex-frontend
npm install
npm run dev
```
The frontend is accessible at `http://localhost:5173`.

### 3. Or Run with Docker Compose
```bash
docker compose up --build
```
This launches the frontend, backend, PostgreSQL (`field-ex-db`), Redis, MinIO, Mailpit, and Prometheus/Grafana.

---

## 📂 Repository Structure

```text
FIELD-EX/
├── docs/                                  # Project Documentation & Artifacts
│   ├── PROBLEM_STATEMENT_AND_INTERVIEW_NOTES.md  # Field research, personas & problem statement
│   ├── SLIDES.md                          # Presentation deck in Markdown (Marp-ready)
│   ├── slides.html                        # Self-contained interactive presentation
│   └── WHAT_WE_HAVE_NOT_BUILT.md          # Technical trade-offs & deferred scope
├── field-ex-backend/                      # Spring Boot REST API
│   ├── src/main/java/com/fieldex/
│   │   ├── auth/                          # JWT Authentication & Registration
│   │   ├── config/                        # SecurityConfig & DataInitializer
│   │   ├── user/                          # User entity & Role Enum (7 Roles)
│   │   ├── buyer/                         # Buyer Portal APIs & Catalog
│   │   ├── procurement/                   # Farm Procurement & Suppliers
│   │   ├── quality/                       # QC Inspections & Lab Scoring
│   │   ├── inventory/                     # Warehouse & Cold Storage
│   │   ├── order/                         # B2B Order State Machine
│   │   └── shipment/                      # Logistics, Packaging & Phyto Docs
│   ├── src/main/resources/db/migration/   # Liquibase Changelog Migrations (01-24)
│   └── pom.xml
├── field-ex-frontend/                     # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── layouts/                       # PortalLayouts for all 7 roles
│   │   ├── pages/                         # Role Dashboards (Buyer, Manager, Editor, etc.)
│   │   ├── services/                      # Axios API Client & Auth Service
│   │   └── components/                    # UI Components
│   └── package.json
├── docker-compose.yml                     # Multi-container orchestration
└── README.md                              # Main platform documentation
```
