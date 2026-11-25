# What We Have Not Built (And Why)

In engineering production systems, deciding what **not** to build is just as vital as deciding what to build. This document transparently details the boundaries of the current FIELD-EX platform, the architectural trade-offs made, and the strategic rationale behind deferring certain capabilities.

---

## 1. Direct Physical IoT Hardware Gateways & MQTT Broker Infrastructure

- **Current Implementation**:
  - Cold-chain telemetry (temperature, humidity, GPS container coordinates, power status) is simulated and ingested via authenticated REST APIs (`/api/v1/shipments/{id}/coldchain`) with configurable thresholds and out-of-bounds excursion alerting.
- **What Was Not Built**:
  - Physical embedded firmware (C/MicroPython code for LoRaWAN or BLE beacons) and on-premise MQTT brokers (e.g., EMQX or Eclipse Mosquitto) tied to hardware reefer container data loggers.
- **Rationale & Trade-off**:
  - Hardware procurement, cellular SIM activation, and physical antenna calibration require specific embedded lab environments. The software platform abstracts telemetry via clean REST and event-driven interfaces, allowing seamless swapping of the mock sensor engine for physical IoT gateways in Phase 2 without altering any domain or frontend logic.

---

## 2. Live Bank SWIFT Wire & Escrow Payment Gateway Integration

- **Current Implementation**:
  - Robust multi-currency payment tracking lifecycle (`PENDING` → `ESCROW_HELD` → `RELEASED_TO_EXPORTER` / `REFUNDED`), linked to commercial invoices and contract milestones.
- **What Was Not Built**:
  - Live API integration with international banking rails (e.g., SWIFT GPI, Stripe Treasury, or Revolut Business International Wire APIs).
- **Rationale & Trade-off**:
  - Integrating live banking networks requires formal corporate legal entity formation, cross-border financial licenses (FCA/RBI export authorizations), and escrow regulatory approval. Developing the state-machine-driven contract escrow workflow provides 100% of the functional and data model integrity needed for business validation without premature legal/financial overhead.

---

## 3. Real-Time Satellite AIS Ocean Vessel Tracking

- **Current Implementation**:
  - Milestone-driven container tracking (`PORT_DEPARTURE`, `AT_SEA`, `TRANSSHIPMENT_HUB`, `PORT_ARRIVAL`, `CUSTOMS_INSPECTION`, `DELIVERED`), with waypoint progression, estimated arrival dates, and cold-chain sensor status.
- **What Was Not Built**:
  - Real-time satellite Automatic Identification System (AIS) satellite feeds (e.g., MarineTraffic or Spire Maritime API subscription).
- **Rationale & Trade-off**:
  - Commercial maritime AIS APIs require high enterprise recurring subscriptions ($5,000+/year) and are carrier-specific (Maersk, MSC, Hapag-Lloyd). The current domain models represent maritime waypoints cleanly, making API integration a simple plug-and-play adapter service when carrier contracts are formalized.

---

## 4. Native iOS / Android Mobile Apps (Swift & Kotlin)

- **Current Implementation**:
  - Fully responsive, mobile-first Web Application built with React 19, Tailwind CSS, and touch-optimized UI components accessible across any smartphone, tablet, or desktop browser.
- **What Was Not Built**:
  - Native Swift (iOS) and Kotlin (Android) client applications.
- **Rationale & Trade-off**:
  - A modern Progressive Web App (PWA) architecture ensures a single source of truth across all 7 portals (Buyer, Manager, Editor, Admin, QC, Engineer, Logistics). Native mobile applications would have doubled frontend development overhead without delivering substantial additional value for the core workflow validation.

---

## 5. Distributed Multi-Tenant Database Sharding

- **Current Implementation**:
  - Centralized PostgreSQL relational database with Liquibase automated migrations, connection pooling via HikariCP, and entity auditing via Hibernate Envers.
- **What Was Not Built**:
  - Multi-region distributed SQL clustering (e.g., CockroachDB or Citus distributed sharding across continents).
- **Rationale & Trade-off**:
  - At the current operational scale (thousands of monthly fruit export orders), premature horizontal database sharding adds tremendous distributed transaction complexity (two-phase commits, latency) with zero performance benefit. PostgreSQL comfortably handles tens of thousands of transactions per second on single modern instances.

---

## 6. On-Device Computer Vision for Automated Fruit Blemish Detection

- **Current Implementation**:
  - Comprehensive digital QC inspection interface capturing Brix sugar content (°Bx), firmness, calibrated diameter (mm), visual defect grading percentage, and insect pest checks with automated pass/fail thresholds.
- **What Was Not Built**:
  - On-device edge computer vision / machine learning model (e.g., YOLOv8 running on camera hardware) to visually count surface spots on fruit skin.
- **Rationale & Trade-off**:
  - Physical fruit quality assessment in export packhouses requires expert manual inspector sensory checks (smell, firmness by penetrometer, refractive index). The digital form standardizes human inspector output and records an immutable audit log, establishing the baseline dataset needed to train future vision models.

---

## 7. Direct Government Customs EDI Gateway (ICEGATE / APEDA XML)

- **Current Implementation**:
  - Digital document generation, status tracking (`DRAFT`, `SUBMITTED`, `VERIFIED`, `REJECTED`), and document attachment vault for Phytosanitary Certificates, Certificates of Origin, and Commercial Invoices.
- **What Was Not Built**:
  - Direct electronic data interchange (EDI) API connection into government customs portals (e.g., Indian Customs ICEGATE or EU TRACES NT XML schema).
- **Rationale & Trade-off**:
  - Government customs systems require official organization accreditation, digital signature dongles (DSC), and proprietary VPN connections. Generating clean, verified digital certificates in standard formats fulfills all operational requirements while leaving government endpoint submission to authorized clearing agents.

---

## Summary Matrix

| Capability | Current State | Future Phase | Strategic Reason |
| :--- | :--- | :--- | :--- |
| **IoT Telemetry** | Simulated REST API & Alerts | MQTT Gateway + Physical Beacons | Hardware independence during software validation |
| **Payments** | State-Machine Escrow Workflow | Live SWIFT / Stripe Treasury | Legal / financial escrow licensing prerequisites |
| **Vessel Tracking** | Milestone Waypoint Progression | Satellite AIS API Hook | Prohibitive commercial maritime API license costs |
| **Mobile Access** | Responsive Mobile Web (PWA) | Native iOS/Android Shell | Maximum velocity and unified cross-device codebase |
| **Database** | PostgreSQL + Envers Auditing | Distributed Sharding (Citus) | Avoided premature distributed system complexity |
| **QC Grading** | Standardized Multi-Metric Inspection | Edge ML Vision Scoring | Human-in-the-loop validation builds future training data |
| **Customs EDI** | Digital Certificate Management | ICEGATE / TRACES XML | Government VPN & proprietary DSC dongle constraints |
