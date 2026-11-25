# FIELD-EX: Problem Statement & Stakeholder Interview Notes

## 1. Executive Problem Statement

International agro-export—specifically the export of high-value perishable produce (such as Alphonso & Kesar Mangoes, Bhagwa Pomegranates, Fresh Table Grapes, Cavendish Bananas, and Papayas)—is plagued by severe operational fragmentation, information asymmetry, and cold-chain compliance failures.

### Core Industry Pain Points:
1. **Opaque Quality Grading & Dispute Risks**:
   International buyers located in Europe, the Middle East, and North America frequently reject or re-negotiate shipments upon destination port arrival due to undocumented quality degradation, pest damage, or cosmetic discrepancies. Without tamper-proof digital inspection logs, exporters bear 100% of the financial write-downs.
2. **Cold-Chain Excursions & Perishability Loss**:
   Maintaining strict temperature tolerances (+1°C to +4°C) from the packhouse through reefer containers to international freight hubs is critical. A single unnoticed refrigeration breakdown leads to rapid microbial spoilage and total loss of cargo.
3. **Complex Cross-Border Documentation & Customs Delays**:
   Exporting fresh agricultural produce requires synchronized Phytosanitary Certificates, Certificates of Origin, Bill of Lading, Packing Lists, Commercial Invoices, and Fumigation Certificates. Manual paper-based or disjointed email handoffs cause clearance delays at ports, destroying shelf-life.
4. **Disconnected Stakeholders & Disparate Tools**:
   Procurement officers, quality inspectors, cold-storage warehouse supervisors, logistics coordinators, commercial editors, and international buyers operate across disconnected spreadsheets, WhatsApp messages, and phone calls without a centralized system of record.

---

## 2. Field Interview Notes & Stakeholder Personas

To architect a resilient, domain-driven platform, qualitative interviews were conducted across the end-to-end export value chain.

### Persona 1: International Produce Importer (Buyer)
- **Representative**: John Doe, Procurement Director at *Global Fresh Imports Ltd*, Covent Garden / Felixstowe Port, UK.
- **Key Quotes & Feedback**:
  > *"When ordering 20 metric tons of Alphonso mangoes, my biggest risk is blind transit. Once the container leaves Mumbai or Nhava Sheva, I often receive zero reliable updates until it docks in Felixstowe 18 days later. If the pulp temperature crossed +8°C, the fruit arrives overripe or spoiled."*
  > *"I need an online portal where I can review verifiable quality inspection sheets, track my live container temperature, download phytosanitary certifications, and accept quotation contracts instantly."*
- **Derived System Requirements**:
  - Transparent B2B Produce Catalog with seasonal availability, certifications, and specifications.
  - Interactive quotation request and structured negotiation workflows.
  - Dedicated Buyer Portal showing real-time cold-chain sensor status, active order pipeline, and one-click export document downloads.

---

### Persona 2: Operations General Manager
- **Representative**: Rajesh Kulkarni, VP of Operations, FIELD-EX Hub, Maharashtra.
- **Key Quotes & Feedback**:
  > *"My job is managing risk and margins. I need visibility into daily warehouse throughput, unfulfilled buyer demand, supplier delivery bottlenecks, and packing queue delays."*
  > *"I cannot afford to have a buyer order confirmed if our packhouses don't have available fruit lots that meet that buyer's Grade-A export threshold."*
- **Derived System Requirements**:
  - Executive Operations Command Center with operational KPIs (Export Volume, Order Fulfillment Rate, Active Lots).
  - Authority to approve or override state transitions on orders, supplier procurements, and packaging allocations.
  - Inventory velocity insights and near-expiry batch warning alarms.

---

### Persona 3: Senior Quality Control (QC) Inspector
- **Representative**: Dr. Sunita Patil, Chief Quality Inspector, Packhouse QC Lab, Nashik.
- **Key Quotes & Feedback**:
  > *"Every international destination has rigid phytosanitary thresholds. The EU rejects fruit with any fruit fly larvae or pesticide MRL violations; the Gulf demands strict Brix sugar content and uniform calibration."*
  > *"When inspecting a batch, I must record Brix (°Bx), pulp firmness (kg/cm²), fruit diameter, visual blemish percentage, and insect check results. If a lot fails, it must be quarantined immediately to prevent cross-contamination in cold storage."*
- **Derived System Requirements**:
  - Standardized digital QC inspection forms with pass/fail evaluation and multi-parameter metrics.
  - Automatic batch status progression (e.g., `PENDING_INSPECTION` → `APPROVED` / `REJECTED`).
  - Immutable audit trail linking inspector identity and timestamp to every inspection report.

---

### Persona 4: Cold-Chain Logistics & Warehouse Director
- **Representative**: Ahmed Al-Mansoor, Logistics Director, Cold Storage & Freight Forwarding.
- **Key Quotes & Feedback**:
  > *"Perishables don't wait. Cold storage rooms must maintain zone-specific temperature and humidity. Once packed into corrugated export cartons, palletizing and customs sealing must follow a strict checklist."*
  > *"Customs clearing agents need instant access to the Phytosanitary Certificate, Bill of Lading, and Fumigation certificate. Missing one document costs $500 per day in port demurrage."*
- **Derived System Requirements**:
  - Cold storage location management (rack, row, shelf, temperature monitoring).
  - Logistics dashboard tracking packaging progress, pallet numbering, container seal tracking, and milestone updates (`DISPATCHED`, `IN_TRANSIT`, `CUSTOMS_CLEARED`, `DELIVERED`).
  - Centralized digital document vault with status tracking (`DRAFT`, `SUBMITTED`, `VERIFIED`, `REJECTED`).

---

### Persona 5: Produce Catalog & Variety Editor
- **Representative**: Priya Sharma, Agronomy & Produce Merchandising Specialist.
- **Key Quotes & Feedback**:
  > *"Fruit cultivars differ radically. Alphonso differs from Kesar or Banganapalli in Brix level, season window, shelf-life, and optimum storage temperature (+13°C vs +4°C for pomegranates)."*
  > *"I need an intuitive interface to manage produce lines, varieties, HS codes, seasonal calendar windows, and export packaging specifications without touching code or running database scripts."*
- **Derived System Requirements**:
  - Dedicated Produce Variety Editor console with real-time variety management.
  - Search, filter, category breakdown, and export specification guidelines.
  - Guarded permissions restricting catalog editing solely to `EDITOR` and `ADMIN` roles.

---

### Persona 6: Principal Systems Engineer
- **Representative**: David Chen, Platform Architect & Systems Engineer.
- **Key Quotes & Feedback**:
  > *"With concurrent buyers placing orders and inventory lots being allocated in real-time, race conditions could cause double-allocation of the same pallet lot. We require optimistic locking and strict transactional integrity."*
  > *"We need automated audit logging of every status transition and an immutable ledger of entity changes using Hibernate Envers."*
- **Derived System Requirements**:
  - Robust modular monolith backend (Spring Boot 3, Java 21, JPA/Hibernate Envers).
  - Optimistic locking (`@Version`) on inventory and order records.
  - Full automated regression test suite covering all state machines, security filters, and concurrent transactions.

---

## 3. Synthesis: Key Design Decisions

| Finding | Strategic Architectural Choice |
| :--- | :--- |
| Diverse stakeholder workflows | **Dedicated Role-Based Portals**: Clean isolation for Buyer, Admin, Manager, Editor, QC, Engineer, and Logistics. |
| Compliance & Dispute Prevention | **Immutable Envers Auditing**: Every inspection, quotation price change, and shipment status update is permanently versioned. |
| Critical State Transitions | **State Machine Service Layer**: Deterministic transition graphs for orders (`REQUESTED` → `CONFIRMED` → `PACKED` → `SHIPPED` → `DELIVERED`) and shipments with role-enforced authorizations. |
| Zero Data Corruption | **PostgreSQL Constraints & Liquibase**: Strict schema-level check constraints and automated changelog migrations. |
| Offline / Network Resiliency | **Optimized REST APIs & Fast Client-Side Routing**: React 19 + Vite frontend with instant optimistic state responses. |
