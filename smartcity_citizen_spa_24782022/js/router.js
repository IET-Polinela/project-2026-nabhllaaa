import { setupLoginForm, setupRegisterForm } from './auth.js';

const routes = {
    '#login': `
        <div class="row justify-content-center align-items-center" style="min-height: 65vh;">
            <div class="col-12 col-sm-9 col-md-7 col-lg-5 col-xl-4">
                <div class="card custom-card p-4 p-sm-5 text-center">
                    <div class="mb-4">
                        <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 65px; height: 65px; background-color: #e1effe !important; color: #1e70cd !important;">
                            <i class="bi bi-shield-lock-fill fs-3"></i>
                        </div>
                        <h3 class="fw-bold text-dark m-0" style="letter-spacing: -0.5px;">Portal Warga</h3>
                        <p class="text-muted small mt-2">Silakan masuk untuk mengakses layanan SmartCity</p>
                    </div>
                    <form id="loginForm" class="text-start">
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-secondary">Username</label>
                            <input type="text" id="loginUsername" class="form-control" placeholder="Masukkan username" required>
                        </div>
                        <div class="mb-4">
                            <label class="form-label small fw-bold text-secondary">Password</label>
                            <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="btn btn-linkon w-100">
                            <i class="bi bi-box-arrow-in-right me-2"></i>Masuk Aplikasi
                        </button>
                    </form>
                    <div class="text-center small mt-4">
                        <span class="text-secondary">Belum punya akun?</span>
                        <a href="#register" class="fw-bold text-decoration-none" style="color: #1e70cd;">Daftar Citizen</a>
                    </div>
                </div>
            </div>
        </div>
    `,
    '#register': `
        <div class="row justify-content-center align-items-center" style="min-height: 65vh;">
            <div class="col-12 col-sm-10 col-md-8 col-lg-5">
                <div class="card custom-card p-4 p-sm-5">
                    <div class="text-center mb-4">
                        <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 65px; height: 65px; background-color: #e1effe !important; color: #1e70cd !important;">
                            <i class="bi bi-person-plus-fill fs-3"></i>
                        </div>
                        <h3 class="fw-bold text-dark m-0" style="letter-spacing: -0.5px;">Daftar Citizen</h3>
                        <p class="text-muted small mt-2">Buat akun warga untuk mengirim dan memantau laporan.</p>
                    </div>
                    <form id="registerForm" class="text-start">
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-secondary">Username</label>
                            <input type="text" id="registerUsername" class="form-control" placeholder="Masukkan username" autocomplete="username" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-secondary">Email</label>
                            <input type="email" id="registerEmail" class="form-control" placeholder="nama@email.com" autocomplete="email" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-secondary">Password</label>
                            <input type="password" id="registerPassword1" class="form-control" placeholder="Minimal 8 karakter" autocomplete="new-password" required>
                        </div>
                        <div class="mb-4">
                            <label class="form-label small fw-bold text-secondary">Konfirmasi Password</label>
                            <input type="password" id="registerPassword2" class="form-control" placeholder="Ulangi password" autocomplete="new-password" required>
                        </div>
                        <button type="submit" class="btn btn-linkon w-100">
                            <i class="bi bi-person-check-fill me-2"></i>Daftar
                        </button>
                    </form>
                    <div class="text-center small mt-4">
                        <span class="text-secondary">Sudah punya akun?</span>
                        <a href="#login" class="fw-bold text-decoration-none" style="color: #1e70cd;">Masuk</a>
                    </div>
                </div>
            </div>
        </div>
    `,
    '#dashboard': `
        <div class="row g-4">

            <!-- SIDEBAR KIRI: Rekap Status + Panduan Kota -->
            <aside class="col-12 col-lg-3">
                <div class="card custom-card p-4 sticky-top" style="top: 24px;">

                    <!-- Rekap Status Laporan -->
                    <h6 class="fw-bold text-dark mb-3">
                        <i class="bi bi-bar-chart-fill me-2" style="color: #1e70cd;"></i>Rekap Status Laporan
                    </h6>
                    <div class="small text-secondary mb-3">Ringkasan semua laporan Anda dalam satu tampilan.</div>

                    <div id="summaryStats">

                        <div class="d-grid gap-2 mb-3">
                            <div class="p-3 rounded-3" style="background-color: #fffbf0; border: 1px solid #ffe08a;">
                                <div class="text-secondary small">Draft</div>
                                <div id="draftCount" class="badge bg-secondary fw-bold fs-4">0</div>
                            </div>
                            <div class="p-3 rounded-3" style="background-color: #f2f2f2; border: 1px solid #cccccc;">
                                <div class="text-secondary small">Reported</div>
                                <div id="reportedCount" class="fw-bold fs-4 text-dark">0</div>
                            </div>
                            <div class="p-3 rounded-3" style="background-color: #eef5ff; border: 1px solid #b8d4ff;">
                                <div class="text-secondary small">Verified</div>
                                <div id="verifiedCount" class="fw-bold fs-4 text-primary">0</div>
                            </div>
                            <div class="p-3 rounded-3" style="background-color: #fffbf0; border: 1px solid #ffe08a;">
                                <div class="text-secondary small">In Progress</div>
                                <div id="inProgressCount" class="fw-bold fs-4 text-warning">0</div>
                            </div>
                            <div class="p-3 rounded-3" style="background-color: #f0fff4; border: 1px solid #9be9b8;">
                                <div class="text-secondary small">Resolved</div>
                                <div id="resolvedCount" class="fw-bold fs-4 text-success">0</div>
                            </div>
                        </div>

                    </div>
                    <hr class="my-3" style="border-color: #d0e1f9;">

                    <!-- Panduan Kota -->
                    <h6 class="fw-bold text-dark mb-2">
                        <i class="bi bi-info-circle-fill me-2" style="color: #1e70cd;"></i>Panduan Kota
                    </h6>
                    <p class="small text-secondary lh-lg m-0">Gunakan sistem integrasi satu pintu ini untuk melaporkan segala bentuk kendala infrastruktur jalan, kebersihan umum, atau layanan publik kota.</p>
                    <hr class="my-3" style="border-color: #d0e1f9;">
                    <div class="p-3 rounded-3 small fw-bold text-center" style="background-color: #e1effe; color: #1e70cd;">
                        <i class="bi bi-telephone-fill me-1"></i> Emergency Hotline: 112
                    </div>
                </div>
            </aside>

            <!-- KONTEN UTAMA -->
            <section class="col-12 col-lg-9">

                <!-- BARIS ATAS: Tombol Buat Laporan + Tab Navigasi -->
                <div class="card custom-card px-4 py-3 mb-4 d-flex flex-row align-items-center justify-content-between flex-wrap gap-3">
                    <button id="btnBukaModal" class="btn btn-linkon shadow-sm px-4" data-bs-toggle="modal" data-bs-target="#reportModal" type="button">
                        <i class="bi bi-plus-circle-fill me-2"></i>Buat Laporan Baru
                    </button>
                    <div class="d-flex gap-2">
                        <a id="tabFeedKota" href="#dashboard"
                            class="btn btn-sm fw-semibold px-3 py-2 rounded-3 text-white"
                            style="background-color: #1e70cd; border: none;">
                            <i class="bi bi-grid-1x2-fill me-1"></i>Dashboard Utama
                        </a>
                        <a id="menuMyReports" href="#dashboard"
                            class="btn btn-sm fw-semibold px-3 py-2 rounded-3 text-secondary"
                            style="background-color: #eef5fc; border: 1px solid #d0e1f9;">
                            <i class="bi bi-file-text me-1"></i>Daftar Laporanku
                        </a>
                    </div>
                </div>

                <!-- KARTU KONTEN + LIST -->
                <div class="card custom-card p-4 p-md-4">
                    <div class="text-center d-flex flex-column align-items-center justify-content-center" id="featureHeader" style="min-height: 120px;">
                        <div class="badge-blue rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                            <i id="featureIcon" class="bi bi-check-circle-fill fs-2" style="color: #1e70cd;"></i>
                        </div>
                        <h5 id="featureTitle" class="fw-bold text-dark mb-1">Autentikasi Berhasil Terhubung!</h5>
                        <p id="featureDescription" class="text-secondary small px-md-3 lh-lg mb-0">Selamat datang di panel kendali warga Linkon City. Sesi login Anda saat ini telah berjalan aman menggunakan enkripsi secure token. Seluruh fitur pelaporan, pemantauan infrastruktur, dan sinkronisasi data publik instan siap disajikan di halaman utama ini.</p>
                    </div>
                    <div id="featurePanel" class="mt-2"></div>
                    <div class="mt-4">
                        <label for="reportSearchInput" class="form-label small fw-bold text-secondary">Live Search Laporan</label>
                        <div class="input-group">
                            <span class="input-group-text border-0" style="background-color: #e1effe; color: #1e70cd; border-radius: 14px 0 0 14px;">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="search" id="reportSearchInput" class="form-control" placeholder="Cari judul, kategori, deskripsi, atau lokasi...">
                        </div>
                    </div>
                    <div class="mt-4">
                        <div id="listContainer" class="row g-3"></div>
                        <div id="paginationContainer" class="mt-3"></div>
                    </div>
                </div>

            </section>

        </div>
    `
};

function activateMenuItem(menuId) {
    const menuItems = ['tabFeedKota', 'menuMyReports'];

    menuItems.forEach((id) => {
        const item = document.getElementById(id);
        if (!item) return;

        // Reset ke tampilan tidak aktif
        item.classList.remove('text-white');
        item.classList.add('text-secondary');
        item.style.backgroundColor = '#eef5fc';
        item.style.border = '1px solid #d0e1f9';
    });

    const activeItem = document.getElementById(menuId);
    if (activeItem) {
        activeItem.classList.add('text-white');
        activeItem.classList.remove('text-secondary');
        activeItem.style.backgroundColor = '#1e70cd';
        activeItem.style.border = 'none';
    }
}

function setFeatureView(mode = 'feed') {
    const titleEl = document.getElementById('featureTitle');
    const descEl = document.getElementById('featureDescription');
    const iconEl = document.getElementById('featureIcon');
    const panelEl = document.getElementById('featurePanel');

    if (!titleEl || !descEl || !iconEl) return;

    const isAdmin = localStorage.getItem('is_admin') === 'true';

    if (isAdmin) {
        titleEl.textContent = 'Moderasi Laporan Citizen';
        descEl.textContent = 'Tampilan ini memuat laporan warga yang dapat ditinjau dan diperbarui statusnya oleh admin.';
        iconEl.className = 'bi bi-shield-check fs-2';
    } else if (mode === 'my_reports') {
        titleEl.textContent = 'Daftar Laporanku';
        descEl.textContent = 'Tampilan ini memuat laporan yang Anda kirimkan sendiri dengan status yang terbaru.';
        iconEl.className = 'bi bi-file-text-fill fs-2';
    } else {
        titleEl.textContent = 'Autentikasi Berhasil Terhubung!';
        descEl.textContent = 'Selamat datang di panel kendali warga Linkon City. Sesi login Anda saat ini telah berjalan aman menggunakan enkripsi secure token. Seluruh fitur pelaporan, pemantauan infrastruktur, dan sinkronisasi data publik instan siap disajikan di halaman utama ini.';
        iconEl.className = 'bi bi-check-circle-fill fs-2';
    }

    if (panelEl) panelEl.innerHTML = '';
}

export function handleRouting() {
    let hash = window.location.hash;
    if (!hash || hash === '#/' || !routes[hash]) {
        hash = '#login';
    }
    
    const appContent = document.getElementById('app-content');
    const navMenus = document.getElementById('nav-menus'); // Menangkap container menu navbar

    if (appContent) {
        appContent.innerHTML = routes[hash];
        
        if (hash === '#login') {
            // Hapus tombol logout dari navbar jika di halaman login
            if (navMenus) navMenus.innerHTML = '';
            setupLoginForm();
        } 
        else if (hash === '#register') {
            if (navMenus) navMenus.innerHTML = '';
            setupRegisterForm();
        }

            else if (hash === '#dashboard') {
                // ← TAMBAHKAN INI
                const token = localStorage.getItem('access_token');
                if (!token) {
                    window.location.hash = '#login';
                    return;
                }
                // kode lama di bawah tetap tidak berubah...
                if (navMenus) {
                const username = localStorage.getItem('current_username') || 'Pengguna';
                const isAdmin = localStorage.getItem('is_admin') === 'true';
                const roleLabel = isAdmin ? 'Admin' : 'Citizen';
                const roleColor = isAdmin ? '#ffc107' : '#a8d8ff';
                const roleTextColor = isAdmin ? '#7a4f00' : '#1e70cd';
                const userIcon = isAdmin ? 'bi-shield-fill' : 'bi-person-circle';

                navMenus.innerHTML = `
                    <div class="d-flex align-items-center gap-2">
                        <div class="d-flex align-items-center gap-2 px-3 py-1 rounded-3"
                             style="background-color: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);">
                            <i class="bi ${userIcon} text-white" style="font-size: 1.1rem;"></i>
                            <div class="lh-1">
                                <div class="text-white fw-bold small">${username}</div>
                                <div class="small fw-semibold" style="color: ${roleColor}; font-size: 0.7rem;">${roleLabel}</div>
                            </div>
                        </div>
                        <button id="btnLogout" class="btn btn-outline-light btn-sm fw-bold px-3 py-2" style="border-radius: 10px;">
                            <i class="bi bi-box-arrow-right me-1"></i> Keluar
                        </button>
                    </div>
                `;

                // Logika ketika tombol logout diklik
                document.getElementById('btnLogout').addEventListener('click', () => {
                    localStorage.clear(); // Hapus token JWT yang kedaluwarsa dari browser
                    window.location.hash = '#login'; // Tendang balik ke halaman login
                });
            }

            // Pemicu fungsi bawaan modul Lab 12 kamu
            if (typeof loadDashboardData === 'function') {
                loadDashboardData('feed', 1);
            }
            if (typeof loadSummaryStats === 'function') {
                loadSummaryStats();
            }
            if (typeof attachReportModalEvents === 'function') {
                attachReportModalEvents();
            }
            if (typeof attachLiveSearchEvents === 'function') {
                attachLiveSearchEvents();
            }

            activateMenuItem('tabFeedKota');
            setFeatureView('feed');

            const menuFeed = document.getElementById('tabFeedKota');
            const menuMyReports = document.getElementById('menuMyReports');
            const createReportBtn = document.getElementById('btnBukaModal');
            const isAdminDashboard = localStorage.getItem('is_admin') === 'true';

            if (isAdminDashboard) {
                if (createReportBtn) createReportBtn.classList.add('d-none');
                if (menuMyReports) menuMyReports.classList.add('d-none');
            }

            if (menuFeed) {
                menuFeed.addEventListener('click', (event) => {
                    event.preventDefault();
                    activateMenuItem('tabFeedKota');
                    setFeatureView('feed');
                    if (typeof loadDashboardData === 'function') {
                        loadDashboardData('feed', 1);
                    }
                });
            }

            if (menuMyReports) {
                menuMyReports.addEventListener('click', (event) => {
                    event.preventDefault();
                    activateMenuItem('menuMyReports');
                    setFeatureView('my_reports');
                    if (typeof loadDashboardData === 'function') {
                        loadDashboardData('my_reports', 1);
                    }
                });
            }

        }
    }
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);
