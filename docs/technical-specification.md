# Sistem Informasi Keuangan — Technical Specification
## PT GMera Solusi — E-Invoicing & Financial Management System

**Version:** 1.0  
**Date:** April 30, 2026  
**Prepared For:** Development Team  
**System Name:** Sistem Informasi Keuangan (SIKeuangan)

---

## 1. Executive Summary

This document defines the complete technical architecture, database schema, API structure, and development roadmap for the Sistem Informasi Keuangan — an integrated web-based financial management system for PT GMera Solusi. The system replaces manual Excel-based bookkeeping with a centralized platform for income tracking, expense management, e-invoice generation, and financial reporting.

### Scope
- Multi-role user authentication and authorization
- Income module with automatic invoice-linking
- Expense module with multi-category classification
- E-Invoice module with PDF generation and client management
- Financial reporting with PDF/Excel export
- Dashboard with data visualization
- Client database
- Company profile & settings management

---

## 2. System Architecture

### 2.1 Tech Stack Recommendation

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | React 18 + TypeScript + Tailwind CSS + shadcn/ui | Component reusability, type safety, rapid UI development, matches modern web standards |
| **State Management** | Zustand + React Query (TanStack Query) | Lightweight global state, server state synchronization, caching |
| **Charts** | Recharts | Native React integration, responsive, customizable |
| **Tables** | TanStack Table | Powerful sorting, filtering, pagination |
| **Forms** | React Hook Form + Zod | Performance-optimized forms with schema validation |
| **Backend** | Node.js + Express + TypeScript OR Laravel 10 + PHP 8.2 | Both viable; Node preferred for modern async operations |
| **Database** | PostgreSQL 15 | ACID compliance, complex queries, JSON support for line items |
| **ORM** | Prisma (Node) or Eloquent (Laravel) | Type-safe database access, migration management |
| **Auth** | JWT (Access + Refresh tokens) + bcrypt | Stateless authentication, secure password hashing |
| **File Storage** | Local (dev) / AWS S3 or MinIO (production) | Invoice attachments, company logo, receipts |
| **PDF Generation** | Puppeteer + headless Chrome or jsPDF | Invoice PDFs and report PDFs |
| **Excel Export** | xlsx.js (SheetJS) | Client-side generation, no server load |
| **Email** | Nodemailer + SMTP or SendGrid | Invoice delivery to clients |
| **Deployment** | Docker + Docker Compose | Consistent environments, easy scaling |

### 2.2 Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Browser     │  │   Mobile    │  │   Tablet    │  │   Print     │       │
│  │   (React)     │  │   (Responsive)│  │   (Responsive)│  │   (PDF)     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY / LOAD BALANCER                        │
│                              (Nginx / Traefik)                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Backend Server (Node/Express)                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │ Auth     │ │ Income   │ │ Expense  │ │ Invoice  │ │ Report   │    │   │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                │   │
│  │  │ Client   │ │ User     │ │ Company  │ │ Audit    │                │   │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │                │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  PostgreSQL │  │  Redis      │  │  File       │  │  Email      │         │
│  │  (Primary)  │  │  (Cache/    │  │  Storage    │  │  Service    │         │
│  │             │  │   Sessions) │  │  (S3/Local) │  │  (SMTP)     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Directory Structure (Frontend)

```
src/
├── api/                          # API client & Axios interceptors
│   ├── axiosInstance.ts
│   ├── authApi.ts
│   ├── incomeApi.ts
│   ├── expenseApi.ts
│   ├── invoiceApi.ts
│   ├── clientApi.ts
│   ├── reportApi.ts
│   └── userApi.ts
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui base components
│   ├── layout/                   # Navbar, Sidebar, Footer
│   ├── forms/                    # Reusable form elements
│   ├── tables/                   # Data table components
│   ├── charts/                   # Chart wrappers
│   └── modals/                   # Confirmation, alert modals
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useIncome.ts
│   ├── useExpense.ts
│   ├── useInvoice.ts
│   └── useClient.ts
├── stores/                       # Zustand state stores
│   ├── authStore.ts
│   ├── dashboardStore.ts
│   └── uiStore.ts
├── pages/                          # Page components
│   ├── auth/
│   │   ├── LoginPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── income/
│   │   ├── IncomeListPage.tsx
│   │   └── IncomeFormPage.tsx
│   ├── expense/
│   │   ├── ExpenseListPage.tsx
│   │   └── ExpenseFormPage.tsx
│   ├── invoice/
│   │   ├── InvoiceListPage.tsx
│   │   ├── InvoiceFormPage.tsx
│   │   └── InvoiceDetailPage.tsx
│   ├── reports/
│   │   └── ReportsPage.tsx
│   ├── clients/
│   │   ├── ClientListPage.tsx
│   │   └── ClientFormPage.tsx
│   └── settings/
│       ├── CompanyProfilePage.tsx
│       ├── UserManagementPage.tsx
│       ├── CategoriesPage.tsx
│       └── TaxSettingsPage.tsx
├── utils/                        # Utilities
│   ├── formatters.ts             # Currency, date formatters
│   ├── validators.ts             # Form validators
│   ├── pdfGenerator.ts           # PDF generation helpers
│   └── exportHelpers.ts          # Excel/CSV export helpers
├── types/                        # TypeScript interfaces
│   └── index.ts
├── constants/                    # App constants
│   └── index.ts
└── App.tsx
```

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram (Logical)

```
users ||--o{ income : creates
users ||--o{ expense : creates
users ||--o{ invoices : creates
users ||--o{ audit_logs : generates

clients ||--o{ invoices : has

invoices ||--|{ invoice_items : contains
invoices ||--o{ income : generates

income ||--o{ income_items : contains
expense ||--o{ expense_items : contains

categories ||--o{ income : classifies
categories ||--o{ expense : classifies

company_profile ||--|| users : belongs_to
```

### 3.2 Table Definitions

#### Table: `users`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | User identifier |
| name | VARCHAR(100) | NOT NULL | Full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | ENUM | NOT NULL | super_admin, finance_manager, accounting_staff, sales_staff, viewer |
| phone | VARCHAR(20) | NULL | Contact number |
| avatar_url | VARCHAR(500) | NULL | Profile picture |
| is_active | BOOLEAN | DEFAULT true | Account status |
| last_login | TIMESTAMP | NULL | Last activity |
| created_at | TIMESTAMP | DEFAULT now() | Registration date |
| updated_at | TIMESTAMP | DEFAULT now() | Last update |

#### Table: `clients`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Client identifier |
| name | VARCHAR(200) | NOT NULL | Company/client name |
| address | TEXT | NULL | Full address |
| phone | VARCHAR(20) | NULL | Contact number |
| email | VARCHAR(255) | NULL | Email address |
| npwp | VARCHAR(50) | NULL | Tax ID (Indonesia) |
| created_at | TIMESTAMP | DEFAULT now() | Registration date |
| updated_at | TIMESTAMP | DEFAULT now() | Last update |

#### Table: `categories`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Category identifier |
| name | VARCHAR(100) | NOT NULL | Category name |
| type | ENUM | NOT NULL | income, expense |
| description | VARCHAR(255) | NULL | Category description |
| is_active | BOOLEAN | DEFAULT true | Visibility |
| created_at | TIMESTAMP | DEFAULT now() | Creation date |

*Seed Data (Income):* Penjualan, Piutang, Pengembalian Dana  
*Seed Data (Expense):* Operasional, Pembelian, Tagihan, Gaji

#### Table: `payment_methods`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Method identifier |
| name | VARCHAR(50) | NOT NULL | e.g., Transfer Bank, Tunai, Check |
| is_active | BOOLEAN | DEFAULT true | Availability |

#### Table: `company_profile`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Single record (singleton) |
| company_name | VARCHAR(200) | NOT NULL | PT GMera Solusi |
| address | TEXT | NOT NULL | Full address |
| phone | VARCHAR(20) | NOT NULL | Company phone |
| email | VARCHAR(255) | NOT NULL | Company email |
| npwp | VARCHAR(50) | NULL | Tax ID |
| logo_url | VARCHAR(500) | NULL | Logo for invoice/report header |
| bank_name | VARCHAR(100) | NULL | Bank account info |
| bank_account | VARCHAR(100) | NULL | Account number |
| bank_account_name | VARCHAR(100) | NULL | Account holder name |
| tax_rate | DECIMAL(5,2) | DEFAULT 11.00 | Default PPN rate % |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

#### Table: `invoices`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Invoice identifier |
| invoice_number | VARCHAR(20) | UNIQUE, NOT NULL | Auto-generated INV### |
| client_id | UUID | FK → clients | Linked client |
| client_name | VARCHAR(200) | NOT NULL | Denormalized for history |
| client_address | TEXT | NULL | Denormalized |
| client_phone | VARCHAR(20) | NULL | Denormalized |
| client_email | VARCHAR(255) | NULL | Denormalized |
| invoice_date | DATE | NOT NULL | Invoice date |
| due_date | DATE | NOT NULL | Payment deadline |
| status | ENUM | DEFAULT 'unpaid' | unpaid, paid, overdue, cancelled |
| subtotal | DECIMAL(15,2) | NOT NULL | Sum of line items |
| tax_rate | DECIMAL(5,2) | DEFAULT 11.00 | PPN % applied |
| tax_amount | DECIMAL(15,2) | NOT NULL | Calculated tax |
| shipping_cost | DECIMAL(15,2) | DEFAULT 0.00 | Ongkos kirim |
| discount_amount | DECIMAL(15,2) | DEFAULT 0.00 | Discount if any |
| grand_total | DECIMAL(15,2) | NOT NULL | Final amount |
| notes | TEXT | NULL | Invoice notes/terimakasih |
| attachment_url | VARCHAR(500) | NULL | Supporting file |
| created_by | UUID | FK → users | Creator |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |
| paid_at | TIMESTAMP | NULL | When marked as paid |

#### Table: `invoice_items`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Item identifier |
| invoice_id | UUID | FK → invoices, CASCADE | Parent invoice |
| description | VARCHAR(500) | NOT NULL | Item description |
| quantity | DECIMAL(10,2) | NOT NULL | Qty |
| unit | VARCHAR(50) | DEFAULT 'Pcs' | Unit of measurement |
| unit_price | DECIMAL(15,2) | NOT NULL | Price per unit |
| total_price | DECIMAL(15,2) | NOT NULL | qty × unit_price |

#### Table: `income`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Income identifier |
| date | DATE | NOT NULL | Transaction date |
| source | VARCHAR(200) | NOT NULL | Description of source |
| category_id | UUID | FK → categories | Income category |
| payment_method_id | UUID | FK → payment_methods | How paid |
| amount | DECIMAL(15,2) | NOT NULL | Total amount |
| reference_number | VARCHAR(50) | NULL | Invoice ref or external ref |
| invoice_id | UUID | FK → invoices, NULL | Linked invoice (auto-generated) |
| entry_method | ENUM | DEFAULT 'manual' | manual, auto |
| description | TEXT | NULL | Additional notes |
| attachment_url | VARCHAR(500) | NULL | Proof of payment |
| created_by | UUID | FK → users | Creator |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

#### Table: `income_items`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Item identifier |
| income_id | UUID | FK → income, CASCADE | Parent income |
| description | VARCHAR(500) | NOT NULL | Product/service description |
| quantity | DECIMAL(10,2) | NOT NULL | Qty |
| unit | VARCHAR(50) | DEFAULT 'Unit' | Unit |
| unit_price | DECIMAL(15,2) | NOT NULL | Price |
| total_price | DECIMAL(15,2) | NOT NULL | Calculated |

#### Table: `expense`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Expense identifier |
| date | DATE | NOT NULL | Transaction date |
| expense_type | VARCHAR(200) | NOT NULL | e.g., Biaya Operasional |
| category_id | UUID | FK → categories | Expense category |
| payment_method_id | UUID | FK → payment_methods | How paid |
| amount | DECIMAL(15,2) | NOT NULL | Total amount |
| description | TEXT | NULL | Notes |
| attachment_url | VARCHAR(500) | NULL | Receipt file |
| created_by | UUID | FK → users | Creator |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

#### Table: `expense_items`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Item identifier |
| expense_id | UUID | FK → expense, CASCADE | Parent expense |
| description | VARCHAR(500) | NOT NULL | Item description |
| quantity | DECIMAL(10,2) | NOT NULL | Qty |
| unit | VARCHAR(50) | DEFAULT 'Pcs' | Unit |
| unit_price | DECIMAL(15,2) | NOT NULL | Price |
| total_price | DECIMAL(15,2) | NOT NULL | Calculated |

#### Table: `audit_logs`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Log identifier |
| user_id | UUID | FK → users | Who performed action |
| action | ENUM | NOT NULL | create, update, delete, view, export, login, logout |
| entity_type | VARCHAR(50) | NOT NULL | income, expense, invoice, client, user, setting |
| entity_id | UUID | NULL | Affected record ID |
| old_values | JSONB | NULL | Before state |
| new_values | JSONB | NULL | After state |
| ip_address | VARCHAR(45) | NULL | User IP |
| user_agent | VARCHAR(500) | NULL | Browser info |
| created_at | TIMESTAMP | DEFAULT now() |

---

## 4. API Specification (RESTful)

### 4.1 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/login | Login with email/password | No |
| POST | /api/auth/logout | Invalidate tokens | Yes |
| POST | /api/auth/refresh | Refresh access token | Yes (refresh token) |
| GET | /api/auth/me | Get current user | Yes |

### 4.2 User Management Endpoints (Admin only)

| Method | Endpoint | Description | Role Access |
|--------|----------|-------------|-------------|
| GET | /api/users | List all users | super_admin, finance_manager |
| POST | /api/users | Create user | super_admin |
| GET | /api/users/:id | Get user detail | super_admin, finance_manager |
| PUT | /api/users/:id | Update user | super_admin |
| DELETE | /api/users/:id | Delete/Deactivate | super_admin |

### 4.3 Income Endpoints

| Method | Endpoint | Description | Role Access |
|--------|----------|-------------|-------------|
| GET | /api/income | List with pagination & filters | All authenticated |
| POST | /api/income | Create income record | accounting_staff, finance_manager, super_admin, sales_staff (sales-only) |
| GET | /api/income/:id | Get detail | All |
| PUT | /api/income/:id | Update | accounting_staff (own), finance_manager, super_admin |
| DELETE | /api/income/:id | Delete | finance_manager, super_admin |
| POST | /api/income/:id/attachment | Upload attachment | accounting_staff, finance_manager, super_admin |

### 4.4 Expense Endpoints

| Method | Endpoint | Description | Role Access |
|--------|----------|-------------|-------------|
| GET | /api/expense | List with filters | All (except sales_staff only sees none) |
| POST | /api/expense | Create | accounting_staff, finance_manager, super_admin |
| GET | /api/expense/:id | Detail | All authorized |
| PUT | /api/expense/:id | Update | finance_manager, super_admin, accounting_staff (own) |
| DELETE | /api/expense/:id | Delete | finance_manager, super_admin |

### 4.5 Invoice Endpoints

| Method | Endpoint | Description | Role Access |
|--------|----------|-------------|-------------|
| GET | /api/invoices | List with filters | All |
| POST | /api/invoices | Create invoice | accounting_staff, sales_staff, finance_manager, super_admin |
| GET | /api/invoices/:id | Detail | All |
| PUT | /api/invoices/:id | Update | Creator + finance_manager + super_admin |
| DELETE | /api/invoices/:id | Delete | finance_manager, super_admin |
| POST | /api/invoices/:id/mark-paid | Mark as paid + auto-income | finance_manager, super_admin, accounting_staff |
| GET | /api/invoices/:id/pdf | Generate PDF | All |
| POST | /api/invoices/:id/send-email | Email to client | accounting_staff, sales_staff, finance_manager, super_admin |

### 4.6 Client Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/clients | List all clients |
| POST | /api/clients | Create client |
| GET | /api/clients/:id | Detail |
| PUT | /api/clients/:id | Update |
| DELETE | /api/clients/:id | Delete (if no invoices) |

### 4.7 Report Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/income | Income report data (JSON) |
| GET | /api/reports/expense | Expense report data (JSON) |
| GET | /api/reports/combined | Combined report data |
| POST | /api/reports/export-pdf | Generate PDF report |
| POST | /api/reports/export-excel | Generate Excel report |

### 4.8 Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/summary | Cards data (totals, balance) |
| GET | /api/dashboard/chart | Monthly chart data |
| GET | /api/dashboard/unpaid-invoices | Top 5 overdue |
| GET | /api/dashboard/recent-transactions | Last 5 entries |

---

## 5. Business Rules & Logic

### 5.1 Invoice Number Generation
```
Format: INV + 3-digit sequential number
Algorithm: 
  - Query MAX invoice_number where invoice_number LIKE 'INV%'
  - Extract numeric part, increment by 1
  - Pad to 3 digits
Example: INV001, INV002, ... INV025, INV026
```

### 5.2 Invoice Status Lifecycle
```
[Created] → Status: unpaid
    ↓
[Client Pays] → Mark as Paid → Status: paid
    ↓
[System] → Auto-create income record with:
    source = "Invoice {invoice_number}"
    category_id = Piutang category
    entry_method = "auto"
    invoice_id = {invoice_id}
    amount = invoice.grand_total
```

### 5.3 Financial Calculations

**Invoice Total:**
```
subtotal = SUM(invoice_items.total_price)
tax_amount = subtotal × (tax_rate / 100)
grand_total = subtotal + tax_amount + shipping_cost - discount_amount
```

**Dashboard Balance:**
```
total_income = SUM(income.amount) WHERE date <= selected_period
total_expense = SUM(expense.amount) WHERE date <= selected_period
balance = total_income - total_expense
```

### 5.4 Role-Based Access Control (RBAC)

Implemented via middleware that checks `req.user.role` against route permissions.

| Permission | super_admin | finance_manager | accounting_staff | sales_staff | viewer |
|------------|:-----------:|:---------------:|:----------------:|:-----------:|:------:|
| Create Income | Yes | Yes | Yes | Sales only | No |
| Edit Income | Yes | Yes | Own records | Own records | No |
| Delete Income | Yes | Yes | No | No | No |
| Create Expense | Yes | Yes | Yes | No | No |
| Edit Expense | Yes | Yes | Own records | No | No |
| Delete Expense | Yes | Yes | No | No | No |
| Create Invoice | Yes | Yes | Yes | Yes | No |
| Edit Invoice | Yes | Yes | Own records | Own records | No |
| Mark as Paid | Yes | Yes | Yes | No | No |
| Delete Invoice | Yes | Yes | No | No | No |
| Generate Reports | Yes | Yes | Yes | No | View only |
| Export Data | Yes | Yes | Yes | No | No |
| Manage Users | Yes | No | No | No | No |
| Manage Settings | Yes | View | No | No | No |
| View Audit Log | Yes | Yes | No | No | No |

### 5.5 Data Validation Rules

- **Email:** Valid email format, unique across users and clients
- **Phone:** Numeric with optional + prefix, 10-15 characters
- **Amounts:** Positive decimal, max 999,999,999,999.99
- **Dates:** Not in future for income/expense; Invoice due_date ≥ invoice_date
- **Required Fields:** Marked with * in UI, server-side validated
- **File Uploads:** Max 2MB, types: JPG, PNG, PDF
- **Tax Rate:** 0-100%, default 11%

---

## 6. Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| Password Policy | Min 8 chars, uppercase, lowercase, number, special char |
| Login Attempts | Max 5 attempts, 15-minute lockout |
| Session Management | JWT access token (15 min expiry) + HTTP-only refresh cookie (7 days) |
| HTTPS | Mandatory for all communications |
| SQL Injection | Prevented via parameterized queries (Prisma/ORM) |
| XSS | Prevented via React's built-in escaping + CSP headers |
| CSRF | Not needed for JWT, but implement for state-changing ops if using cookies |
| File Upload | Validate MIME type, scan for malware, store outside web root |
| Role Verification | Middleware check on every protected route |
| Audit Trail | Log all create/update/delete actions with before/after values |
| Data Backup | Daily automated PostgreSQL dump |

---

## 7. Performance Requirements

| Metric | Target |
|--------|--------|
| Page Load Time | < 2 seconds (on 3G) |
| API Response Time | < 500ms for list queries |
| PDF Generation | < 3 seconds for single invoice |
| Excel Export | < 5 seconds for 1000 records |
| Concurrent Users | Support 50 simultaneous users |
| Database Query | All list queries paginated (default 25/page) |
| File Upload | Progress indicator for files > 500KB |

---

## 8. Development Phases (MVP → Full)

### Phase 1: Foundation (Week 1-2)
- Project setup, database schema, authentication
- User management (Super Admin only)
- Company profile settings

### Phase 2: Core Financial (Week 3-4)
- Income module (CRUD + items table)
- Expense module (CRUD + items table)
- Categories & payment methods management

### Phase 3: E-Invoice (Week 5-6)
- Client database
- Invoice creation with line items
- Invoice PDF generation
- Mark as paid + auto-income creation

### Phase 4: Dashboard & Reports (Week 7)
- Dashboard with charts and widgets
- Report generation (PDF + Excel)
- Date range filtering

### Phase 5: Polish & Security (Week 8)
- RBAC implementation across all routes
- Audit logging
- File upload handling
- Email notifications
- Testing & bug fixes

---

## 9. Third-Party Integrations

| Service | Purpose | Priority |
|---------|---------|----------|
| SMTP/SendGrid | Email invoices to clients | High |
| Cloud Storage (S3) | File attachments hosting | Medium |
| WhatsApp API (optional) | Send invoice notifications | Low |

---

## 10. Testing Strategy

| Type | Scope | Tools |
|------|-------|-------|
| Unit Tests | Services, utilities, validators | Jest (FE), Vitest/Mocha (BE) |
| Integration Tests | API endpoints | Supertest + Jest |
| E2E Tests | Critical user flows | Playwright or Cypress |
| Security Tests | Auth, RBAC, injection | Manual + automated scanners |
| UAT | Full system with client | Staging environment |

---

*End of Technical Specification*
