# FIELD-EX - B2B International Agro-Export Management Platform

Welcome to the **FIELD-EX** project repository! This is a comprehensive, production-grade B2B international fruit export management platform designed specifically for an agricultural export enterprise.

## 🚀 Overview

FIELD-EX connects farmers with international buyers, streamlining the entire agricultural export lifecycle—from farm procurement and quality inspection to international logistics and final delivery.

### Key Workflows:
1. **Procurement**: Farmers sell produce to FIELD-EX.
2. **Quality Control**: Produce is inspected, sorted, and stored.
3. **Inventory**: Batches and lots are managed meticulously across warehouses and cold chains.
4. **B2B Commerce**: International buyers browse stock, request quotations, and place orders.
5. **Logistics**: Orders are packed, export documentation is automatically prepared, and shipments are dispatched and tracked.

## 🛠 Tech Stack

The application is built using a modern, scalable architecture:

### Backend (`/field-ex-backend`)
- **Framework**: Java 21 + Spring Boot 3.x
- **Architecture**: Modular Monolith
- **Security**: JWT-based Stateless Authentication, Role-based Access Control (RBAC)
- **Database**: H2 (In-Memory for Development) / PostgreSQL (Production)
- **API Documentation**: OpenAPI / Swagger UI

### Frontend (`/field-ex-frontend`)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context / Hooks
- **Icons**: Lucide React

## 📂 Project Structure

```text
FIELD-EX/
├── field-ex-backend/    # Spring Boot REST API
│   ├── src/main/java/com/fieldex/
│   │   ├── auth/        # JWT Authentication & Registration
│   │   ├── config/      # Spring Security & App Config
│   │   ├── user/        # Admin & System User Management
│   │   ├── buyer/       # International B2B Buyer Profiles
│   │   ├── procurement/ # Farm Procurement & Orders
│   │   ├── quality/     # Quality Control & Inspections
│   │   ├── inventory/   # Warehouse & Cold Storage
│   │   ├── quotation/   # B2B Quotations
│   │   ├── order/       # B2B Order Management
│   │   └── shipment/    # Logistics, Packaging & Export Documents
│   └── pom.xml          # Maven Configuration
│
└── field-ex-frontend/   # React Vite Application
    ├── src/
    │   ├── layouts/     # Admin, Buyer & Engineer Layouts
    │   ├── pages/       # Dashboards & Data Tables
    │   ├── services/    # Axios API Client
    │   └── assets/      # Brand Images & Icons
    ├── tailwind.config.js
    └── package.json
```

## 🏃‍♂️ Getting Started

Follow these steps to run the application locally on your machine.

### 1. Run the Backend Server
The backend is configured to use an H2 in-memory database out of the box, so no Docker or external database setup is required for local development.

```bash
cd field-ex-backend
./mvnw spring-boot:run
```
The backend API will start on `http://localhost:8080`.

### 2. Run the Frontend Development Server
In a new terminal tab, start the Vite development server:

```bash
cd field-ex-frontend
npm install
npm run dev
```
The web application will be accessible at `http://localhost:5173`.

## 🔒 Roles & Access

The platform utilizes strict Role-Based Access Control (RBAC). The following roles are supported:
- `ADMIN`: Full access to the platform.
- `BUYER`: Access to fruit inventory, quotation requests, and order tracking.
- `ENGINEER`: Technical support and system monitoring.
- `LOGISTICS`: Shipment, packaging, and documentation management.
- `QC_INSPECTOR`: Quality checks and inspections.
