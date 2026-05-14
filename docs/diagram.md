# Diagram Sistem Pengelolaan Keuangan PT GMera Solusi

---

## ALUR FLOWCHART BISNIS

### 1. Flowchart Bisnis Pengelolaan Pendapatan Perusahaan Saat Ini

```mermaid
flowchart TD
    A([Mulai]) --> B["Customer melakukan pemesanan produk\nkepada PT GMera Solusi sesuai\nkebutuhan yang diinginkan"]
    B --> C["Admin keuangan menerima informasi pesanan\ndari customer kemudian melakukan\npengecekan detail pesanan dan harga produk"]
    C --> D["Admin keuangan membuat invoice pembayaran\nsebagai bukti transaksi dan dasar\npenagihan kepada customer"]
    D --> E["Invoice yang telah dibuat dikirimkan\nkepada customer untuk dilakukan\nproses pembayaran"]
    E --> F["Customer melakukan pembayaran sesuai\nnominal yang tercantum pada invoice,\nbaik secara penuh maupun bertahap"]
    F --> G["Admin keuangan meneruskan informasi\npesanan kepada supplier atau pihak ketiga\nyang memproduksi barang"]
    G --> H["Supplier memproses pembuatan pesanan\nkemudian melakukan pengiriman\nbarang kepada customer"]
    H --> I["Admin keuangan melakukan pencatatan\ntransaksi penjualan dan pembayaran\nke dalam Microsoft Excel"]
    I --> J["Data transaksi digunakan oleh admin\nkeuangan untuk menyusun laporan\npenjualan perusahaan secara berkala"]
    J --> K["Laporan penjualan diserahkan kepada\npemilik perusahaan untuk diperiksa\ndan diverifikasi"]
    K --> L([Proses pengelolaan penjualan\ndan pendapatan selesai])
```

### 2. Flowchart Bisnis Pengelolaan Pengeluaran Perusahaan Saat Ini

```mermaid
flowchart TD
    A([Mulai]) --> B["Admin keuangan menerima invoice\natau tagihan dari vendor, supplier,\nmaupun pihak ketiga"]
    B --> C["Admin keuangan melakukan pengecekan\nterhadap invoice atau bukti pembayaran\nuntuk memastikan kesesuaian nominal,\njenis pengeluaran, dan pihak penerima"]
    C --> D{"Data Sesuai?"}
    D -->|Ya| E["Admin keuangan melakukan proses\npembayaran kepada vendor atau\npihak terkait"]
    D -->|Tidak| B
    E --> F["Vendor atau pihak ketiga menerima\npembayaran dari perusahaan sebagai\npenyelesaian transaksi pengeluaran"]
    F --> G["Admin keuangan mencatat seluruh\ntransaksi pengeluaran ke dalam\nMicrosoft Excel"]
    G --> H["Data pengeluaran disimpan dan\ndikelompokkan berdasarkan jenis biaya\nuntuk mempermudah pengelolaan data"]
    H --> I["Admin keuangan menyusun laporan\npengeluaran perusahaan secara berkala\nberdasarkan data transaksi"]
    I --> J["Laporan pengeluaran diserahkan kepada\npemilik perusahaan untuk diperiksa\ndan diverifikasi"]
    J --> K([Proses pengelolaan\npengeluaran selesai])
```

### 3. Flowchart Bisnis Penerbitan Invoice Perusahaan Saat Ini (Manual)

```mermaid
flowchart TD
    A([Mulai]) --> B["Customer melakukan pemesanan\nproduk atau layanan kepada\nPT GMera Solusi"]
    B --> C["Admin keuangan menerima data transaksi\nkemudian menyiapkan invoice berdasarkan\ninformasi pesanan customer"]
    C --> D["Invoice dibuat secara manual\ndengan cara ditulis tangan sebagai\ndokumen penagihan"]
    D --> E["Invoice diberikan atau dikirimkan\nkepada customer sebagai dasar\nuntuk melakukan pembayaran"]
    E --> F["Customer menerima invoice dan\nmelakukan pembayaran sesuai\nnominal yang tercantum"]
    F --> G["Admin keuangan melakukan pencatatan\ndata invoice dan transaksi pembayaran\nke dalam Microsoft Excel"]
    G --> H["Invoice fisik disimpan sebagai\ndokumen arsip perusahaan untuk\nkebutuhan administrasi"]
    H --> I["Data invoice digunakan sebagai dasar\ndalam penyusunan laporan penjualan\ndan laporan keuangan perusahaan"]
    I --> J([Proses pembuatan dan\npengelolaan invoice selesai])
```

---

## USE CASE DIAGRAM

### Use Case Sistem Pengelolaan Keuangan PT GMera Solusi

> Berdasarkan codebase, sistem memiliki 5 role: `super_admin`, `finance_manager`, `accounting_staff`, `sales_staff`, dan `viewer`. Untuk penyederhanaan sesuai permintaan, dikelompokkan menjadi 3 aktor utama: **Super Admin**, **Finance (finance_manager & accounting_staff)**, dan **Viewer (viewer & sales_staff)**.

```mermaid
flowchart LR
    subgraph Sistem["Sistem Pengelolaan Keuangan PT GMera Solusi"]
        UC1["Login ke Sistem"]
        UC2["Melihat Dashboard"]
        UC3["Mengelola Pendapatan\n(Tambah, Edit, Hapus, Lihat)"]
        UC4["Mengelola Pengeluaran\n(Tambah, Edit, Hapus, Lihat)"]
        UC5["Membuat E-Invoice\n(Buat, Edit, Hapus, Lihat, Cetak PDF)"]
        UC6["Mengelola Data Klien\n(Tambah, Edit, Hapus, Lihat)"]
        UC7["Melihat & Ekspor Laporan\n(PDF, Excel)"]
        UC8["Mengelola Pengaturan Sistem\n(Profil Perusahaan, Pajak,\nMetode Pembayaran)"]
        UC9["Manajemen Pengguna\n(Tambah, Edit Role, Nonaktifkan)"]
        UC10["Mengelola Kategori Transaksi\n(Tambah, Edit, Hapus, Urutkan)"]
        UC11["Mengelola Profil Pribadi"]
        UC12["Pencarian Data"]
        UC13["Logout dari Sistem"]
    end

    SA(["🔑 Super Admin"])
    FIN(["💼 Finance\n(Finance Manager,\nAccounting Staff)"])
    VW(["👁️ Viewer\n(Viewer, Sales Staff)"])

    SA --- UC1
    SA --- UC2
    SA --- UC3
    SA --- UC4
    SA --- UC5
    SA --- UC6
    SA --- UC7
    SA --- UC8
    SA --- UC9
    SA --- UC10
    SA --- UC11
    SA --- UC12
    SA --- UC13

    FIN --- UC1
    FIN --- UC2
    FIN --- UC3
    FIN --- UC4
    FIN --- UC5
    FIN --- UC6
    FIN --- UC7
    FIN --- UC8
    FIN --- UC11
    FIN --- UC12
    FIN --- UC13

    VW --- UC1
    VW --- UC2
    VW --- UC3
    VW --- UC5
    VW --- UC6
    VW --- UC11
    VW --- UC12
    VW --- UC13
```

#### Keterangan Hak Akses per Role (Berdasarkan Sidebar.tsx & Pengaturan)

| Fitur | Super Admin | Finance Manager | Accounting Staff | Sales Staff | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard (Beranda) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pendapatan | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pengeluaran | ✅ | ✅ | ✅ | ❌ | ✅ |
| E-Invoice | ✅ | ✅ | ✅ | ✅ | ✅ |
| Laporan | ✅ | ✅ | ✅ | ❌ | ✅ |
| Klien | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pengaturan | ✅ | ✅ | ❌ | ❌ | ❌ |
| Profil | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## ACTIVITY DIAGRAM

### 1. Activity Diagram Login

```mermaid
flowchart TD
    A([Mulai]) --> B["Pengguna membuka halaman Login"]
    B --> C["Sistem menampilkan form login\n(Email & Password)"]
    C --> D["Pengguna memasukkan\nEmail dan Password"]
    D --> E["Pengguna menekan\ntombol 'Masuk'"]
    E --> F{"Sistem memvalidasi\nkredensial via\nSupabase Auth"}
    F -->|Gagal| G["Sistem menampilkan pesan error:\n'Email atau password salah'"]
    G --> D
    F -->|Berhasil| H["Sistem mengambil profil pengguna\ndari tabel users\n(role, nama, department)"]
    H --> I["Sistem menyimpan data user\ndan role ke AuthStore"]
    I --> J["Sistem memperbarui\nlast_login di database"]
    J --> K["Sistem mengarahkan pengguna\nke halaman Dashboard /beranda"]
    K --> L([Selesai])
```

### 2. Activity Diagram Dashboard

```mermaid
flowchart TD
    A([Mulai]) --> B["Pengguna berhasil login\ndan diarahkan ke /beranda"]
    B --> C["Sistem memuat data dashboard\nsecara paralel:\n- getDashboardSummary\n- getDashboardChartData\n- getTopClientsStats\n- getRecentActivities"]
    C --> D["Sistem menampilkan ucapan sapaan\nberdasarkan waktu\n(Pagi/Siang/Sore/Malam)"]
    D --> E["Sistem menampilkan Ringkasan Keuangan:\n- Pendapatan Bulan Ini\n- Pengeluaran Bulan Ini\n- Saldo/Laba Bersih\n- Jumlah Invoice Belum Bayar"]
    E --> F["Sistem menampilkan grafik:\n- Tren Arus Kas (Line Chart)\n- Perbandingan Arus Kas (Bar Chart)\n- Pertumbuhan Laba Bersih (Area Chart)\n- Status Invoice (Donut/Pie Chart)"]
    F --> G["Sistem menampilkan:\n- Tabel Klien Teratas\n- Timeline Aktivitas Terbaru"]
    G --> H["Pengguna dapat memantau\nkondisi keuangan perusahaan\nsecara real-time"]
    H --> I([Selesai])
```

### 3. Activity Diagram Pengelolaan Pendapatan

```mermaid
flowchart TD
    A([Mulai]) --> B["Pengguna mengakses\nmenu Pendapatan"]
    B --> C["Sistem menampilkan daftar\ndata pendapatan dari database\n(tabel income)"]
    C --> D{"Pilih Aksi"}
    D -->|Tambah Data| E["Pengguna klik 'Tambah Data'\nmenuju halaman /pendapatan/tambah"]
    E --> F["Pengguna mengisi form:\n- Tanggal transaksi\n- Klien/Sumber pendapatan\n- Kategori pendapatan\n- Jumlah nominal\n- No. Referensi\n- Metode pembayaran\n- Lampiran bukti (opsional)"]
    F --> G["Pengguna menekan\ntombol 'Simpan'"]
    G --> H{"Validasi\nData"}
    H -->|Tidak Valid| F
    H -->|Valid| I["Sistem menyimpan data ke\ntabel income di database"]
    I --> J{"Terkait\nInvoice?"}
    J -->|Ya| K["Sistem otomatis mengubah\nstatus invoice menjadi 'Paid'"]
    J -->|Tidak| L["Data pendapatan\nberhasil tersimpan"]
    K --> L
    L --> C

    D -->|Edit Data| M["Pengguna klik ikon Edit\npada baris data"]
    M --> N["Sistem menampilkan modal edit\ndengan data yang sudah terisi"]
    N --> O["Pengguna mengubah data\nyang diperlukan"]
    O --> P["Sistem memperbarui data\ndi tabel income"]
    P --> C

    D -->|Hapus Data| Q["Pengguna klik ikon Hapus\npada baris data"]
    Q --> R["Sistem menampilkan\nmodal konfirmasi hapus"]
    R --> S{"Konfirmasi?"}
    S -->|Tidak| C
    S -->|Ya| T["Sistem menghapus data\ndari tabel income"]
    T --> C

    D -->|Lihat Detail| U["Pengguna klik ikon Lihat\npada baris data"]
    U --> V["Sistem menampilkan modal detail\n(tanggal, referensi, sumber,\nkategori, status, jumlah, lampiran)"]
    V --> C

    D -->|Ekspor| W["Pengguna klik tombol\nEkspor Excel / PDF"]
    W --> X["Sistem mengekspor data\nke file Excel/PDF dan\nmencatat ke audit log"]
    X --> C

    C --> Y([Selesai])
```

### 4. Activity Diagram Pengelolaan Pengeluaran

```mermaid
flowchart TD
    A([Mulai]) --> B["Pengguna mengakses\nmenu Pengeluaran"]
    B --> C["Sistem menampilkan daftar\ndata pengeluaran dari database\n(tabel expense)"]
    C --> D{"Pilih Aksi"}
    D -->|Tambah Data| E["Pengguna klik 'Tambah Data'\nmenuju halaman /pengeluaran/tambah"]
    E --> F["Pengguna mengisi form:\n- Tanggal transaksi\n- Jenis pengeluaran\n- Kategori biaya\n- Jumlah nominal\n- No. Referensi\n- Metode pembayaran\n- Lampiran bukti (opsional)"]
    F --> G["Pengguna menekan\ntombol 'Simpan'"]
    G --> H{"Validasi\nData"}
    H -->|Tidak Valid| F
    H -->|Valid| I["Sistem menyimpan data ke\ntabel expense di database"]
    I --> C

    D -->|Edit Data| J["Pengguna klik ikon Edit\npada baris data"]
    J --> K["Sistem menampilkan modal edit\ndengan data yang sudah terisi"]
    K --> L["Pengguna mengubah data\nyang diperlukan"]
    L --> M["Sistem memperbarui data\ndi tabel expense"]
    M --> C

    D -->|Hapus Data| N["Pengguna klik ikon Hapus\npada baris data"]
    N --> O["Sistem menampilkan\nmodal konfirmasi hapus"]
    O --> P{"Konfirmasi?"}
    P -->|Tidak| C
    P -->|Ya| Q["Sistem menghapus data\ndari tabel expense"]
    Q --> C

    D -->|Lihat Detail| R["Pengguna klik ikon Lihat\npada baris data"]
    R --> S["Sistem menampilkan modal detail\npengeluaran lengkap"]
    S --> C

    D -->|Ekspor| T["Pengguna klik tombol\nEkspor Excel / PDF"]
    T --> U["Sistem mengekspor data\nke file Excel/PDF dan\nmencatat ke audit log"]
    U --> C

    C --> V([Selesai])
```

### 5. Activity Diagram Penerbitan E-Invoice

```mermaid
flowchart TD
    A([Mulai]) --> B["Pengguna mengakses\nmenu E-Invoice"]
    B --> C["Sistem menampilkan daftar\ninvoice dari database\n(tabel invoices)"]
    C --> D{"Pilih Aksi"}
    D -->|Buat Invoice Baru| E["Pengguna klik 'Buat Invoice'\nmenuju halaman /e-invoice/buat"]
    E --> F["Sistem generate nomor invoice\notomatis (INV-XXXXXX)"]
    F --> G["Pengguna mengisi informasi invoice:\n- No. Invoice & Tanggal Terbit\n- Pilih Klien dari database\n- Alamat penagihan (otomatis terisi)"]
    G --> H["Pengguna mengisi detail barang/jasa:\n- Deskripsi, Qty, Satuan, Harga\n- Dapat menambah/hapus baris item"]
    H --> I["Pengguna mengisi informasi pengiriman:\n- Metode pengiriman/kurir\n- Ongkos kirim, No. Resi\n- Alamat pengiriman"]
    I --> J["Sistem menghitung otomatis:\n- Subtotal\n- PPN (default 11%)\n- Diskon\n- Ongkos kirim\n- Grand Total"]
    J --> K["Pengguna menentukan:\n- Tanggal jatuh tempo\n- Catatan untuk klien\n- Lampiran bukti (opsional)"]
    K --> L["Pengguna menekan\ntombol 'Simpan Invoice'"]
    L --> M{"Validasi\nData"}
    M -->|Tidak Valid| G
    M -->|Valid| N["Sistem menyimpan invoice\nke tabel invoices"]
    N --> O["Sistem menyimpan item-item\nke tabel invoice_items"]
    O --> P["Sistem mencatat aktivitas\nke audit_logs"]
    P --> Q["Invoice berhasil dibuat\ndengan status 'Belum Bayar'"]
    Q --> C

    D -->|Lihat Detail| R["Pengguna klik invoice\nuntuk melihat detail /e-invoice/id"]
    R --> S["Sistem menampilkan detail invoice\nlengkap dengan item-item"]
    S --> C

    D -->|Cetak/Unduh PDF| T["Pengguna klik tombol\nCetak atau Unduh PDF"]
    T --> U["Sistem generate dokumen PDF\ninvoice dengan format profesional"]
    U --> C

    C --> V([Selesai])
```

### 6. Activity Diagram Pengelolaan Data Klien

```mermaid
flowchart TD
    A([Mulai]) --> B["Pengguna mengakses\nmenu Klien"]
    B --> C["Sistem menampilkan daftar\nklien aktif dari database\n(tabel clients, is_active = true)"]
    C --> D{"Pilih Aksi"}
    D -->|Tambah Klien Baru| E["Pengguna klik 'Tambah Klien'\nmenuju halaman /klien/tambah"]
    E --> F["Pengguna mengisi data klien:\n- Nama perusahaan/klien\n- Alamat, Kota, Provinsi, Kode Pos\n- No. Telepon, Email\n- NPWP\n- Catatan (opsional)"]
    F --> G["Pengguna menekan\ntombol 'Simpan'"]
    G --> H{"Validasi\nData"}
    H -->|Tidak Valid| F
    H -->|Valid| I["Sistem menyimpan data klien\nke tabel clients di database"]
    I --> C

    D -->|Edit Klien| J["Pengguna klik ikon Edit\npada baris klien"]
    J --> K["Sistem menampilkan halaman edit\n/klien/id dengan data terisi"]
    K --> L["Pengguna mengubah data\nklien yang diperlukan"]
    L --> M["Sistem memperbarui data\ndi tabel clients"]
    M --> C

    D -->|Hapus Klien| N["Pengguna klik ikon Hapus\npada baris klien"]
    N --> O["Sistem menampilkan\nmodal konfirmasi hapus"]
    O --> P{"Konfirmasi?"}
    P -->|Tidak| C
    P -->|Ya| Q["Sistem melakukan soft-delete\n(is_active = false)"]
    Q --> C

    D -->|Lihat Detail| R["Pengguna klik klien\nuntuk melihat detail"]
    R --> S["Sistem menampilkan detail klien\nbeserta statistik invoice:\n- Total invoice\n- Jumlah belum bayar\n- Total nilai transaksi"]
    S --> C

    C --> T([Selesai])
```

### 7. Activity Diagram Pengelolaan Laporan

```mermaid
flowchart TD
    A([Mulai]) --> B["Pengguna mengakses\nmenu Laporan"]
    B --> C["Sistem menampilkan halaman laporan\ndengan periode default\n(1 Januari - 31 Desember tahun berjalan)"]
    C --> D["Sistem memuat data secara paralel:\n- getFinancialReport (ringkasan)\n- getReportChartData (grafik)"]
    D --> E["Sistem menampilkan metrik ringkasan:\n- Total Pendapatan periode terpilih\n- Total Pengeluaran periode terpilih\n- Laba Bersih (Net Profit)"]
    E --> F["Sistem menampilkan grafik:\n- Tren Pendapatan (Line Chart)\n- Tren Pengeluaran (Line Chart)"]
    F --> G{"Pilih Aksi"}
    G -->|Ubah Periode| H["Pengguna memilih tanggal\nDari dan Sampai"]
    H --> I["Pengguna klik 'Terapkan'"]
    I --> D

    G -->|Ekspor PDF| J["Pengguna klik tombol\n'Export PDF'"]
    J --> K["Sistem generate laporan PDF\ndengan format akuntansi profesional\n(header perusahaan, tabel data,\ntotal, pagination)"]
    K --> L["Sistem mencatat aktivitas ekspor\nke tabel audit_logs"]
    L --> F

    G -->|Ekspor Excel| M["Pengguna klik tombol\n'Export Excel'"]
    M --> N["Sistem generate file Excel\ndengan format akuntansi\n(header, data, total, format angka)"]
    N --> O["Sistem mencatat aktivitas ekspor\nke tabel audit_logs"]
    O --> F

    F --> P([Selesai])
```

---

## Catatan Verifikasi Kesesuaian dengan Codebase

| Aspek | Deskripsi Bisnis | Implementasi Sistem | Status |
|---|---|---|:---:|
| Pencatatan Pendapatan | Dicatat manual di Excel | Disimpan di tabel `income` via Supabase | ✅ Sesuai |
| Pencatatan Pengeluaran | Dicatat manual di Excel | Disimpan di tabel `expense` via Supabase | ✅ Sesuai |
| Pembuatan Invoice | Ditulis tangan manual | E-Invoice digital via form `/e-invoice/buat` | ✅ Sesuai |
| Penyusunan Laporan | Disusun manual dari Excel | Otomatis via halaman `/laporan` + ekspor PDF/Excel | ✅ Sesuai |
| Penyimpanan Arsip | Invoice fisik disimpan manual | Tersimpan digital di database + attachment Supabase Storage | ✅ Sesuai |
| Verifikasi Pemilik | Laporan diserahkan manual | Dashboard real-time + role Viewer untuk monitoring | ✅ Sesuai |
| Role Pengguna | 3 aktor utama | 5 role: super_admin, finance_manager, accounting_staff, sales_staff, viewer | ✅ Sesuai |
| Kategori Transaksi | Dikelompokkan manual | Tabel `categories` dengan tipe income/expense | ✅ Sesuai |
| Metode Pembayaran | - | Tabel `payment_methods` (Transfer, Tunai, QRIS, dll.) | ✅ Sesuai |
| Audit Trail | Tidak ada | Tabel `audit_logs` mencatat semua aktivitas | ✅ Sesuai |
