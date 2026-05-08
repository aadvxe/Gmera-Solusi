# GMera Solusi - Financial ERP & Dashboard

GMera Solusi is a professional financial management system and ERP dashboard designed for small to medium-sized enterprises. It provides a comprehensive suite of tools for tracking income, managing expenses, generating e-invoices, and monitoring business health through real-time analytics.

## 🚀 Key Features

- **Financial Dashboard**: Real-time KPI tracking for income, expenses, net profit, and unpaid invoices.
- **E-Invoicing System**: Create professional invoices with automatic tax and discount calculations.
- **Income & Expense Tracking**: Detailed logging of transactions with category classification.
- **Client Management**: Maintain a central database of clients with detailed transaction history and stats.
- **Category Management**: Organized transaction classification with drag-and-drop reordering.
- **Notification System**: Live notifications for system activities (paid invoices, new records, etc.).
- **User Management**: Role-based access control and user status management.
- **Audit Logs**: Comprehensive tracking of all critical system actions.

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Icons**: Astraicons (Premium Bold & Linear sets)
- **Charts**: Recharts

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

You will also need a [Supabase](https://supabase.com/) project set up.

## ⚙️ Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd "Gmera Solusi"
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**:
   The database schema and initial seed data are located in the `schema/` directory.
   - Run the SQL scripts in `schema/schema-final.sql` in your Supabase SQL Editor.
   - Run the seed scripts in `schema/seed-final.sql` to populate initial data.

5. **Run the development server**:

   ```bash
   npm run dev
   ```

6. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

- `src/app/`: Next.js pages and layouts (Dashboard, Invoices, Clients, etc.).
- `src/components/`:
  - `layout/`: Navbar, Sidebar, and Page wrappers.
  - `dashboard/`: Dashboard-specific widgets and charts.
  - `ui/`: Reusable primitive components (Button, Modal, Table, etc.).
- `src/lib/db/`: Modularized database access layer (Supabase logic).
- `src/store/`: Zustand state management (Auth, etc.).
- `schema/`: Database migration and seed files.
- `docs/`: Detailed project documentation and technical specifications.

## 📊 System Architecture

### Entity Relationship Diagram (ERD)

The following diagram shows the database schema and relationships between tables:

```mermaid
erDiagram
    users ||--o{ invoices : creates
    users ||--o{ income : records
    users ||--o{ expense : records
    users ||--o{ audit_logs : generates
    
    clients ||--o{ invoices : receives
    
    categories ||--o{ income : categorizes
    categories ||--o{ expense : categorizes
    
    payment_methods ||--o{ income : uses
    payment_methods ||--o{ expense : uses
    
    invoices ||--o{ invoice_items : contains
    invoices ||--o| income : generates
    
    income ||--o{ income_items : contains
    expense ||--o{ expense_items : contains
    
    users {
        uuid id PK
        varchar name
        varchar email UK
        user_role role
        varchar phone
        varchar department
        varchar avatar_url
        boolean is_active
        timestamptz last_login
        timestamptz created_at
    }
    
    clients {
        uuid id PK
        varchar name
        text address
        varchar city
        varchar province
        varchar postal_code
        varchar phone
        varchar email
        varchar npwp
        text notes
        boolean is_active
        timestamptz created_at
    }
    
    categories {
        uuid id PK
        varchar name
        category_type type
        varchar description
        boolean is_active
        timestamptz created_at
    }
    
    payment_methods {
        uuid id PK
        varchar name
        boolean is_active
    }
    
    invoices {
        uuid id PK
        varchar invoice_number UK
        uuid client_id FK
        date invoice_date
        date due_date
        invoice_status status
        decimal subtotal
        decimal tax_amount
        decimal shipping_cost
        decimal discount_amount
        decimal grand_total
        text notes
        uuid created_by FK
        timestamptz created_at
        timestamptz paid_at
    }
    
    invoice_items {
        uuid id PK
        uuid invoice_id FK
        varchar description
        decimal quantity
        varchar unit
        decimal unit_price
        decimal total_price
    }
    
    income {
        uuid id PK
        date date
        varchar source
        uuid category_id FK
        uuid payment_method_id FK
        decimal amount
        varchar reference_number
        uuid invoice_id FK
        entry_method entry_method
        varchar status
        text description
        uuid created_by FK
        timestamptz created_at
    }
    
    income_items {
        uuid id PK
        uuid income_id FK
        varchar description
        decimal quantity
        varchar unit
        decimal unit_price
        decimal total_price
    }
    
    expense {
        uuid id PK
        date date
        varchar expense_type
        uuid category_id FK
        uuid payment_method_id FK
        decimal amount
        varchar reference_number
        varchar status
        text description
        uuid created_by FK
        timestamptz created_at
    }
    
    expense_items {
        uuid id PK
        uuid expense_id FK
        varchar description
        decimal quantity
        varchar unit
        decimal unit_price
        decimal total_price
    }
    
    audit_logs {
        uuid id PK
        uuid user_id FK
        audit_action action
        varchar entity_type
        uuid entity_id
        jsonb old_values
        jsonb new_values
        varchar ip_address
        timestamptz created_at
    }
```

### System Flowchart

This flowchart illustrates the main business processes in the application:

```mermaid
flowchart TD
    Start([User Access System]) --> Auth{Authenticated?}
    Auth -->|No| Login[Login Page]
    Login --> AuthCheck{Valid Credentials?}
    AuthCheck -->|No| Login
    AuthCheck -->|Yes| Dashboard[Dashboard]
    Auth -->|Yes| Dashboard
    
    Dashboard --> Action{Select Action}
    
    Action -->|Create Invoice| InvoiceFlow[Invoice Creation Process]
    Action -->|Record Income| IncomeFlow[Income Recording Process]
    Action -->|Record Expense| ExpenseFlow[Expense Recording Process]
    Action -->|Manage Clients| ClientFlow[Client Management]
    Action -->|View Reports| ReportFlow[Financial Reports]
    
    InvoiceFlow --> SelectClient[Select/Create Client]
    SelectClient --> AddItems[Add Invoice Items]
    AddItems --> CalcTax[Calculate Tax & Total]
    CalcTax --> SaveInvoice[Save Invoice]
    SaveInvoice --> InvoiceStatus{Invoice Status}
    InvoiceStatus -->|Unpaid| WaitPayment[Wait for Payment]
    InvoiceStatus -->|Paid| AutoIncome[Auto-Generate Income Record]
    AutoIncome --> AuditLog1[Log to Audit Trail]
    WaitPayment --> MarkPaid[Mark as Paid]
    MarkPaid --> AutoIncome
    
    IncomeFlow --> SelectCategory1[Select Category]
    SelectCategory1 --> EnterAmount1[Enter Amount & Details]
    EnterAmount1 --> AddIncomeItems[Add Income Items]
    AddIncomeItems --> SaveIncome[Save Income Record]
    SaveIncome --> AuditLog2[Log to Audit Trail]
    
    ExpenseFlow --> SelectCategory2[Select Category]
    SelectCategory2 --> EnterAmount2[Enter Amount & Details]
    EnterAmount2 --> AddExpenseItems[Add Expense Items]
    AddExpenseItems --> SaveExpense[Save Expense Record]
    SaveExpense --> AuditLog3[Log to Audit Trail]
    
    ClientFlow --> ClientAction{Client Action}
    ClientAction -->|Create| AddClient[Add New Client]
    ClientAction -->|View| ViewClient[View Client Details]
    ClientAction -->|Update| UpdateClient[Update Client Info]
    AddClient --> SaveClient[Save to Database]
    UpdateClient --> SaveClient
    
    ReportFlow --> SelectPeriod[Select Date Range]
    SelectPeriod --> FetchData[Fetch Financial Data]
    FetchData --> GenerateReport[Generate Charts & Summary]
    GenerateReport --> ExportOption{Export?}
    ExportOption -->|Yes| Export[Export to PDF/Excel]
    ExportOption -->|No| Display[Display Report]
    
    AuditLog1 --> Dashboard
    AuditLog2 --> Dashboard
    AuditLog3 --> Dashboard
    SaveClient --> Dashboard
    Display --> Dashboard
    Export --> Dashboard
```

### Data Flow Diagram (DFD)

This diagram shows how data flows through the GMera Solusi system:

```mermaid
flowchart LR
    subgraph External["External Entities"]
        User([User])
        Client([Client])
        AuthSystem([Supabase Auth])
    end
    
    subgraph Frontend["Frontend Layer (Next.js)"]
        UI[User Interface]
        AuthProvider[Auth Provider]
        StateManagement[Zustand Store]
    end
    
    subgraph DataAccessLayer["Data Access Layer"]
        InvoicesDB[Invoice Module]
        IncomeDB[Income Module]
        ExpenseDB[Expense Module]
        ClientsDB[Clients Module]
        DashboardDB[Dashboard Module]
        UsersDB[Users Module]
        CategoriesDB[Categories Module]
    end
    
    subgraph Database["Database (Supabase PostgreSQL)"]
        UsersTable[(users)]
        ClientsTable[(clients)]
        InvoicesTable[(invoices)]
        InvoiceItemsTable[(invoice_items)]
        IncomeTable[(income)]
        IncomeItemsTable[(income_items)]
        ExpenseTable[(expense)]
        ExpenseItemsTable[(expense_items)]
        CategoriesTable[(categories)]
        PaymentMethodsTable[(payment_methods)]
        AuditLogsTable[(audit_logs)]
    end
    
    User -->|Login Request| UI
    UI -->|Auth Request| AuthProvider
    AuthProvider -->|Validate| AuthSystem
    AuthSystem -->|User Session| AuthProvider
    AuthProvider -->|Store Auth State| StateManagement
    
    User -->|Create Invoice| UI
    UI -->|Invoice Data| InvoicesDB
    InvoicesDB -->|Insert Invoice| InvoicesTable
    InvoicesDB -->|Insert Items| InvoiceItemsTable
    InvoicesDB -->|Log Action| AuditLogsTable
    
    User -->|Record Income| UI
    UI -->|Income Data| IncomeDB
    IncomeDB -->|Insert Income| IncomeTable
    IncomeDB -->|Insert Items| IncomeItemsTable
    IncomeDB -->|Link Invoice| InvoicesTable
    IncomeDB -->|Log Action| AuditLogsTable
    
    User -->|Record Expense| UI
    UI -->|Expense Data| ExpenseDB
    ExpenseDB -->|Insert Expense| ExpenseTable
    ExpenseDB -->|Insert Items| ExpenseItemsTable
    ExpenseDB -->|Log Action| AuditLogsTable
    
    User -->|Manage Client| UI
    UI -->|Client Data| ClientsDB
    ClientsDB -->|CRUD Operations| ClientsTable
    ClientsDB -->|Log Action| AuditLogsTable
    
    User -->|View Dashboard| UI
    UI -->|Request Metrics| DashboardDB
    DashboardDB -->|Query Income| IncomeTable
    DashboardDB -->|Query Expense| ExpenseTable
    DashboardDB -->|Query Invoices| InvoicesTable
    DashboardDB -->|Aggregate Data| UI
    
    InvoicesTable -->|Reference| ClientsTable
    IncomeTable -->|Reference| CategoriesTable
    IncomeTable -->|Reference| PaymentMethodsTable
    ExpenseTable -->|Reference| CategoriesTable
    ExpenseTable -->|Reference| PaymentMethodsTable
    
    UI -->|Display to| User
    InvoicesTable -.->|Send Invoice| Client
    
    UsersDB -->|Manage Users| UsersTable
    CategoriesDB -->|Manage Categories| CategoriesTable
    
    style User fill:#e1f5ff
    style Client fill:#e1f5ff
    style AuthSystem fill:#fff4e1
    style UI fill:#f0f0f0
    style Database fill:#e8f5e9
```

### Data Flow Description

1. **Authentication Flow**: Users authenticate through Supabase Auth, and their session is managed by the Auth Provider and stored in Zustand state.

2. **Invoice Flow**: Users create invoices → Data sent to Invoice Module → Invoice and items saved to database → Audit log created → When marked as paid, income record auto-generated.

3. **Income/Expense Flow**: Users record transactions → Data sent to respective modules → Transaction and items saved → References to categories and payment methods maintained → Audit log created.

4. **Dashboard Flow**: Dashboard requests aggregated data → Dashboard module queries multiple tables (income, expense, invoices) → Data processed and returned → Charts and metrics displayed.

5. **Client Management**: CRUD operations on clients → Client data managed through Clients Module → Referenced by invoices for historical tracking.

6. **Audit Trail**: All critical operations (create, update, delete) are logged to audit_logs table with user information, old/new values, and timestamps.