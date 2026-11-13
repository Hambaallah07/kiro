'use strict';

// =============================================================================
// KONSTANTA APLIKASI
// =============================================================================

/**
 * Kategori pengeluaran default yang tersedia di dropdown form input.
 * Digunakan oleh validateForm() untuk memeriksa keabsahan kategori.
 * Requirements: 1.2
 */
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

/**
 * Palet warna per kategori untuk pie chart.
 * Kategori di luar daftar ini akan menggunakan warna fallback '#adb5bd'.
 * Requirements: 4.1, 4.3
 */
const CATEGORY_COLORS = {
  Food: '#4dabf7',
  Transport: '#69db7c',
  Fun: '#ffa94d',
};

// =============================================================================
// STATE GLOBAL (Single Source of Truth)
// =============================================================================

/**
 * Array seluruh transaksi yang dicatat pengguna.
 * Setiap item adalah objek { id, name, amount, category, timestamp }.
 * Disinkronkan dengan Local Storage melalui loadAll() dan saveAll().
 * Requirements: 1.5, 2.6, 5.1, 5.2
 */
let transactions = [];

/**
 * Batas pengeluaran maksimal yang ditetapkan pengguna (dalam Rupiah).
 * Nilai 0 berarti fitur spending limit tidak aktif.
 * Requirements: 7.1, 7.4, 7.5, 7.6, 7.7
 */
let spendingLimit = 0;

/**
 * Kriteria pengurutan daftar transaksi yang sedang aktif.
 * Nilai valid: 'newest' | 'oldest' | 'amount-desc' | 'amount-asc' | 'category-az'
 * Requirements: 6.1, 6.2, 6.3
 */
let currentSort = 'newest';

/**
 * Referensi ke instance Chart.js yang sedang aktif.
 * Null jika belum ada chart yang dirender.
 * Digunakan untuk strategi update-in-place agar performa optimal.
 * Requirements: 4.1, 4.2
 */
let chartInstance = null;

/**
 * Preferensi tema saat ini: 'light' atau 'dark'.
 * Dimuat dari Local Storage oleh loadAll() dan diperbarui oleh toggleTheme().
 * Requirements: 8.1, 8.3, 8.4
 */
let theme = 'light';

// =============================================================================
// FUNGSI MURNI (PURE FUNCTIONS)
// =============================================================================

/**
 * Memformat angka menjadi string mata uang Rupiah.
 * Contoh: formatRupiah(50000) → "Rp 50.000"
 * Requirements: 2.1, 3.1, 4.5, 9.4
 *
 * @param {number} amount - Integer non-negatif dalam Rupiah
 * @returns {string} String berformat "Rp X.XXX"
 */
function formatRupiah(amount) {
  return (
    'Rp ' +
    new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  );
}

/**
 * Menghitung total pengeluaran dari seluruh transaksi.
 * Requirements: 3.2, 3.3, 3.4
 *
 * @param {Array<{amount: number}>} transactions - Array objek transaksi
 * @returns {number} Jumlah seluruh field `amount`; 0 jika array kosong
 */
function computeTotal(transactions) {
  return transactions.reduce(function (sum, t) {
    return sum + t.amount;
  }, 0);
}

/**
 * Memvalidasi input form tambah transaksi.
 * Requirements: 1.3, 1.4
 *
 * @param {string} name     - Nama transaksi
 * @param {*}      amount   - Nominal (akan divalidasi sebagai integer 1–999.999.999)
 * @param {string} category - Kategori (harus salah satu dari DEFAULT_CATEGORIES)
 * @returns {{ valid: boolean, errors: { name?: string, amount?: string, category?: string } }}
 */
function validateForm(name, amount, category) {
  const errors = {};

  // --- Validasi nama ---
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (trimmedName.length === 0) {
    errors.name = 'Nama transaksi tidak boleh kosong.';
  } else if (trimmedName.length > 100) {
    errors.name = 'Nama transaksi maksimal 100 karakter.';
  }

  // --- Validasi amount ---
  const numAmount = Number(amount);
  if (isNaN(numAmount) || !Number.isInteger(numAmount)) {
    errors.amount = 'Nominal harus berupa angka bulat.';
  } else if (numAmount < 1 || numAmount > 999999999) {
    errors.amount = 'Nominal harus antara Rp 1 dan Rp 999.999.999.';
  }

  // --- Validasi category ---
  if (!DEFAULT_CATEGORIES.includes(category)) {
    errors.category = 'Pilih salah satu kategori.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors,
  };
}

/**
 * Menentukan status pengeluaran terhadap batas yang ditetapkan.
 * Requirements: 7.4, 7.5, 7.6
 *
 * @param {number} total - Total pengeluaran saat ini
 * @param {number} limit - Batas pengeluaran (0 = tidak aktif)
 * @returns {'normal' | 'warning' | 'exceeded'}
 */
function checkSpendingLimit(total, limit) {
  if (limit === 0 || total < 0.8 * limit) {
    return 'normal';
  }
  if (total <= limit) {
    return 'warning';
  }
  return 'exceeded';
}

/**
 * Mengurutkan salinan array transaksi berdasarkan kriteria yang diberikan.
 * Array asli tidak dimutasi.
 * Requirements: 6.1, 6.2, 6.3
 *
 * @param {Array<{timestamp: number, amount: number, category: string}>} transactions
 * @param {'newest'|'oldest'|'amount-desc'|'amount-asc'|'category-az'} criteria
 * @returns {Array} Salinan array yang sudah diurutkan
 */
function sortTransactions(transactions, criteria) {
  const copy = [...transactions];

  switch (criteria) {
    case 'oldest':
      return copy.sort(function (a, b) { return a.timestamp - b.timestamp; });

    case 'amount-desc':
      return copy.sort(function (a, b) { return b.amount - a.amount; });

    case 'amount-asc':
      return copy.sort(function (a, b) { return a.amount - b.amount; });

    case 'category-az':
      return copy.sort(function (a, b) {
        return a.category.localeCompare(b.category);
      });

    case 'newest':
    default:
      return copy.sort(function (a, b) { return b.timestamp - a.timestamp; });
  }
}

// =============================================================================
// STUB FUNGSI — Akan diimplementasikan pada task-task berikutnya
// =============================================================================

/**
 * Menerapkan tema ke DOM dengan menambah/menghapus class 'dark-mode' pada body.
 * Requirements: 8.1, 8.3, 8.4
 *
 * @param {string} t - Tema yang diterapkan: 'light' atau 'dark'
 */
function applyTheme(t) {
  if (t === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  theme = t;
}

/**
 * Memuat seluruh state aplikasi (transactions, spendingLimit, theme)
 * dari Local Storage dan menerapkan tema yang tersimpan.
 * Requirements: 5.2, 5.3, 5.4, 5.5
 *
 * @param {Storage} [storage=window.localStorage] - Storage yang digunakan (dapat di-mock saat testing)
 */
function loadAll(storage = window.localStorage) {
  // 1. Muat transactions
  try {
    const raw = storage.getItem('transactions');
    transactions = raw !== null ? JSON.parse(raw) : [];
  } catch (e) {
    transactions = [];
  }

  // 2. Muat spendingLimit
  try {
    const raw = storage.getItem('spendingLimit');
    spendingLimit = raw !== null ? JSON.parse(raw) : 0;
  } catch (e) {
    spendingLimit = 0;
  }

  // 3. Muat theme dan terapkan ke DOM
  try {
    const raw = storage.getItem('theme');
    theme = raw !== null ? JSON.parse(raw) : 'light';
  } catch (e) {
    theme = 'light';
  }
  applyTheme(theme);
}

/**
 * Menyimpan seluruh state aplikasi (transactions, spendingLimit, theme)
 * ke Local Storage.
 * QuotaExceededError diteruskan ke pemanggil; error lain ditangkap diam-diam.
 * Requirements: 5.1, 5.2
 *
 * @param {Storage} [storage=window.localStorage] - Storage yang digunakan (dapat di-mock saat testing)
 */
function saveAll(storage = window.localStorage) {
  try {
    storage.setItem('transactions', JSON.stringify(transactions));
    storage.setItem('spendingLimit', JSON.stringify(spendingLimit));
    storage.setItem('theme', JSON.stringify(theme));
  } catch (e) {
    // Lempar kembali QuotaExceededError agar pemanggil dapat menanganinya
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw e;
    }
    // Error lain (misalnya SecurityError) diabaikan diam-diam
  }
}

// =============================================================================
// MUTASI STATE
// =============================================================================

// ========== FUNGSI RENDER UI ==========

/**
 * Merender bagian ringkasan total pengeluaran dan status spending limit.
 * Requirements: 3.1, 3.2, 7.4, 7.5, 7.6
 *
 * @param {number} total  - Total pengeluaran saat ini
 * @param {'normal'|'warning'|'exceeded'} status - Status dari checkSpendingLimit
 * @param {number} limit  - Spending limit aktif (0 = tidak aktif)
 */
function renderSummary(total, status, limit) {
  const summaryEl = document.getElementById('summary');
  const totalAmountEl = document.getElementById('total-amount');
  const limitStatusEl = document.getElementById('limit-status');

  // Tampilkan total
  if (totalAmountEl) {
    totalAmountEl.textContent = formatRupiah(total);
  }

  // Hapus semua kelas status sebelumnya
  if (summaryEl) {
    summaryEl.classList.remove('status-warning', 'status-exceeded');
  }

  // Terapkan kelas dan teks sesuai status
  if (limitStatusEl) {
    if (status === 'warning' && limit > 0) {
      summaryEl.classList.add('status-warning');
      limitStatusEl.textContent = '⚠️ Pengeluaran mendekati batas (' + formatRupiah(limit) + ')';
    } else if (status === 'exceeded' && limit > 0) {
      summaryEl.classList.add('status-exceeded');
      limitStatusEl.textContent = '🚫 Batas pengeluaran terlampaui! (Batas: ' + formatRupiah(limit) + ')';
    } else {
      limitStatusEl.textContent = limit > 0 ? 'Batas: ' + formatRupiah(limit) : '';
    }
  }
}

/**
 * Fungsi pembantu untuk mencegah XSS saat memasukkan teks ke HTML.
 *
 * @param {string} str - String yang akan di-escape
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Merender daftar transaksi ke dalam <ul id="transaction-list">.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 *
 * @param {Array<{id: string, name: string, amount: number, category: string}>} sortedTransactions
 *   Array transaksi yang sudah diurutkan
 */
function renderTransactionList(sortedTransactions) {
  const listEl = document.getElementById('transaction-list');
  if (!listEl) return;

  // Tampilkan pesan kosong jika tidak ada transaksi
  if (sortedTransactions.length === 0) {
    listEl.innerHTML = '<li class="empty-message">Belum ada transaksi. Tambahkan pengeluaran pertama Anda!</li>';
    return;
  }

  // Render setiap transaksi sebagai <li>
  listEl.innerHTML = sortedTransactions.map(function(tx) {
    return '<li class="transaction-item" data-id="' + tx.id + '">' +
      '<div class="tx-info">' +
        '<span class="tx-name">' + escapeHtml(tx.name) + '</span>' +
        '<span class="tx-category badge badge-' + tx.category.toLowerCase() + '">' + escapeHtml(tx.category) + '</span>' +
      '</div>' +
      '<div class="tx-right">' +
        '<span class="tx-amount">' + formatRupiah(tx.amount) + '</span>' +
        '<button class="btn-delete" data-id="' + tx.id + '" aria-label="Hapus transaksi ' + escapeHtml(tx.name) + '">✕</button>' +
      '</div>' +
    '</li>';
  }).join('');
}

/**
 * Menginisialisasi event delegation untuk tombol hapus pada daftar transaksi.
 * Dipanggil sekali saat DOMContentLoaded.
 * Requirements: 2.4, 2.5
 */
function initTransactionListHandler() {
  const listEl = document.getElementById('transaction-list');
  if (!listEl) return;

  listEl.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (id) deleteTransaction(id);
  });
}

/**
 * Menginisialisasi event listener untuk form input transaksi.
 * Requirements: 1.1, 1.3, 1.4, 1.5, 1.7
 */
function initFormHandler() {
  const form = document.getElementById('transaction-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const nameVal = document.getElementById('tx-name').value;
    const amountVal = document.getElementById('tx-amount').value;
    const categoryVal = document.getElementById('tx-category').value;

    // Jalankan validasi
    const result = validateForm(nameVal, amountVal, categoryVal);

    // Tampilkan / hapus pesan error per field
    const nameError = document.getElementById('error-name');
    const amountError = document.getElementById('error-amount');
    const categoryError = document.getElementById('error-category');

    if (nameError) nameError.textContent = result.errors.name || '';
    if (amountError) amountError.textContent = result.errors.amount || '';
    if (categoryError) categoryError.textContent = result.errors.category || '';

    if (!result.valid) return;

    // Simpan transaksi
    addTransaction(nameVal, amountVal, categoryVal);

    // Reset form
    form.reset();
    // Pastikan dropdown kembali ke placeholder
    document.getElementById('tx-category').value = '';
  });
}

/**
 * Menampilkan banner error penyimpanan dengan pesan yang diberikan.
 *
 * @param {string} msg - Pesan error yang ditampilkan
 */
function showStorageErrorBanner(msg) {
  const banner = document.getElementById('storage-error-banner');
  if (banner) {
    banner.textContent = msg;
    banner.hidden = false;
  }
}

/**
 * Menyembunyikan banner error penyimpanan.
 */
function hideStorageErrorBanner() {
  const banner = document.getElementById('storage-error-banner');
  if (banner) banner.hidden = true;
}

/**
 * Menambahkan transaksi baru ke daftar, menyimpan ke Local Storage, lalu merender ulang.
 * Jika penyimpanan gagal (QuotaExceededError), state di-rollback dan banner error ditampilkan.
 * Requirements: 1.5, 1.6, 1.7, 5.1
 *
 * @param {string} name     - Nama transaksi (akan di-trim)
 * @param {number|string} amount   - Nominal transaksi
 * @param {string} category - Kategori transaksi
 */
function addTransaction(name, amount, category) {
  // 1. Buat objek transaksi baru
  const newTx = {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).slice(2),
    name: name.trim(),
    amount: parseInt(amount, 10),
    category: category,
    timestamp: Date.now()
  };

  // 2. Snapshot state saat ini
  const snapshot = [...transactions];

  // 3. Tambahkan ke array
  transactions.push(newTx);

  // 4. Simpan ke Local Storage
  try {
    saveAll();
    hideStorageErrorBanner();
    renderAll();
    // Reset form setelah berhasil (dipanggil oleh handler form, bukan di sini)
  } catch (e) {
    // Rollback
    transactions = snapshot;
    showStorageErrorBanner('Penyimpanan penuh. Hapus beberapa transaksi untuk melanjutkan.');
  }
}

/**
 * Menghapus transaksi berdasarkan ID, menyimpan ke Local Storage, lalu merender ulang.
 * Jika penyimpanan gagal, state di-rollback dan banner error ditampilkan.
 * Requirements: 2.5, 5.1
 *
 * @param {string} id - ID transaksi yang akan dihapus
 */
function deleteTransaction(id) {
  // 1. Snapshot
  const snapshot = [...transactions];

  // 2. Filter
  transactions = transactions.filter(function(tx) { return tx.id !== id; });

  // 3. Simpan
  try {
    saveAll();
    hideStorageErrorBanner();
    renderAll();
  } catch (e) {
    // Rollback
    transactions = snapshot;
    showStorageErrorBanner('Gagal menyimpan perubahan. Silakan coba lagi.');
  }
}

// ========== CHART.JS ==========

/**
 * Merender atau memperbarui Pie Chart menggunakan Chart.js.
 * Strategi: update-in-place jika instance sudah ada; buat baru jika belum.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
function renderChart(txList) {
  const canvas = document.getElementById('pie-chart');
  const emptyMsg = document.getElementById('chart-empty-msg');

  // Sembunyikan chart dan tampilkan pesan jika tidak ada transaksi
  if (!txList || txList.length === 0) {
    if (canvas) canvas.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'block';
    // Hancurkan instance yang ada
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  if (canvas) canvas.style.display = 'block';
  if (emptyMsg) emptyMsg.style.display = 'none';

  // Hitung total per kategori
  const categoryTotals = {};
  txList.forEach(function(tx) {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const backgroundColors = labels.map(function(label) {
    return CATEGORY_COLORS[label] || '#adb5bd';
  });

  if (chartInstance) {
    // Update in-place (lebih efisien)
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = backgroundColors;
    chartInstance.update();
  } else {
    // Buat instance baru
    try {
      chartInstance = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 2,
            borderColor: '#ffffff',
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                generateLabels: function(chart) {
                  return chart.data.labels.map(function(label, i) {
                    return {
                      text: label + ': ' + formatRupiah(chart.data.datasets[0].data[i]),
                      fillStyle: chart.data.datasets[0].backgroundColor[i],
                      strokeStyle: chart.data.datasets[0].backgroundColor[i],
                      index: i,
                      hidden: false,
                    };
                  });
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  return ' ' + ctx.label + ': ' + formatRupiah(ctx.raw);
                }
              }
            }
          }
        }
      });
    } catch (err) {
      // Chart.js tidak tersedia atau gagal dimuat
      if (canvas) canvas.style.display = 'none';
      if (emptyMsg) {
        emptyMsg.style.display = 'block';
        emptyMsg.textContent = 'Diagram tidak dapat dimuat. Periksa koneksi internet.';
      }
    }
  }
}

function renderSpendingLimitInput(limit) {
  const input = document.getElementById('spending-limit-input');
  if (input) {
    // Hanya update nilai jika field tidak sedang difokus (agar tidak mengganggu pengetikan)
    if (document.activeElement !== input) {
      input.value = limit > 0 ? limit : '';
    }
  }
}

function updateThemeToggleButton() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  if (theme === 'dark') {
    btn.textContent = '☀️ Light Mode';
    btn.setAttribute('aria-label', 'Beralih ke mode terang');
  } else {
    btn.textContent = '🌙 Dark Mode';
    btn.setAttribute('aria-label', 'Beralih ke mode gelap');
  }
}

function updateSortControls() {
  const buttons = document.querySelectorAll('.sort-btn');
  buttons.forEach(function(btn) {
    if (btn.getAttribute('data-sort') === currentSort) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// ========== FITUR TAMBAHAN ==========

/**
 * Menginisialisasi event listener untuk kontrol pengurutan transaksi.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
function initSortControls() {
  const sortControlsEl = document.getElementById('sort-controls');
  if (!sortControlsEl) return;

  sortControlsEl.addEventListener('click', function(e) {
    const btn = e.target.closest('.sort-btn');
    if (!btn) return;
    const sortValue = btn.getAttribute('data-sort');
    if (sortValue && sortValue !== currentSort) {
      currentSort = sortValue;
      renderAll();
    }
  });
}

/**
 * Menyimpan spending limit baru berdasarkan input pengguna.
 * Jika kosong, spending limit dinonaktifkan (nilai 0).
 * Requirements: 7.1, 7.2, 7.3, 7.7
 *
 * @param {string|number} value - Nilai input dari pengguna
 */
function saveSpendingLimit(value) {
  const trimmed = String(value).trim();

  // Jika kosong, nonaktifkan spending limit
  if (trimmed === '') {
    spendingLimit = 0;
    try {
      window.localStorage.removeItem('spendingLimit');
    } catch (e) { /* ignore */ }
    renderAll();
    return;
  }

  const parsed = parseInt(trimmed, 10);
  const errorEl = document.getElementById('error-spending-limit');

  // Validasi
  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1 || parsed > 999999999) {
    if (errorEl) errorEl.textContent = 'Batas harus berupa angka antara 1 dan 999.999.999.';
    return;
  }

  if (errorEl) errorEl.textContent = '';
  spendingLimit = parsed;
  try {
    saveAll();
  } catch (e) {
    showStorageErrorBanner('Gagal menyimpan batas pengeluaran.');
  }
  renderAll();
}

/**
 * Menginisialisasi event listener untuk form batas pengeluaran.
 * Requirements: 7.1, 7.2, 7.3, 7.7
 */
function initSpendingLimitHandler() {
  const btn = document.getElementById('btn-save-limit');
  const input = document.getElementById('spending-limit-input');
  if (!btn || !input) return;

  btn.addEventListener('click', function() {
    saveSpendingLimit(input.value);
  });

  // Juga simpan saat tekan Enter
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveSpendingLimit(input.value);
    }
  });
}

/**
 * Mengubah tema antara 'light' dan 'dark', menyimpan preferensi, lalu memperbarui tombol.
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
function toggleTheme() {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  try {
    saveAll();
  } catch (e) {
    // Ignore storage errors for theme toggle
  }
  updateThemeToggleButton();
}

/**
 * Menginisialisasi event listener untuk tombol toggle tema.
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
function initThemeToggleHandler() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', toggleTheme);
}


/**
 * Merender ulang seluruh antarmuka berdasarkan state global terkini.
 * Dipanggil setiap kali state berubah (tambah/hapus transaksi, ubah limit, ubah tema).
 * Requirements: 3.3, 3.4, 2.5, 4.2
 */
function renderAll() {
  const sorted = sortTransactions(transactions, currentSort);
  const total = computeTotal(transactions);
  const status = checkSpendingLimit(total, spendingLimit);

  renderSummary(total, status, spendingLimit);
  renderTransactionList(sorted);
  renderChart(transactions);
  renderSpendingLimitInput(spendingLimit);
  updateThemeToggleButton();
  updateSortControls();
}

// =============================================================================
// ENTRY POINT UTAMA
// =============================================================================

/**
 * Event listener DOMContentLoaded memastikan DOM sepenuhnya siap sebelum
 * aplikasi diinisialisasi. Urutan yang benar:
 *   1. loadAll()  — muat data dan preferensi dari Local Storage
 *   2. renderAll() — render antarmuka berdasarkan data yang dimuat
 *
 * Requirements: 5.2, 5.4, 5.5, 8.5
 */
document.addEventListener('DOMContentLoaded', function () {
  loadAll();
  initFormHandler();
  initTransactionListHandler();
  initSortControls();
  initSpendingLimitHandler();
  initThemeToggleHandler();
  renderAll();
});
