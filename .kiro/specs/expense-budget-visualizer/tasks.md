# Implementation Plan: Expense & Budget Visualizer

## Overview

Implementasi aplikasi web satu halaman (SPA) berbasis HTML, CSS, dan Vanilla JavaScript murni yang memungkinkan pengguna mencatat, mengelola, dan memvisualisasikan pengeluaran pribadi. Arsitektur menggunakan stateful module tunggal dengan single source of truth di Local Storage, re-render penuh pada setiap perubahan state, dan tanpa dependensi runtime selain Chart.js via CDN.

## Tasks

- [x] 1. Scaffolding struktur proyek dan skeleton file
  - [x] 1.1 Buat file `index.html` dengan markup HTML lengkap
    - Buat struktur HTML semantik sesuai desain: `<header>`, `<main>` dengan section `#summary`, `#form-section`, `#spending-limit`, `#content`, dan `<footer>`
    - Tambahkan `<canvas id="pie-chart">` dan `<p id="chart-empty-msg">` di dalam `#chart-wrapper`
    - Muat Chart.js via CDN (`https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`) sebelum `js/script.js`
    - Tambahkan inline script anti-FOSC di dalam `<head>` yang membaca `localStorage.getItem('theme')` dan menerapkan kelas `dark-mode` ke `<body>` sebelum halaman dirender
    - Sertakan elemen `#sort-controls` di dalam `#transaction-list-wrapper` di atas `<ul id="transaction-list">`
    - _Requirements: 9.1, 8.5, 2.3_

  - [x] 1.2 Buat file `css/style.css` dengan skeleton variabel tema
    - Definisikan semua CSS custom properties untuk light mode di `:root` (12 variabel: `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-danger`, `--color-warning-bg`, `--color-warning-text`, `--color-exceeded-bg`, `--color-exceeded-text`, `--color-shadow`)
    - Definisikan overrides untuk dark mode di `body.dark-mode` dengan nilai yang sesuai
    - Tambahkan CSS reset dasar dan tipografi awal
    - _Requirements: 8.1, 8.3_

  - [x] 1.3 Buat file `js/script.js` dengan deklarasi state global dan konstanta
    - Deklarasikan variabel module-level: `let transactions = []`, `let spendingLimit = 0`, `let currentSort = 'newest'`, `let chartInstance = null`
    - Definisikan konstanta `const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun']`
    - Tambahkan event listener `DOMContentLoaded` sebagai entry point utama yang akan memanggil `loadAll()` lalu `renderAll()`
    - _Requirements: 1.2, 2.6, 5.2_

- [x] 2. Implementasi fungsi murni (pure functions)
  - [x] 2.1 Implementasi `formatRupiah(amount)`
    - Terima parameter `amount` bertipe number (integer non-negatif)
    - Kembalikan string dengan awalan `"Rp"`, pemisah ribuan menggunakan titik, dan tanpa angka desimal (contoh: `"Rp 50.000"`)
    - Gunakan `Intl.NumberFormat` atau manipulasi string untuk memformat angka
    - Ekspor fungsi agar dapat diuji secara terisolasi
    - _Requirements: 2.1, 3.1, 4.5, 9.4_

  - [x] 2.2 Implementasi `computeTotal(transactions)`
    - Terima array `Transaction[]` sebagai parameter
    - Kembalikan jumlah kumulatif semua nilai `amount` menggunakan `Array.prototype.reduce`
    - Kembalikan `0` untuk array kosong
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 2.3 Implementasi `validateForm(name, amount, category)`
    - Validasi nama: tidak boleh kosong/spasi saja dan maksimal 100 karakter
    - Validasi nominal: harus integer antara 1 dan 999.999.999 (inklusif), bukan NaN, bukan desimal
    - Validasi kategori: harus salah satu nilai dalam `DEFAULT_CATEGORIES`
    - Kembalikan objek `{ valid: boolean, errors: { name?, amount?, category? } }` sesuai skema di design
    - Ekspor fungsi agar dapat diuji secara terisolasi
    - _Requirements: 1.3, 1.4_

  - [x] 2.4 Implementasi `checkSpendingLimit(total, limit)`
    - Kembalikan `'normal'` jika `limit === 0` atau `total < 0.8 * limit`
    - Kembalikan `'warning'` jika `0.8 * limit <= total <= limit`
    - Kembalikan `'exceeded'` jika `total > limit`
    - Ekspor fungsi agar dapat diuji secara terisolasi
    - _Requirements: 7.4, 7.5, 7.6_

  - [x] 2.5 Implementasi `sortTransactions(transactions, criteria)`
    - Terima array transaksi dan string kriteria: `'newest' | 'oldest' | 'amount-desc' | 'amount-asc' | 'category-az'`
    - Kembalikan array baru yang diurutkan (jangan mutasi array asli) sesuai kriteria
    - `'newest'`: urutkan berdasarkan `timestamp` descending
    - `'oldest'`: urutkan berdasarkan `timestamp` ascending
    - `'amount-desc'`: urutkan berdasarkan `amount` descending
    - `'amount-asc'`: urutkan berdasarkan `amount` ascending
    - `'category-az'`: urutkan berdasarkan `category` secara alfabetis menggunakan `localeCompare`
    - Ekspor fungsi agar dapat diuji secara terisolasi
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 3. Implementasi lapisan Local Storage
  - [x] 3.1 Implementasi `loadAll(storage = window.localStorage)`
    - Muat `transactions` dari kunci `'transactions'` menggunakan `JSON.parse` di dalam `try/catch`; fallback ke `[]` jika gagal atau null
    - Muat `spendingLimit` dari kunci `'spendingLimit'`; fallback ke `0` jika tidak ada
    - Muat `theme` dari kunci `'theme'`; simpan ke variabel lokal untuk digunakan `applyTheme()`
    - Panggil `applyTheme(theme)` setelah memuat preferensi
    - Terima parameter `storage` (default `window.localStorage`) untuk memudahkan pengujian dengan mock
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x] 3.2 Implementasi `saveAll(storage = window.localStorage)`
    - Simpan `transactions`, `spendingLimit`, dan `theme` ke Local Storage menggunakan `JSON.stringify` di dalam `try/catch`
    - Lempar kembali `QuotaExceededError` agar dapat ditangkap oleh pemanggil (untuk rollback)
    - Terima parameter `storage` (default `window.localStorage`) untuk memudahkan pengujian dengan mock
    - _Requirements: 5.1, 1.6_

  - [x] 3.3 Implementasi `addTransaction(name, amount, category)`
    - Buat objek `Transaction` baru dengan `id = crypto.randomUUID()` (atau `Date.now().toString()` sebagai fallback), `timestamp = Date.now()`
    - Ambil snapshot `transactions` saat ini sebelum mutasi
    - Tambahkan transaksi baru ke array `transactions`
    - Panggil `saveAll()`; jika terjadi error, kembalikan state ke snapshot dan tampilkan banner error
    - Jika berhasil, panggil `renderAll()` lalu reset form ke state awal
    - _Requirements: 1.5, 1.6, 1.7, 5.1_

  - [x] 3.4 Implementasi `deleteTransaction(id)`
    - Ambil snapshot `transactions` saat ini sebelum mutasi
    - Filter array: `transactions = transactions.filter(tx => tx.id !== id)`
    - Panggil `saveAll()`; jika terjadi error, kembalikan state ke snapshot dan tampilkan banner error
    - Jika berhasil, panggil `renderAll()`
    - _Requirements: 2.5, 5.1_

- [x] 4. Checkpoint — Pastikan semua fungsi murni dan lapisan storage berfungsi
  - Verifikasi `formatRupiah`, `computeTotal`, `validateForm`, `checkSpendingLimit`, `sortTransactions` dapat dipanggil dari console browser tanpa error
  - Verifikasi `addTransaction` menyimpan data ke Local Storage dan `loadAll` memuat kembali dengan benar
  - Pastikan semua pertanyaan atau kendala ditanyakan ke pengguna sebelum melanjutkan

- [x] 5. Implementasi komponen UI inti
  - [x] 5.1 Implementasi `renderSummary(total, status, spendingLimit)`
    - Tampilkan `Total_Pengeluaran` di elemen `#summary` dalam format Rupiah menggunakan `formatRupiah(total)`
    - Terapkan atau hapus kelas `status-warning` dan `status-exceeded` pada elemen `#summary` berdasarkan nilai `status`
    - Tampilkan teks peringatan inline saat status `'warning'` atau `'exceeded'`
    - Tampilkan nilai `spendingLimit` yang aktif jika bukan `0`
    - _Requirements: 3.1, 3.2, 7.4, 7.5, 7.6_

  - [x] 5.2 Implementasi handler submit form dan tampilan error inline
    - Pasang event listener `submit` pada elemen `<form>` di `#form-section`
    - Panggil `validateForm()` dengan nilai dari kolom nama, nominal, dan kategori
    - Jika tidak valid: tampilkan pesan error di bawah masing-masing kolom yang bermasalah (elemen inline per field)
    - Jika valid: hapus semua pesan error dan panggil `addTransaction()`
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [x] 5.3 Implementasi `renderTransactionList(transactions, currentSort)`
    - Render ulang `<ul id="transaction-list">` dengan item `<li>` untuk setiap transaksi
    - Setiap item menampilkan nama, nominal (via `formatRupiah`), kategori, dan tombol hapus dengan atribut `data-id`
    - Tampilkan pesan kosong jika array `transactions` kosong
    - Gunakan event delegation: pasang satu event listener `click` pada `<ul>` untuk menangani klik tombol hapus (baca `data-id` dari target), lalu panggil `deleteTransaction(id)`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 5.4 Implementasi `renderAll()`
    - Panggil `sortTransactions(transactions, currentSort)` untuk mendapatkan array terurut
    - Hitung `total = computeTotal(transactions)`
    - Hitung `status = checkSpendingLimit(total, spendingLimit)`
    - Panggil berurutan: `renderSummary(total, status, spendingLimit)`, `renderTransactionList(sorted, currentSort)`, `renderChart(transactions)`, `renderSpendingLimitInput(spendingLimit)`, `updateThemeToggleButton()`
    - _Requirements: 3.3, 3.4, 2.5, 4.2_

- [x] 6. Implementasi Chart.js
  - [x] 6.1 Implementasi `renderChart(transactions)`
    - Sembunyikan `<canvas id="pie-chart">` dan tampilkan `<p id="chart-empty-msg">` jika `transactions.length === 0`; hancurkan `chartInstance` yang ada menggunakan `chartInstance.destroy()`
    - Hitung total per kategori menggunakan loop: `categoryTotals = {}` → akumulasi `amount` per `category`
    - Gunakan `CATEGORY_COLORS` (`Food: '#4dabf7'`, `Transport: '#69db7c'`, `Fun: '#ffa94d'`) sebagai palet warna; fallback ke `'#adb5bd'` untuk kategori lain
    - Jika `chartInstance` sudah ada: perbarui `chartInstance.data.labels`, `data`, dan `backgroundColor`, lalu panggil `chartInstance.update()` (update-in-place)
    - Jika `chartInstance` belum ada: buat instance baru `new Chart(canvas, config)` dengan tipe `'pie'`
    - Konfigurasikan legenda untuk menampilkan `"Kategori: Rp X.XXX"` menggunakan `generateLabels` custom
    - Konfigurasikan tooltip untuk menampilkan format Rupiah menggunakan `formatRupiah`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Checkpoint — Pastikan form, daftar transaksi, dan chart berfungsi terintegrasi
  - Tambah beberapa transaksi dari form, verifikasi daftar dan pie chart diperbarui
  - Hapus transaksi, verifikasi total dan chart ikut diperbarui
  - Pastikan semua pertanyaan atau kendala ditanyakan ke pengguna sebelum melanjutkan

- [x] 8. Implementasi fitur tambahan
  - [x] 8.1 Implementasi kontrol pengurutan (`#sort-controls`)
    - Render tombol atau dropdown pilihan urutan di `#sort-controls` untuk: `'newest'`, `'oldest'`, `'amount-desc'`, `'amount-asc'`, `'category-az'`
    - Pasang event listener pada kontrol; saat dipilih, perbarui `currentSort` dan panggil `renderAll()`
    - Tandai opsi aktif secara visual (misalnya kelas `active` pada tombol terpilih)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 8.2 Implementasi `renderSpendingLimitInput(spendingLimit)` dan handler simpan spending limit
    - Render nilai `spendingLimit` saat ini di kolom input `#spending-limit`
    - Implementasi `saveSpendingLimit(value)`: validasi bahwa value adalah integer antara 1–999.999.999; jika kosong/dihapus, set ke `0` dan hapus dari Local Storage
    - Jika tidak valid: tampilkan pesan validasi inline, jangan simpan
    - Jika valid: perbarui `spendingLimit`, panggil `saveAll()`, panggil `renderAll()`
    - _Requirements: 7.1, 7.2, 7.3, 7.7_

  - [x] 8.3 Implementasi `toggleTheme()`, `applyTheme(theme)`, dan `updateThemeToggleButton()`
    - `applyTheme(theme)`: tambahkan atau hapus kelas `dark-mode` dari `document.body` berdasarkan nilai `theme`
    - `toggleTheme()`: baca state tema saat ini dari `document.body.classList`, balik nilainya, simpan ke `theme` in-memory, panggil `saveAll()`, panggil `applyTheme()`
    - `updateThemeToggleButton()`: perbarui teks/ikon tombol toggle agar mencerminkan mode aktif (misalnya "🌙 Dark Mode" atau "☀️ Light Mode")
    - Pasang event listener `click` pada tombol toggle di `<header>`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 9. Implementasi CSS lengkap dan responsif
  - [x] 9.1 Implementasi layout grid dan responsivitas
    - Implementasi `#content` dengan `display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem` untuk layar ≥768px
    - Tambahkan media query `@media (max-width: 767px)` yang mengubah `#content` menjadi `grid-template-columns: 1fr`
    - Styling `<header>` dengan flexbox untuk menempatkan judul dan tombol toggle berdampingan
    - _Requirements: 9.2, 9.3_

  - [x] 9.2 Implementasi styling komponen utama
    - Styling `#summary` dengan padding, background dari `var(--color-surface)`, dan border-radius
    - Styling `#form-section`: layout kolom input, tombol simpan dengan warna `var(--color-primary)`
    - Styling `<ul id="transaction-list">`: list-style none, `overflow-y: auto`, max-height agar dapat digulir
    - Styling item transaksi `<li>`: flexbox untuk menempatkan nama, nominal, kategori, dan tombol hapus
    - Styling `#sort-controls`: flexbox dengan tombol urutan dan indikator aktif
    - Styling `#chart-wrapper`: memastikan `<canvas>` dan `<p id="chart-empty-msg">` tampil/sembunyi dengan benar
    - _Requirements: 2.3, 9.1, 9.4_

  - [x] 9.3 Implementasi kelas status spending limit dan pesan error inline
    - Tambahkan `#summary.status-warning` dengan `background-color: var(--color-warning-bg)`, `color: var(--color-warning-text)`, `border-left: 4px solid #ffc107`
    - Tambahkan `#summary.status-exceeded` dengan `background-color: var(--color-exceeded-bg)`, `color: var(--color-exceeded-text)`, `border-left: 4px solid #dc3545`
    - Styling elemen pesan error inline di bawah kolom form dengan warna `var(--color-danger)` dan ukuran font kecil
    - Styling banner error penyimpanan (Local Storage penuh/tidak tersedia) di atas halaman
    - _Requirements: 7.4, 7.5, 1.4, 1.6_

- [x] 10. Checkpoint — Pastikan tampilan responsif dan tema dark/light berfungsi
  - Verifikasi layout dua kolom di desktop dan satu kolom di mobile (resize browser)
  - Verifikasi toggle dark mode mengubah semua warna komponen tanpa reload
  - Verifikasi kelas `status-warning` dan `status-exceeded` diterapkan dengan benar
  - Pastikan semua pertanyaan atau kendala ditanyakan ke pengguna sebelum melanjutkan

- [x] 11. Pembuatan README.md
  - [x] 11.1 Buat file `README.md` di root direktori proyek
    - Tulis bagian "Cara Membuka di Browser": instruksi buka `index.html` langsung di browser (tidak perlu server)
    - Tulis bagian "Fitur Utama": daftar singkat fitur (pencatatan transaksi, visualisasi pie chart, spending limit, dark mode, pengurutan)
    - Tulis bagian "Asumsi Total Pengeluaran": jelaskan bahwa nilai Total Pengeluaran adalah jumlah kumulatif seluruh transaksi yang tercatat, bukan saldo; tidak ada konsep saldo awal
    - Tulis bagian "Struktur File": tampilkan pohon direktori (`index.html`, `css/style.css`, `js/script.js`, `README.md`) beserta deskripsi singkat masing-masing
    - Tulis bagian "Teknologi": HTML, CSS, Vanilla JavaScript, Chart.js (CDN)
    - _Requirements: 9.1_

- [x] 12. Checkpoint akhir — Verifikasi integrasi menyeluruh
  - Muat ulang halaman dan verifikasi semua data dimuat dari Local Storage dengan benar
  - Verifikasi anti-FOSC: dark mode diterapkan sebelum konten terlihat saat reload
  - Verifikasi semua state disimpan: transaksi, spending limit, dan preferensi tema
  - Pastikan semua pertanyaan atau kendala ditanyakan ke pengguna sebelum melanjutkan

## Notes

- Tidak ada task pengujian otomatis; semua verifikasi dilakukan secara manual via browser
- Setiap fungsi murni (`formatRupiah`, `computeTotal`, `validateForm`, `checkSpendingLimit`, `sortTransactions`) harus dapat dipanggil secara terisolasi dari console browser
- `loadAll` dan `saveAll` menerima parameter `storage` (default `window.localStorage`) untuk memudahkan pengujian manual dengan mock object
- Gunakan pola rollback state: snapshot → mutasi → saveAll → jika error kembalikan snapshot
- Anti-FOSC diimplementasikan dengan inline script di `<head>` yang berjalan sebelum render pertama
- Chart.js menggunakan strategi update-in-place (`chartInstance.update()`) untuk performa; `destroy()` hanya dipanggil saat daftar transaksi menjadi kosong

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 5, "tasks": ["5.4", "6.1"] },
    { "id": 6, "tasks": ["8.1", "8.2", "8.3"] },
    { "id": 7, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 8, "tasks": ["11.1"] }
  ]
}
```
