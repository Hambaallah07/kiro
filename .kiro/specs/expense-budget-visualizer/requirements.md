# Requirements Document

## Introduction

Expense & Budget Visualizer adalah aplikasi web satu halaman (single-page) berbasis HTML, CSS, dan Vanilla JavaScript untuk membantu pengguna mencatat, mengelola, dan memvisualisasikan pengeluaran pribadi. Aplikasi ini ditujukan untuk pemula dalam Coding Camp dan tidak memerlukan backend maupun framework JavaScript. Semua data disimpan di Local Storage browser sehingga data tetap tersedia setelah halaman dimuat ulang.

**Asumsi penting:** Karena tidak ada konsep saldo awal dalam aplikasi ini, nilai "Total Pengeluaran" yang ditampilkan merupakan jumlah kumulatif seluruh transaksi yang tercatat. Penjelasan asumsi ini wajib dicantumkan di README proyek.

**Tumpukan teknologi:**
- HTML, CSS, dan Vanilla JavaScript (tanpa framework)
- Chart.js dimuat via CDN untuk diagram lingkaran
- Satu file CSS: `css/style.css`
- Satu file JavaScript: `js/script.js`
- Halaman utama: `index.html`

---

## Glossary

- **Aplikasi**: Aplikasi web Expense & Budget Visualizer yang berjalan di browser.
- **Pengguna**: Orang yang mengakses dan menggunakan Aplikasi melalui browser.
- **Transaksi**: Satu catatan pengeluaran yang terdiri dari nama, nominal, dan kategori.
- **Daftar_Transaksi**: Komponen antarmuka yang menampilkan seluruh Transaksi yang tersimpan.
- **Form_Input**: Komponen antarmuka berisi kolom nama, nominal, dan kategori untuk mencatat Transaksi baru.
- **Total_Pengeluaran**: Jumlah kumulatif seluruh nominal Transaksi yang tersimpan.
- **Pie_Chart**: Diagram lingkaran yang menampilkan proporsi pengeluaran per kategori menggunakan Chart.js.
- **Kategori**: Kelompok pengeluaran; nilai default adalah Food, Transport, dan Fun.
- **Spending_Limit**: Nilai batas pengeluaran maksimal yang ditetapkan oleh Pengguna.
- **Local_Storage**: Mekanisme penyimpanan data di browser yang digunakan untuk menyimpan seluruh data Aplikasi.
- **Dark_Mode**: Tema tampilan gelap yang dapat diaktifkan atau dinonaktifkan oleh Pengguna.
- **Validator**: Komponen logika yang memeriksa kebenaran isian Form_Input sebelum data disimpan.

---

## Requirements

### Requirement 1: Pencatatan Transaksi Baru

**User Story:** Sebagai Pengguna, saya ingin mengisi formulir untuk mencatat pengeluaran baru, sehingga saya dapat menyimpan data transaksi dengan mudah.

#### Acceptance Criteria

1. THE Form_Input SHALL menampilkan kolom teks untuk nama transaksi dengan panjang maksimal 100 karakter, kolom angka untuk nominal, dan kolom pilihan (dropdown) untuk kategori dengan opsi placeholder tidak terpilih sebagai status awal.
2. THE Form_Input SHALL menyediakan pilihan kategori default: Food, Transport, dan Fun.
3. WHEN Pengguna menekan tombol simpan pada Form_Input, THE Validator SHALL memeriksa bahwa kolom nama tidak kosong, kolom nominal berisi angka antara 1 hingga 999.999.999, dan kolom kategori telah dipilih.
4. IF salah satu kolom pada Form_Input tidak memenuhi syarat validasi, THEN THE Validator SHALL menampilkan pesan kesalahan yang menyebutkan kolom yang bermasalah dan syarat yang dilanggar di bawah kolom tersebut tanpa menyimpan data.
5. WHEN semua kolom pada Form_Input lolos validasi, THE Aplikasi SHALL menyimpan Transaksi baru ke Local_Storage dan menambahkannya ke Daftar_Transaksi dalam waktu kurang dari 1 detik tanpa memuat ulang halaman.
6. IF Local_Storage tidak tersedia atau penuh saat Transaksi akan disimpan, THEN THE Aplikasi SHALL menampilkan pesan kesalahan yang mengindikasikan kegagalan penyimpanan dan tidak mengubah Daftar_Transaksi.
7. WHEN Transaksi baru berhasil disimpan, THE Form_Input SHALL mengosongkan kolom nama, mengatur kolom nominal menjadi kosong, dan mengembalikan kolom kategori ke status placeholder tidak terpilih.

---

### Requirement 2: Tampilan Daftar Transaksi

**User Story:** Sebagai Pengguna, saya ingin melihat seluruh transaksi yang telah saya catat dalam satu daftar yang bisa digulir, sehingga saya dapat memantau riwayat pengeluaran saya.

#### Acceptance Criteria

1. THE Daftar_Transaksi SHALL menampilkan nama, nominal dalam format Rupiah (IDR) dengan awalan "Rp" dan pemisah ribuan menggunakan titik (contoh: Rp10.000), serta kategori untuk setiap Transaksi yang tersimpan.
2. IF tidak ada Transaksi yang tersimpan, THEN THE Daftar_Transaksi SHALL menampilkan pesan yang menyatakan bahwa belum ada transaksi dan mengajak Pengguna untuk menambahkan pengeluaran pertama.
3. WHEN jumlah Transaksi melebihi tinggi area daftar, THE Daftar_Transaksi SHALL dapat digulir secara vertikal tanpa mengubah tata letak halaman lainnya.
4. THE Daftar_Transaksi SHALL menampilkan tombol hapus pada setiap item Transaksi.
5. WHEN Pengguna menekan tombol hapus pada suatu item, THE Aplikasi SHALL menghapus Transaksi tersebut dari Local_Storage dan memperbarui Daftar_Transaksi, Total_Pengeluaran, dan Pie_Chart dalam waktu tidak lebih dari 300 milidetik tanpa memuat ulang halaman.
6. THE Daftar_Transaksi SHALL menampilkan Transaksi diurutkan berdasarkan waktu pencatatan dari yang paling baru ke yang paling lama secara default.

---

### Requirement 3: Total Pengeluaran

**User Story:** Sebagai Pengguna, saya ingin melihat total seluruh pengeluaran saya di bagian atas halaman, sehingga saya dapat mengetahui jumlah keseluruhan yang telah saya keluarkan.

#### Acceptance Criteria

1. THE Aplikasi SHALL menampilkan Total_Pengeluaran di bagian paling atas halaman dalam format Rupiah dengan awalan "Rp" dan pemisah ribuan menggunakan titik (contoh: Rp 150.000).
2. IF tidak ada Transaksi yang tersimpan, THEN THE Aplikasi SHALL menampilkan Total_Pengeluaran sebagai Rp 0.
3. WHEN sebuah Transaksi baru ditambahkan, THE Aplikasi SHALL memperbarui nilai Total_Pengeluaran dalam waktu kurang dari 1 detik dengan menambahkan nominal Transaksi tersebut.
4. WHEN sebuah Transaksi dihapus, THE Aplikasi SHALL memperbarui nilai Total_Pengeluaran dalam waktu kurang dari 1 detik dengan mengurangi nominal Transaksi yang dihapus.

---

### Requirement 4: Visualisasi Diagram Lingkaran

**User Story:** Sebagai Pengguna, saya ingin melihat diagram lingkaran proporsi pengeluaran per kategori, sehingga saya dapat memahami pola pengeluaran saya secara visual.

#### Acceptance Criteria

1. THE Pie_Chart SHALL menampilkan proporsi pengeluaran untuk setiap Kategori yang memiliki minimal satu Transaksi, menggunakan library Chart.js yang dimuat via CDN.
2. WHEN sebuah Transaksi baru ditambahkan atau dihapus, THE Pie_Chart SHALL diperbarui dalam waktu kurang dari 1 detik untuk mencerminkan data terkini.
3. IF tidak ada Transaksi yang tersimpan, THEN THE Pie_Chart SHALL disembunyikan dan digantikan dengan pesan teks yang menginformasikan bahwa belum ada data untuk ditampilkan.
4. WHEN semua Transaksi dari suatu Kategori dihapus, THE Pie_Chart SHALL menghapus irisan kategori tersebut dari diagram secara langsung.
5. THE Pie_Chart SHALL menampilkan legenda yang menunjukkan nama kategori dan total nominal per kategori dalam format Rupiah (IDR) dengan pemisah ribuan menggunakan titik.

---

### Requirement 5: Persistensi Data dengan Local Storage

**User Story:** Sebagai Pengguna, saya ingin data pengeluaran saya tetap tersimpan setelah saya menutup atau memuat ulang halaman, sehingga saya tidak perlu memasukkan ulang semua data.

#### Acceptance Criteria

1. WHEN sebuah Transaksi ditambahkan atau dihapus, THE Aplikasi SHALL segera menyimpan seluruh daftar Transaksi terkini ke Local_Storage sebelum memperbarui antarmuka.
2. WHEN Pengguna memuat ulang halaman, THE Aplikasi SHALL memuat seluruh Transaksi dari Local_Storage dan menampilkannya kembali di Daftar_Transaksi.
3. IF data Transaksi di Local_Storage rusak atau tidak dapat diparsing, THEN THE Aplikasi SHALL memulai dengan daftar Transaksi kosong tanpa menampilkan pesan error teknis kepada Pengguna.
4. WHEN Pengguna memuat ulang halaman, THE Aplikasi SHALL memuat nilai Spending_Limit dari Local_Storage; IF tidak ada nilai tersimpan, THEN nilai Spending_Limit SHALL diinisialisasi sebagai Rp 0 (tidak aktif).
5. WHEN Pengguna memuat ulang halaman, THE Aplikasi SHALL memuat preferensi Dark_Mode dari Local_Storage dan menerapkan tema yang sesuai sebelum halaman selesai dirender.

---

### Requirement 6: Pengurutan Daftar Transaksi

**User Story:** Sebagai Pengguna, saya ingin mengurutkan daftar transaksi berdasarkan nominal atau kategori, sehingga saya dapat menemukan dan menganalisis data dengan lebih mudah.

#### Acceptance Criteria

1. THE Aplikasi SHALL menampilkan Daftar_Transaksi diurutkan berdasarkan waktu pencatatan dari terbaru ke terlama sebagai urutan default sebelum Pengguna memilih opsi pengurutan lain.
2. THE Aplikasi SHALL menyediakan kontrol pengurutan yang memungkinkan Pengguna memilih urutan berdasarkan: nominal tertinggi ke terendah, nominal terendah ke tertinggi, atau nama kategori secara alfabetis (A–Z).
3. WHEN Pengguna memilih opsi pengurutan, THE Daftar_Transaksi SHALL diurutkan ulang dan ditampilkan sesuai kriteria yang dipilih dalam waktu kurang dari 1 detik tanpa memuat ulang halaman.
4. WHEN sebuah Transaksi baru ditambahkan saat opsi pengurutan aktif, THE Daftar_Transaksi SHALL tetap menampilkan urutan sesuai opsi yang sedang aktif.
5. WHEN sebuah Transaksi dihapus saat opsi pengurutan aktif, THE Daftar_Transaksi SHALL tetap mempertahankan opsi pengurutan yang sedang aktif setelah penghapusan.

---

### Requirement 7: Batas Pengeluaran (Spending Limit)

**User Story:** Sebagai Pengguna, saya ingin menetapkan batas pengeluaran maksimal, sehingga saya mendapat peringatan visual ketika total pengeluaran saya mendekati atau melampaui batas tersebut.

#### Acceptance Criteria

1. THE Aplikasi SHALL menyediakan kolom input yang memungkinkan Pengguna menetapkan nilai Spending_Limit berupa angka antara 1 hingga 999.999.999 dalam satuan Rupiah.
2. WHEN Pengguna menyimpan nilai Spending_Limit yang valid, THE Aplikasi SHALL menyimpan nilai tersebut ke Local_Storage.
3. IF Pengguna memasukkan nilai Spending_Limit yang tidak valid (bukan angka, kurang dari 1, atau lebih dari 999.999.999), THEN THE Aplikasi SHALL menampilkan pesan validasi dan tidak menyimpan nilai tersebut.
4. WHILE nilai Total_Pengeluaran lebih besar atau sama dengan 80% dari nilai Spending_Limit namun belum melebihinya, THE Aplikasi SHALL menampilkan peringatan visual berwarna kuning pada area Total_Pengeluaran beserta teks yang menyatakan pengeluaran mendekati batas.
5. WHILE nilai Total_Pengeluaran melebihi nilai Spending_Limit, THE Aplikasi SHALL menampilkan peringatan visual berwarna merah pada area Total_Pengeluaran beserta teks yang menyatakan batas pengeluaran telah terlampaui.
6. WHEN nilai Total_Pengeluaran turun di bawah 80% dari nilai Spending_Limit setelah penghapusan Transaksi, THE Aplikasi SHALL menghilangkan semua peringatan visual secara langsung.
7. IF Pengguna mengosongkan atau menghapus nilai Spending_Limit, THEN THE Aplikasi SHALL menonaktifkan fitur peringatan dan menghapus nilai Spending_Limit dari Local_Storage.

---

### Requirement 8: Toggle Mode Terang/Gelap

**User Story:** Sebagai Pengguna, saya ingin beralih antara tampilan terang dan gelap dengan satu klik, sehingga saya dapat menyesuaikan tampilan aplikasi dengan preferensi atau kondisi pencahayaan saya.

#### Acceptance Criteria

1. THE Aplikasi SHALL menampilkan Light_Mode sebagai tema default apabila tidak ada preferensi tema yang tersimpan di Local_Storage.
2. THE Aplikasi SHALL menyediakan tombol toggle yang dapat diidentifikasi secara visual dan dapat diakses di semua ukuran layar untuk mengaktifkan dan menonaktifkan Dark_Mode.
3. WHEN Pengguna menekan tombol toggle Dark_Mode, THE Aplikasi SHALL menerapkan skema warna yang sesuai ke seluruh elemen antarmuka yang terlihat secara langsung tanpa memuat ulang halaman.
4. WHEN Pengguna menekan tombol toggle Dark_Mode, THE Aplikasi SHALL menyimpan preferensi tema terkini ke Local_Storage.
5. WHEN Pengguna memuat ulang halaman, THE Aplikasi SHALL membaca preferensi tema dari Local_Storage dan menerapkan tema tersebut sebelum konten halaman ditampilkan untuk menghindari efek kilat (flash of unstyled content).

---

### Requirement 9: Tata Letak dan Desain Antarmuka

**User Story:** Sebagai Pengguna, saya ingin antarmuka yang rapi, minimalis, dan mudah digunakan di perangkat apa pun, sehingga pengalaman penggunaan saya tetap nyaman di desktop maupun ponsel.

#### Acceptance Criteria

1. THE Aplikasi SHALL menampilkan elemen antarmuka dalam urutan berikut dari atas ke bawah: Total_Pengeluaran, Form_Input, lalu area yang berisi Daftar_Transaksi dan Pie_Chart.
2. WHILE lebar layar lebih dari atau sama dengan 768 piksel, THE Aplikasi SHALL menampilkan Daftar_Transaksi dan Pie_Chart berdampingan secara horizontal (dua kolom).
3. WHILE lebar layar kurang dari 768 piksel, THE Aplikasi SHALL menampilkan Daftar_Transaksi dan Pie_Chart tersusun secara vertikal (satu kolom) agar mudah digunakan di perangkat seluler.
4. THE Aplikasi SHALL memformat semua nilai nominal menggunakan format mata uang Rupiah Indonesia dengan awalan "Rp", pemisah ribuan menggunakan titik, dan tanpa angka desimal (contoh: Rp 50.000).
