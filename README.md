# Expense & Budget Visualizer

Aplikasi web pencatat pengeluaran pribadi berbasis **HTML/CSS/JavaScript murni** — tanpa framework, tanpa instalasi, langsung bisa dipakai di browser.

---

## Cara Membuka di Browser

1. Unduh atau clone seluruh file proyek ini.
2. Buka folder proyek, lalu **klik dua kali** file `index.html` — atau drag file tersebut ke jendela browser.
3. Aplikasi langsung berjalan. Tidak perlu server lokal, tidak perlu menginstal apapun.

---

## Fitur Utama

1. **Pencatatan transaksi** — masukkan nama transaksi, nominal, dan kategori (Food / Transport / Fun).
2. **Validasi form** — semua kolom wajib diisi; nominal harus antara 1 hingga 999.999.999.
3. **Daftar transaksi yang bisa digulir** — tampilkan semua transaksi dengan tombol hapus di setiap baris.
4. **Total pengeluaran otomatis** — diperbarui secara real-time dan ditampilkan dalam format Rupiah (Rp).
5. **Diagram lingkaran (Pie Chart)** — visualisasi pengeluaran per kategori menggunakan Chart.js.
6. **Pengurutan transaksi** — urutkan daftar berdasarkan nominal atau kategori.
7. **Batas pengeluaran (Spending Limit)** — set batas maksimal; total berubah warna merah jika terlampaui.
8. **Mode Terang/Gelap (Dark Mode)** — toggle tema tampilan kapan saja.

---

## Asumsi Total Pengeluaran

Karena aplikasi ini tidak memiliki konsep saldo awal atau pemasukan, nilai **"Total Pengeluaran"** yang ditampilkan adalah **jumlah kumulatif seluruh transaksi yang tercatat**.

Ini bukan saldo atau neraca keuangan — hanya total dari semua pengeluaran yang telah dimasukkan ke dalam aplikasi.

---

## Struktur File

```
expense-budget-visualizer/
├── index.html       # Halaman utama aplikasi
├── css/
│   └── style.css    # Seluruh styling + tema light/dark
├── js/
│   └── script.js    # Seluruh logika aplikasi
└── README.md        # Dokumentasi ini
```

---

## Teknologi yang Digunakan

| Teknologi | Keterangan |
|---|---|
| HTML5 | Struktur halaman |
| CSS3 | Styling dan tema light/dark |
| Vanilla JavaScript (ES6+) | Seluruh logika aplikasi |
| Chart.js v4.4.0 | Diagram lingkaran — dimuat via CDN, tidak perlu instalasi |
| Local Storage browser | Penyimpanan data transaksi secara lokal |

---

## Cara Mengecek Fitur Secara Manual

1. **Tambah transaksi** → cek total pengeluaran berubah dan pie chart muncul/diperbarui.
2. **Submit form kosong** → cek pesan validasi muncul di bawah kolom yang kosong.
3. **Set spending limit** → tambahkan transaksi hingga total melebihi batas → cek angka total berubah warna merah.
4. **Klik toggle Dark Mode** → cek semua warna tampilan berubah ke tema gelap/terang.
5. **Sort berdasarkan nominal** → cek urutan daftar transaksi berubah sesuai nilai.
6. **Reload halaman** → cek semua data transaksi masih ada (tersimpan di Local Storage).

---

## Cara Publish via GitHub Pages

**Langkah 1** — Buat repository baru di [github.com](https://github.com) dengan menekan tombol "New repository".

**Langkah 2** — Upload semua file: `index.html`, folder `css/`, dan folder `js/` ke repository tersebut.

**Langkah 3** — Buka **Settings** → **Pages** → bagian *Source*: pilih **"Deploy from a branch"** → Branch: `main` → Folder: `/ (root)`.

**Langkah 4** — Klik **Save**, lalu tunggu beberapa menit hingga proses deploy selesai.

**Langkah 5** — URL website akan muncul di halaman **Settings → Pages** dengan format:
```
https://username.github.io/nama-repo/
```
