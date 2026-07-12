# This Codebase, Explained Like You're New To Code

This document explains **every folder and file** in this project in the simplest language possible, then explains **how the files talk to each other**, then gives you a **dictionary** of every technical word used. Read it top to bottom — later sections build on earlier ones.

---

## Part 1 — The Big Picture (read this first)

Imagine this app is a **restaurant**.

- **The dining room** is what the customer (user) sees: the tables, the menu, the food on the plate. In code, this is `src/app/` — the actual screens you click around in.
- **The kitchen** is where the food (data) actually gets cooked and stored. In code, this is `src/lib/db/` — the functions that talk to the database.
- **The pantry / fridge** is where ingredients are kept in an organized way. This is the **database** (Supabase) — tables like `income`, `expense`, `invoices`.
- **The waiters** carry plates between the kitchen and the dining room. These are small reusable pieces like buttons, inputs, and modals — `src/components/ui/`.
- **The host at the door** checks if you have a reservation before letting you sit down. This is `middleware.ts` and the login system — it checks "are you logged in?" before showing you anything.
- **The manager's notebook** remembers who's currently seated and what role they have (waiter, chef, owner). This is `src/store/` — small pieces of memory shared across the whole app.

Every file in this project is one of those six things. Once you can point at a file and say "oh, that's the kitchen" or "that's a waiter," you understand the codebase.

---

## Part 2 — The Folder Map

```
Gmera-Solusi/
├── middleware.ts          → the doorman: checks login before every page
├── src/
│   ├── app/               → THE DINING ROOM (every screen/page you see)
│   ├── components/        → THE WAITERS (reusable visual pieces + page wrappers)
│   ├── lib/                → THE KITCHEN (talks to the database, formats data)
│   ├── store/              → THE MANAGER'S NOTEBOOK (shared memory: who's logged in)
│   └── utils/supabase/     → THE PHONE LINE to the database company (Supabase)
├── schema/                 → THE BLUEPRINT of the pantry (database table designs)
└── docs/                   → written notes about the project (like this file)
```

Now let's go folder by folder, file by file.

---

## Part 3 — Every File, Explained

### `middleware.ts` — the doorman

This file runs **before every single page loads**, invisibly, on the server. It does three things:

1. Checks your login cookie with Supabase (the database company).
2. If you're trying to open a page that needs login (like `/beranda`, the dashboard) and you're **not** logged in → it sends you to `/login` instead.
3. If you're **already** logged in and try to visit `/login` or `/` → it sends you straight to `/beranda` (no point showing you the login form twice).

**Baby language:** think of it as a bouncer standing in front of every door in the building, checking your wristband before you even reach for the doorknob.

**Talks to:** Supabase Auth (to check your wristband/cookie).

---

### `src/app/` — the dining room (every screen)

This is Next.js's special folder — every file named `page.tsx` inside here becomes a real URL in the browser.

| File | What it is in baby language |
|---|---|
| [layout.tsx](src/app/layout.tsx) | The outermost picture frame around the *entire* website — sets the font (Poppins), the language (Indonesian), and adds two invisible helpers: `Toaster` (pop-up success/error messages) and `Analytics` (usage tracking). Every single page sits inside this frame. |
| [page.tsx](src/app/page.tsx) | The address `/` (empty homepage). It does nothing except immediately push you to `/beranda`. Like an elevator that automatically goes to the lobby. |
| [login/page.tsx](src/app/login/page.tsx) | The login form. Type email + password, click submit, Supabase checks if you're real, then you land on `/beranda`. |
| `(dashboard)/layout.tsx` | The frame around every *logged-in* page — see next section, this is the important one. |
| `(dashboard)/beranda/page.tsx` | **The Dashboard.** Shows KPI number cards, charts, recent activity, unpaid invoice warnings, top customers. This is the "homepage after login." |
| `(dashboard)/pendapatan/page.tsx` | The **Income** list — a table of every money-in transaction, with filters and export buttons. |
| `(dashboard)/pendapatan/tambah/page.tsx` | The **"Add Income"** form. |
| `(dashboard)/pengeluaran/page.tsx` | The **Expense** list — same idea as income, but money going out. |
| `(dashboard)/pengeluaran/tambah/page.tsx` | The **"Add Expense"** form. |
| `(dashboard)/e-invoice/page.tsx` | The list of all invoices sent to customers, with status (paid/unpaid/overdue). |
| `(dashboard)/e-invoice/buat/page.tsx` | The **"Create Invoice"** form — pick a customer, add line items, tax, discount. |
| `(dashboard)/e-invoice/[id]/detail/page.tsx` | Shows **one specific invoice** nicely formatted for printing/PDF. The `[id]` in the folder name means "this works for any invoice ID" — like a mail-merge template. |
| `(dashboard)/e-invoice/[id]/edit/page.tsx` | Edit an existing invoice. |
| `(dashboard)/customer/page.tsx` | The customer list (contacts). |
| `(dashboard)/customer/tambah/page.tsx` | The "Add Customer" form. |
| `(dashboard)/customer/[id]/page.tsx` | One customer's detail page (currently shows placeholder/fake data — noted as unfinished in the README). |
| `(dashboard)/laporan/page.tsx` | The **Reports** page — pick a date range, see totals, export to Excel/PDF. |
| `(dashboard)/pengaturan/page.tsx` | **Settings** — company info, staff accounts, categories, tax rate, payment methods. |
| `(dashboard)/profil/page.tsx` | Your own profile page (the person currently logged in). |
| `(dashboard)/pencarian/page.tsx` | The full search results page. |

> **Why the parentheses `(dashboard)`?** In Next.js, a folder wrapped in `()` is invisible in the URL — it's purely for organizing files. So `(dashboard)/beranda/page.tsx` becomes the URL `/beranda`, not `/dashboard/beranda`.

---

### `src/app/(dashboard)/layout.tsx` — the "you must be logged in" frame

This is one of the most important files to understand. Every logged-in page (`beranda`, `pendapatan`, etc.) gets wrapped in this order, like nested boxes:

```
AuthProvider          (loads who you are)
  └─ AuthGate         (blocks the screen until login is confirmed)
      └─ SidebarProvider  (remembers if the side menu is open/closed)
          └─ Sidebar + Navbar + the actual page content
```

**Baby language:** picture Russian nesting dolls. You can't see the innermost doll (the actual page) until you open every doll around it. Each doll has one job: "check who you are," then "make sure you're allowed here," then "remember menu state," then finally show the page.

---

### `src/components/` — the waiters

#### Auth wrappers (the dolls from above)

| File | Baby explanation |
|---|---|
| [AuthProvider.tsx](src/components/AuthProvider.tsx) | The moment the app opens, this asks Supabase "who is logged in right now?" It then goes one step further and fetches your **role** (super_admin, viewer, etc.) and name from the `users` database table, and writes all of it into the shared notebook (`authStore`). It also keeps listening — if you get logged out elsewhere, or your session refreshes, it updates the notebook automatically. |
| [AuthGate.tsx](src/components/AuthGate.tsx) | Looks at the notebook (`authStore`). If it says "still checking," show a spinning loading circle. If it says "no user," send you to `/login`. Only once it says "yes, real user" does it let the actual page content appear. |

#### `src/components/layout/` — the frame around the dashboard

| File | Baby explanation |
|---|---|
| [Sidebar.tsx](src/components/layout/Sidebar.tsx) | The menu on the left (Dashboard, Pendapatan, Pengeluaran, etc.). It reads your **role** from the notebook and only shows menu items you're allowed to see (e.g., a `sales_staff` doesn't see "Pengeluaran"). Also has the Logout button. |
| [Navbar.tsx](src/components/layout/Navbar.tsx) | The bar at the top: search box, notification bell, your profile picture/name, logout. The bell subscribes to **live updates** from the database — if someone creates a new invoice anywhere in the company, your bell updates without you refreshing the page. |
| [SidebarContext.tsx](src/components/layout/SidebarContext.tsx) | A tiny shared switch that only stores one thing: "is the sidebar open or closed right now?" Both the Sidebar and the little hamburger button in the Navbar need to agree on this, so it lives in one shared place instead of being copied in both files. |

#### `src/components/dashboard/` — widgets just for the homepage

| File | Baby explanation |
|---|---|
| [FinancialChart.tsx](src/components/dashboard/FinancialChart.tsx) | Draws the income-vs-expense line/bar chart using the `recharts` library. |
| [MetricCard.tsx](src/components/dashboard/MetricCard.tsx) | The small colored boxes showing one number each — like "Total Bulan Ini: Rp 50.000.000." |
| [RecentTransactions.tsx](src/components/dashboard/RecentTransactions.tsx) | The little feed of "last 5 things that happened." |
| [UnpaidInvoices.tsx](src/components/dashboard/UnpaidInvoices.tsx) | The warning list of invoices customers haven't paid yet. |

#### `src/components/ui/` — generic reusable pieces (used everywhere)

Think of these as LEGO bricks. Nobody re-invents a button on every page — everyone imports the same `Button` brick.

| File | Baby explanation |
|---|---|
| [Button.tsx](src/components/ui/Button.tsx) | A styled clickable button, reused on every form. |
| [Input.tsx](src/components/ui/Input.tsx) | A styled text box for forms. |
| [CustomSelect.tsx](src/components/ui/CustomSelect.tsx) | A styled dropdown menu (pick a category, a customer, etc). |
| [CustomDatePicker.tsx](src/components/ui/CustomDatePicker.tsx) | A calendar pop-up for picking a date. |
| [Modal.tsx](src/components/ui/Modal.tsx) | A pop-up box that darkens the background — used for things like "see all notifications." |
| [ConfirmModal.tsx](src/components/ui/ConfirmModal.tsx) | A specific pop-up that asks "are you sure?" before something risky like deleting or logging out. |
| [Table.tsx](src/components/ui/Table.tsx) | The reusable striped data-table look used on income/expense/invoice list pages. |
| [Skeleton.tsx](src/components/ui/Skeleton.tsx) | The gray "shimmering placeholder boxes" you see for a split second while real data is still loading. |
| [Toaster.tsx](src/components/ui/Toaster.tsx) | The little pop-up banner in the corner that says "Saved successfully!" or "Something went wrong." |
| [SearchDropdown.tsx](src/components/ui/SearchDropdown.tsx) | The dropdown that appears under the search box in the Navbar, showing matching invoices/customers/pages as you type. |
| [ChartWrapper.tsx](src/components/ui/ChartWrapper.tsx) | A plain box that gives charts a consistent card-style border/padding. |

---

### `src/lib/` — the kitchen

This is where actual **logic** lives — talking to the database, doing calculations, formatting numbers.

#### `src/lib/db/` — one file per topic, all talking to the database

Every file here follows the exact same recipe: *open a connection → ask the database a question → hand back the answer (or an empty result if something went wrong, so the screen never crashes)*.

| File | What topic it owns | Example functions inside |
|---|---|---|
| [types.ts](src/lib/db/types.ts) | Defines **the shape** of every kind of data (no database calls here) | `Client`, `Invoice`, `Income`, `Expense`, `UserProfile`, `CompanyProfile` |
| [clients.ts](src/lib/db/clients.ts) | Customers | `getClients`, `insertClient`, `updateClient`, `deleteClient` (soft-delete: just marks inactive, doesn't erase) |
| [categories.ts](src/lib/db/categories.ts) | Income/expense categories + payment methods | `getCategories`, `createCategory`, `updateCategoryOrder`, `getPaymentMethods` |
| [income.ts](src/lib/db/income.ts) | Money coming in | `getIncome`, `getTotalIncome`, `createIncome` (also auto-marks a linked invoice as "paid"), `updateIncome`, `deleteIncome` |
| [expense.ts](src/lib/db/expense.ts) | Money going out | `getExpense`, `getTotalExpense`, `createExpense`, `updateExpense`, `deleteExpense` |
| [invoices.ts](src/lib/db/invoices.ts) | Invoices + their line items | `getInvoices`, `getInvoiceById`, `createInvoiceWithItems`, `updateInvoiceWithItems`, `checkAndUpdateOverdueInvoices` (auto-flags late invoices as "overdue") |
| [dashboard.ts](src/lib/db/dashboard.ts) | All the number-crunching for charts and KPIs | `getDashboardSummary`, `getDashboardChartData`, `getTopClientsStats`, `getTopProducts`, `getRecentActivities` |
| [search.ts](src/lib/db/search.ts) | The global search bar | `globalSearch` — searches invoices, clients, income, expense, and static page names all at once, filtered by your role |
| [users.ts](src/lib/db/users.ts) | Staff accounts, company profile, audit trail | `getCurrentUserProfile`, `getAllUsers`, `updateUserRole`, `getCompanyProfile`, `createAuditLog` |
| [index.ts](src/lib/db/index.ts) | A "front door" that re-exports everything from all the files above, so any page can just write `import { getIncome, getClients } from "@/lib/db"` instead of remembering which specific file each function lives in. |

**Baby language:** imagine 8 different chefs, each specializing in one dish (income-chef, expense-chef, invoice-chef...). `index.ts` is just the pass-through window where all their dishes get handed out together, so the waiter doesn't need to know which chef made what.

#### Other `src/lib/` files

| File | Baby explanation |
|---|---|
| [export.ts](src/lib/export.ts) | Turns a list of income/expense/report rows into a downloadable **Excel** or **PDF** file, styled with Indonesian currency/date formats. |
| [storage.ts](src/lib/storage.ts) | Uploads a file (like a receipt photo) to Supabase's file storage and hands back a public web link to it. |
| [utils.ts](src/lib/utils.ts) | Small helper tools used everywhere: `formatRupiah` (turns `50000` into `"50.000"`), `parseRupiah` (turns typed text back into a number), `formatCurrency` (adds the "Rp" symbol), `cn` (merges Tailwind CSS style names safely). |
| [supabase.ts](src/lib/supabase.ts) | An older/simple way of connecting to Supabase (mostly superseded by `src/utils/supabase/`). |

---

### `src/store/` — the manager's shared notebook

Built with a tool called **Zustand**. Both files create small pieces of memory that many different components can read and write, without having to pass information manually from parent to child to grandchild.

| File | Baby explanation |
|---|---|
| [authStore.ts](src/store/authStore.ts) | Remembers: who is logged in, what their role is, and whether we're still checking. Also has helper "recipes" like `getDisplayName()` (turn your account into a friendly name) and `getInitials()` (turn your name into 2-letter avatar initials). |
| [uiStore.ts](src/store/uiStore.ts) | An older, simpler memory just for "is the sidebar open?" (Mostly replaced by `SidebarContext.tsx` now.) |

---

### `src/utils/supabase/` — the phone lines to the database company

Two separate ways of "calling" Supabase, because the browser and the server need different phone lines:

| File | Baby explanation |
|---|---|
| [client.ts](src/utils/supabase/client.ts) | Used inside the **browser** (when you, the user, are clicking around). Creates one connection and reuses it, instead of dialing a fresh number every time. |
| [server.ts](src/utils/supabase/server.ts) | Used on the **server**, before a page is even sent to your browser — for example inside `middleware.ts`. It reads your login cookie directly from the incoming web request. |

**Baby language:** it's the difference between calling customer service from *your own phone* (client) versus the *store's landline behind the counter* (server) — different phones, same company on the other end.

---

### `schema/` — the blueprint of the pantry

These are `.sql` files — instructions that build the actual database tables. You don't run these while using the app; they're used once to set up (or restore) the database.

| File | Baby explanation |
|---|---|
| `schema-final.sql` | The clean, current blueprint for every table. |
| `db_dump.sql` | A full backup/snapshot of real captured data. |
| `security-hardening.sql` | Extra locks added to tables so random people can't read/edit data they shouldn't. |
| `create-users.sql`, `seed.sql`, `seed-final.sql` | Scripts that create a first admin account and fill tables with sample starter data. |

The actual tables built from these blueprints: `users`, `clients`, `categories`, `payment_methods`, `company_profile`, `invoices`, `invoice_items`, `income`, `income_items`, `expense`, `expense_items`, `audit_logs`, `couriers`.

**Baby language:** each table is one tab in a giant shared Excel workbook. `invoices` is one tab, `clients` is another tab, and they're linked by ID numbers the same way a spreadsheet formula might look up a row in another tab.

---

## Part 4 — How It All Connects: Following One Page Load

Let's trace exactly what happens when you type `gmerasolusi.com/pendapatan` into your browser and hit enter.

1. **The request leaves your browser** and hits the server first.
2. [`middleware.ts`](middleware.ts) intercepts it. It asks Supabase "does this cookie belong to a real logged-in person?" If no → redirect to `/login`. If yes → let it through.
3. Next.js loads [`src/app/layout.tsx`](src/app/layout.tsx) — the outermost frame (font, language, toast host).
4. Inside that, it loads [`src/app/(dashboard)/layout.tsx`](src/app/(dashboard)/layout.tsx) — which wraps everything in `AuthProvider` → `AuthGate` → `SidebarProvider` → `Sidebar` + `Navbar`.
5. [`AuthProvider.tsx`](src/components/AuthProvider.tsx) asks Supabase again (double-checking on the client side) and writes your user + role into [`authStore.ts`](src/store/authStore.ts).
6. [`AuthGate.tsx`](src/components/AuthGate.tsx) reads that same notebook — sees a real user — and finally lets the page content show.
7. [`Sidebar.tsx`](src/components/layout/Sidebar.tsx) reads your role from the notebook and decides which menu items to draw.
8. Finally, the actual page — [`(dashboard)/pendapatan/page.tsx`](<src/app/(dashboard)/pendapatan/page.tsx>) — runs. It calls `getIncome()` from [`src/lib/db/income.ts`](src/lib/db/income.ts).
9. `getIncome()` opens a connection via [`src/utils/supabase/client.ts`](src/utils/supabase/client.ts) and asks the database: *"give me every row from the `income` table."*
10. Supabase (the database company) looks in the actual `income` table (built from `schema/schema-final.sql`) and sends the rows back.
11. The page takes that list and draws it as a table on your screen, using the reusable [`Table.tsx`](src/components/ui/Table.tsx) LEGO brick.

That's the entire loop: **browser → doorman (middleware) → frames (layouts) → auth check → page → kitchen (lib/db) → phone line (utils/supabase) → database → back up the same chain → drawn on screen.**

Every single page in this app follows this exact same shape — only step 8 onward changes (which page, which `lib/db` file, which database table).

---

## Part 5 — Dictionary of Every Technical Term Used Here

| Term | Baby-language meaning |
|---|---|
| **Component** | One reusable chunk of screen + its behavior, saved as one file (e.g., `Button.tsx`, `Navbar.tsx`). Like a LEGO brick you can snap into different pages. |
| **Page** | A component that's special because Next.js turns it into a real URL automatically (any `page.tsx` file). |
| **Props** | Settings you hand to a component from outside, like passing arguments into a function. E.g. `<Button variant="outline">` — `variant` is a prop. |
| **State (`useState`)** | A value a component remembers, that automatically redraws the screen whenever it changes. Think "sticky note." |
| **Hook** | Any function starting with `use` (`useState`, `useEffect`, `useRouter`, `useAuthStore`) — a reusable piece of logic components can plug into. |
| **Effect (`useEffect`)** | Code that runs automatically when a screen appears, or when a specific value changes — not from a click. |
| **Context** | A way to share one piece of information (like "is the sidebar open") with many components at once, without manually passing it down through every layer in between. `SidebarContext.tsx` and Zustand stores both do this. |
| **Store (Zustand)** | A small shared notebook of information that any component in the app can read or update, from anywhere, without needing to be nested inside each other. |
| **`async` / `await`** | "Wait here for the answer before running the next line" — used whenever code has to fetch something that takes time (like asking a database a question) instead of freezing the whole app while waiting. |
| **API call / Query** | Asking an outside service (here: Supabase) to fetch, add, change, or delete some data. |
| **Database** | An organized digital filing cabinet that many people can safely read/write to at the same time. Here, it's Supabase's Postgres database. |
| **Table** | One "tab" inside the database — like one sheet in a spreadsheet (e.g., the `income` table, the `clients` table). |
| **Row** | One entry/record inside a table — one specific income transaction, one specific customer. |
| **Column** | One field every row has, like `amount`, `date`, `category_id`. |
| **`.insert()` / `.select()` / `.update()` / `.delete()`** | The four basic things you can do to a table: add a row, read rows, change a row, remove a row. |
| **Supabase** | The company/service providing the database, login system, file storage, and live-update feature — so this project doesn't need to build its own custom backend server. |
| **Supabase Auth** | The login/session part of Supabase — checks passwords, issues a "wristband" (cookie/token) that proves you're logged in. |
| **RLS (Row-Level Security)** | Rules set directly on the database saying "who is allowed to see/edit which rows." The README notes this project's rules are currently loose — the app mostly trusts the screen (UI) to hide things instead of the database enforcing it. |
| **Middleware** | Code that runs *before* a page is shown, for every request — used here to check login status. |
| **Route / Route protection** | A "route" is just a URL path (like `/pendapatan`). "Protected" means the doorman (middleware) requires login before letting you see it. |
| **Client Component vs Server Component** | A **Client Component** (marked `"use client"` at the top of a file) runs in the user's browser and can use clicks, state, and hooks. A **Server Component** runs on the server before anything is sent to you, and can't use clicks/state directly. Most interactive pages here (forms, dashboards) are Client Components. |
| **Realtime** | A Supabase feature where the app can "subscribe" to a table and get instantly notified the moment any row changes — used for the notification bell in the Navbar. |
| **Soft-delete** | Instead of actually erasing a row, just flip a flag like `is_active: false`, so the history is preserved but it disappears from active lists. |
| **Audit log** | A permanent record of "who did what and when" (create/update/delete), stored in the `audit_logs` table, shown in the recent-activity feed. |
| **JSX / TSX** | The HTML-looking code you see inside `return (...)` in component files — it's a special syntax that lets you write what-looks-like-HTML directly inside JavaScript/TypeScript. `.tsx` files use this; plain `.ts` files don't (they're logic-only, no screen drawing). |
| **TypeScript** | JavaScript with an extra safety net — you can declare the exact "shape" a piece of data must have (see `types.ts`), and the editor warns you if you try to use it wrong before you even run the code. |
| **Tailwind CSS** | A styling system where you write short class names directly in the markup (like `className="flex gap-4 rounded-xl"`) instead of writing separate CSS files. |
| **Barrel file** | A file (like `src/lib/db/index.ts`) whose only job is to re-export things from several other files, so everyone else can import from one convenient place. |

---

## Part 6 — Quick Cheat Sheet

If someone asks "where do I go to change X?" —

- **Change what a screen looks like** → `src/app/(dashboard)/<page>/page.tsx`
- **Change what happens when data is saved/loaded** → the matching file in `src/lib/db/`
- **Change a button/input/modal's look everywhere at once** → `src/components/ui/`
- **Change who can see what menu item** → `src/components/layout/Sidebar.tsx`
- **Change login rules / which pages need login** → `middleware.ts`
- **Change how numbers/currency are formatted** → `src/lib/utils.ts`
- **Change the actual database structure** → `schema/schema-final.sql` (then apply it in Supabase)
