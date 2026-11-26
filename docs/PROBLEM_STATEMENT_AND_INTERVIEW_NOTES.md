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
   Procurement officers, quality inspectors, cold-storage warehouse supervisors, logistics coordinators, commercial merchandisers, and international buyers operate across disconnected spreadsheets, WhatsApp messages, and phone calls without a centralized system of record.

---

## 2. Field Interview Notes & Stakeholder Personas

To architect a resilient, domain-driven platform, qualitative interviews were conducted across the end-to-end export value chain.

### Persona 1: International Produce Importer (Buyer)
- **Representative**: John Doe, Procurement Director at *Global Fresh Imports Ltd*, Covent Garden / Felixstowe Port, UK.
- **Key Quotes & Feedback**:
  > *"When ordering 20 metric tons of Alphonso mangoes, my biggest risk is blind transit. Once the container leaves Mumbai or Nhava Sheva, I often receive zero reliable updates until it docks in Felixstowe 18 days later. If the pulp temperature crossed +8°C, the fruit arrives overripe or spoiled."*
  > *"I need an online portal where I can review verifiable quality inspection sheets, track my live container temperature, download phytosanitary certifications, and accept quotation contracts instantly."*
- **Derived System Requirements**:
  - Transparent B2B Produce Catalog with fixed FOB pricing, seasonal availability, certifications, and specifications.
  - Interactive quotation request and structured negotiation workflows.
  - Dedicated Buyer Portal showing real-time cold-chain sensor status, active order pipeline, and one-click export document downloads.
  - Operational milestone calendar tracking order placement, packing, dispatch, port ETA, and receipt.

---

### Persona 2: Operations General Manager
- **Representative**: Rajesh Kulkarni, VP of Operations, FIELD-EX Hub, Maharashtra.
- **Key Quotes & Feedback**:
  > *"My job is managing risk, margins, and operational velocity. I need direct visibility into daily warehouse throughput, unfulfilled buyer demand, supplier delivery bottlenecks, and packing queue delays."*
  > *"Crucially, buyers must not be able to self-authorize export commitments. When a buyer places an order from an approved quotation, it must enter a pending acceptance queue. Only Admin and Operations Managers possess the authority to accept the order, verifying cold-room stock availability before inventory is locked via FIFO and scheduled for packaging."*
  > *"I also need authority to fix cultivar prices and stock availability on the fly, provision buyer and logistics accounts without waiting for IT, and review the immutable audit history of every order transition."*
- **Derived System Requirements**:
  - Exclusive Admin & Manager Order Acceptance Gate: Buyer-placed orders require explicit acceptance (`POST /api/v1/admin/orders/{id}/accept`) by Admin or Manager to initiate `PROCESSING` and FIFO stock reservation.
  - Executive Operations Command Center with operational KPIs (Export Volume, Order Fulfillment Rate, Active Lots).
  - Delegated role assignment authority to provision and assign `BUYER`, `QC_INSPECTOR`, and `LOGISTICS` roles.
  - Live Produce Catalog & Price Fixing console to adjust prices per kg/MT, currencies, available stock, and MOQ.
  - Order Lifecycle History modal displaying every status transition, actor, role, and compliance note.
  - Operations Calendar tracking order dates, packhouse packing, export dispatch, customs, and port delivery.

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
  - Logistics dashboard tracking packaging progress, pallet numbering, container seal tracking, and milestone updates (`DISPATCHED`, `IN_TRANSIT`, `CUSTOMS`, `DELIVERED`).
  - Centralized digital document vault with status tracking (`DRAFT`, `SUBMITTED`, `VERIFIED`, `REJECTED`).

---

### Persona 5: System Administrator (HQ Governance)
- **Representative**: Chief Information & Compliance Officer, FIELD-EX HQ.
- **Key Quotes & Feedback**:
  > *"For food safety audits and commercial compliance, we must maintain total visibility over the platform. The Admin must be able to see every action in real time—who logged in, who updated a price, who assigned a role, and who transitioned an order."*
  > *"Administrative control over all roles must be absolute, ensuring that privileged accounts cannot be tampered with."*
- **Derived System Requirements**:
  - Unrestricted user provisioning and role assignment across all roles.
  - Real-time System Activity Stream / Watchdog widget streaming live audit logs.
  - Global catalog pricing and order governance.
