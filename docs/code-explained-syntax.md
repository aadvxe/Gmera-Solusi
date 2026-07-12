# How The Code Itself Works — Reading Real Syntax From This Repo

The other file ([codebase-explained-simple.md](codebase-explained-simple.md)) explains **what each file is for**. This file explains **the actual code** — the symbols, the syntax, and most importantly **how one piece of code "calls" another piece of code**, using real snippets copy-pasted from this project.

---

## Part 0 — What does "calling" a function even mean?

Two different things happen in code, and people mix them up:

```ts
// 1) DEFINING a function — writing the recipe, nothing happens yet
function makeCoffee(sugar) {
  return "coffee with " + sugar + " sugar";
}

// 2) CALLING a function — actually using the recipe, right now
makeCoffee(2);   // ← this line is the "call". It runs the recipe with sugar = 2.
```

Nothing in `makeCoffee` runs when you write it. It only runs the moment something else writes `makeCoffee(2)` with parentheses. **Parentheses `()` after a name = "run this now."** No parentheses = you're just talking about the function, not running it.

Keep this in mind — the entire codebase is just thousands of small recipes (functions), sitting quietly until something calls them with `()`.

---

## Part 1 — How files call each other (`import` / `export`)

This is the single most important mechanic to understand. Open [`src/lib/db/income.ts`](src/lib/db/income.ts):

```ts
export async function createIncome(payload) {
  ...
}
```

The word **`export`** in front means: *"other files are allowed to borrow this."* Without `export`, this function would be trapped inside `income.ts` forever, invisible to everyone else.

Now open [`src/app/(dashboard)/pendapatan/tambah/page.tsx`](<src/app/(dashboard)/pendapatan/tambah/page.tsx>), near the top:

```ts
import { getClients, getCategories, getPaymentMethods, createIncome, getInvoicesByClient, Client, Category, PaymentMethod, Invoice } from "@/lib/db";
```

Read this sentence like English: *"Borrow `createIncome` (and these other things) from `@/lib/db`, and now I can use them in this file too."*

But wait — `createIncome` isn't actually written inside `@/lib/db` directly. Here's the trick. `@/lib/db` points at [`src/lib/db/index.ts`](src/lib/db/index.ts), which contains:

```ts
export * from './income';
export * from './clients';
export * from './categories';
```

`export * from './income'` means *"whatever `income.ts` exports, re-export all of it from here too."* So the chain is:

```
tambah/page.tsx  --imports from-->  @/lib/db (index.ts)  --re-exports from-->  income.ts  --defines-->  createIncome
```

**Baby language:** `index.ts` is a reception desk. You (the page) ask the receptionist for "createIncome." The receptionist doesn't do the work themselves — they just know which back-office (`income.ts`) actually has it, and hand it to you instantly. That's why it's called a **barrel file**: it "barrels together" many files' exports into one convenient doorway.

This exact pattern repeats for **every** function used in **every** page in this app. Once you can trace one `import { X } from "somewhere"` back to the `export function X` that defines it, you can trace all of them.

---

## Part 2 — Reading one real function, line by line

Here's the entire [`createIncome`](src/lib/db/income.ts) function, with a plain-English comment above every line:

```ts
// "async" means: this function is allowed to pause and wait for slow things (like the internet)
export async function createIncome(
  payload: Omit<Income, 'id' | 'created_at' | 'categories' | 'payment_methods'>
) {
  // Open a phone line to the database
  const supabase = createClient();

  // Send the data over, wait ("await") for the database to reply,
  // then immediately unpack the reply into two named boxes: "data" and "error"
  const { data, error } = await supabase.from('income').insert([payload]).select().single();

  // If nothing went wrong AND this income was tied to a specific invoice...
  if (!error && payload.invoice_id) {
    // ...also update that invoice's row to say "status: paid"
    await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', payload.invoice_id);
  }

  // Hand back whatever we got, so the caller (the page) knows if it worked
  return { data, error };
}
```

### Breaking down the weird punctuation

| Code | What it means in baby language |
|---|---|
| `async function createIncome(payload) { ... }` | "Here's a recipe named `createIncome`. It takes one ingredient called `payload`. It's allowed to pause mid-recipe." |
| `const { data, error } = await ...` | This is called **destructuring**. The database always replies with an object shaped like `{ data: ..., error: ... }`. Instead of writing `const result = await ...` then `result.data` and `result.error` separately, this line unpacks both boxes in one go. |
| `.from('income')` | "Go to the table named `income`" (like clicking a tab in a spreadsheet). |
| `.insert([payload])` | "Add this as one new row." The `[ ]` around `payload` means "a list containing one item" — you could insert many rows at once by putting more items in that list. |
| `.select().single()` | "After inserting, give me that new row back, and I only expect exactly one row, not a list." |
| `.eq('id', payload.invoice_id)` | "...WHERE `id` equals this specific invoice's id" — same idea as an Excel filter. |
| `if (!error && payload.invoice_id)` | The `!` means **NOT**. So this reads: "if there is NOT an error, AND there IS an `invoice_id`." Both must be true (`&&` means AND) to enter the `{ }` block below it. |
| `return { data, error };` | Hand back a box containing both results, so whoever called this function can check `result.error` to see if it worked. |

---

## Part 3 — How the button click actually triggers all this (the full chain, in code)

Let's trace **exactly** what runs, in order, when a user clicks "Simpan Data" on the Add Income form. Every snippet below is real code from this repo.

### Step 1 — The button is wired to a function

In [`tambah/page.tsx`](<src/app/(dashboard)/pendapatan/tambah/page.tsx>):

```tsx
<form className="space-y-8" onSubmit={handleSubmit}>
  ...
  <Button type="submit" disabled={loading}>Simpan Data</Button>
</form>
```

`onSubmit={handleSubmit}` means: *"when this form is submitted (button clicked), run the function called `handleSubmit`."* Notice there's **no parentheses** here — `handleSubmit` without `()` means "here's the recipe, don't run it yet, just remember it for later." React itself adds the `()` and calls it the moment you click.

### Step 2 — `handleSubmit` runs

```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();  // stop the browser's default "reload the page" behavior
  if (!amount || amount <= 0) return alert("Jumlah pendapatan harus lebih dari 0");
  if (!clientId && !notes) return alert("Pilih Customer atau tambahkan Catatan Sumber");

  setLoading(true);
  try {
    ...
    await createIncome({
      date,
      source: clientId ? clientName : notes.substring(0, 50),
      category_id: categoryId || null,
      amount: finalAmount,
      ...
    });

    toast.success("Pendapatan", { description: `...` });
    router.push('/pendapatan');
  } catch (error) {
    toast.error("Gagal menyimpan pendapatan");
  } finally {
    setLoading(false);
  }
};
```

This is a different way of writing a function: `const handleSubmit = async (e) => { ... }`. The `=>` is called an **arrow function** — it's just a shorter way to write `function handleSubmit(e) { ... }`. Same meaning, different spelling.

Reading it top to bottom:
- `if (!amount || amount <= 0) return ...` — the `||` means **OR**. "If amount is falsy, OR amount is zero-or-less, stop here and show an alert." `return` inside a function means "stop running the rest of this recipe right now."
- `try { ... } catch (error) { ... } finally { ... }` — "Attempt the risky stuff in `try`. If anything throws an error anywhere inside, jump straight to `catch` and handle it gracefully instead of crashing. Either way — success or failure — always run `finally` at the end" (here, that's turning the loading spinner back off).
- `clientId ? clientName : notes.substring(0, 50)` — this is a **ternary**, a compact if/else: *"IF `clientId` has a value, use `clientName`. OTHERWISE, use `notes` (cut to 50 characters)."* Read the `?` as "then" and the `:` as "otherwise."
- `categoryId || null` — "use `categoryId`, but if it's empty/falsy, use `null` instead."
- `await createIncome({...})` — **this is the call** that jumps over into [`income.ts`](src/lib/db/income.ts) from Part 2 above. Execution pauses here (`await`) until that function finishes and replies.

### Step 3 — Back in `income.ts`, then out to Supabase, then back again

As shown in Part 2: `createIncome` inserts the row, optionally updates a linked invoice, and returns `{ data, error }`.

### Step 4 — Control returns to `handleSubmit`

Because of `await`, the moment `createIncome(...)` finishes, `handleSubmit` picks up exactly where it left off:

```ts
toast.success("Pendapatan", { description: `...` });
router.push('/pendapatan');
```

`toast.success(...)` calls into the `sonner` library (imported at the top of the file) to pop up a green success banner. `router.push('/pendapatan')` calls Next.js's built-in navigation tool to send the browser to the income list page — without a full page reload.

**The full chain, start to finish:**

```
User clicks "Simpan Data"
  → React calls handleSubmit(e)                          [tambah/page.tsx]
    → calls createIncome({ ...payload })                 [imported from @/lib/db]
      → resolves through index.ts's "export * from './income'"
        → runs the real createIncome() function           [lib/db/income.ts]
          → supabase.from('income').insert(...)          [talks to the real database]
          → (maybe) supabase.from('invoices').update(...)
        ← returns { data, error }
    ← handleSubmit resumes after "await"
    → toast.success(...) shows a green popup
    → router.push('/pendapatan') changes the page
```

Every arrow (`→`) above is one function calling another. Every `←` is a function finishing and handing control back to whoever called it.

---

## Part 4 — Common syntax patterns you'll see everywhere in this repo

Once you recognize these ten patterns, you can read almost any file in the project.

### 1. `"use client"` at the very top of a file
```tsx
"use client";
```
This must be the **first line** of the file. It tells Next.js: *"this component needs to run in the user's browser (so it can react to clicks and remember things), not just on the server."* Files without this line are plain, non-interactive "Server Components."

### 2. `useState` — a sticky note the screen watches
```ts
const [amount, setAmount] = useState(0);
```
Read as: *"Create a sticky note called `amount`, starting at `0`. The only way to change what's on it is to call `setAmount(newValue)`."* The moment you call `setAmount`, the screen automatically redraws anything that displays `amount`.

### 3. `useEffect` — "do this automatically, don't wait for a click"
```ts
useEffect(() => {
  fetchData();
}, []);
```
The first part `() => { fetchData(); }` is the recipe to run. The `[]` at the end is the trigger list — an empty list `[]` means *"only run this once, right when the screen first appears."* If you put a value inside like `[clientId]`, it means *"re-run this every time `clientId` changes."* You can see this exact pattern in the same file:
```ts
useEffect(() => {
  const fetchClientInvoices = async () => { ... };
  fetchClientInvoices();
}, [clientId]);
```

### 4. Zustand stores — `create()`, then `useXStore()`
Defining the shared notebook, in [`authStore.ts`](src/store/authStore.ts):
```ts
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  setUser: (user) => set({ user }),
  ...
}));
```
`set({ user })` overwrites just that one field in the shared notebook. `get()` lets a function peek at the notebook's current contents.

Reading from the notebook, anywhere else in the app, e.g. in [`Navbar.tsx`](src/components/layout/Navbar.tsx):
```ts
const user = useAuthStore((state) => state.user);
```
This means: *"Watch the shared notebook, and give me just the `user` field. If `user` ever changes, redraw me automatically."*

### 5. Supabase query chains — reads like a sentence
```ts
const { data, error } = await supabase
  .from('income')
  .select('*, categories(name), payment_methods(name)')
  .order('date', { ascending: false })
  .limit(10);
```
Read left to right as one sentence: *"From the `income` table, select every column (`*`) plus the linked category name and payment method name, ordered by date newest-first, limited to 10 rows."* Each `.something()` narrows down the request further before it's actually sent — nothing happens until `await` at the very front actually fires it off.

### 6. `.map()`, `.filter()`, `.reduce()` — the three data-shufflers
These appear constantly in [`dashboard.ts`](src/lib/db/dashboard.ts) and page files. All three take a list and produce something new:

```ts
// .map() — turn each item into something else, same number of items out as in
const options = clients.map(c => ({ value: c.id, label: c.name }));

// .filter() — keep only the items that pass a test, fewer (or equal) items out
const unpaidOnly = invoices.filter(inv => inv.status !== 'paid');

// .reduce() — squash a whole list down into one single value (like a running total)
const total = data.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
```
For `.reduce()`, read it as: *"Start a running total (`sum`) at `0`. For every row, add that row's amount to the running total. At the end, give me the final total."*

### 7. Optional chaining `?.` and fallback `||`
```ts
user.user_metadata?.role || "viewer"
```
`?.` means *"if `user_metadata` doesn't exist, don't crash — just stop here and produce `undefined` instead of an error."* Then `|| "viewer"` means *"if that whole thing turned out empty/undefined, use `'viewer'` instead."* Together: *"try to read the user's role, but if anything along the way is missing, just default to `'viewer'`."*

### 8. The spread operator `...`
```ts
const enriched = {
  ...userObj,
  user_metadata: {
    ...userObj.user_metadata,
    role: userRole,
  },
};
```
`...userObj` means *"copy every field from `userObj` into this new object first."* Then anything written after it (like `user_metadata: {...}`) **overrides** just that one field. This is how the code "adds one new fact" to an object without having to manually retype every existing field.

### 9. Template literals — text with variables baked in
```ts
toast.success("Pendapatan", {
  description: `Berhasil dicatat: Rp ${finalAmount.toLocaleString('id-ID')} dari ${clientName}`
});
```
Backticks `` ` `` instead of quotes let you drop live variables directly into a sentence using `${...}`. Much easier to read than gluing strings together with `+`.

### 10. Dynamic route folders — `[id]`
The folder name [`(dashboard)/e-invoice/[id]/detail/page.tsx`](<src/app/(dashboard)/e-invoice/[id]/detail/page.tsx>) has square brackets. That means *this one file handles every possible invoice ID* — visiting `/e-invoice/abc123/detail` or `/e-invoice/xyz999/detail` both load this same file, and inside the file, Next.js hands you `abc123` or `xyz999` as a parameter you can use to fetch that specific invoice:
```ts
const invoice = await getInvoiceById(params.id);
```

---

## Part 5 — Tiny glossary of pure punctuation

| Symbol | Meaning |
|---|---|
| `()` after a name | "Call/run this now" (vs. just naming it) |
| `{ }` around variables, e.g. `const { data, error } = ...` | "Unpack these specific named fields out of the object" |
| `[ ]` around values, e.g. `[payload]` | "This is a list (array), even if it only has one item" |
| `=>` | Arrow function — a short way to write a function |
| `async` / `await` | "This function can pause" / "pause right here until this finishes" |
| `?.` | "Only continue if the thing on the left actually exists" |
| `||` | "OR" — use the right side only if the left side is empty/false |
| `&&` | "AND" — both sides must be true |
| `...` | Spread — "copy all the fields from this" |
| `` `${x}` `` | Template literal — insert a live variable into text |
| `!x` | "NOT x" — flips true/false |
| `?  :` | Ternary — compact if/else in one line |

---

## Cheat sheet: "I see this code, what is it doing?"

- See `"use client"` at the top → this file runs in the browser, can use clicks and state.
- See `useState` → a value the screen remembers and re-draws on change.
- See `useEffect` → something that runs automatically, not from a click.
- See `import { x } from "@/lib/db"` → go open `src/lib/db/index.ts`, find `export * from './wherever'`, then go find `export function x` in that file.
- See `.from('tablename')` → this line is talking to a specific database table.
- See `await` → "wait for the slow thing to finish before going to the next line."
- See `?.` or `||` → "handle the case where this value might not exist, without crashing."
