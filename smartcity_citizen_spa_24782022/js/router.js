import { setupLoginForm } from './auth.js';

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
                </div>
            </div>
        </div>
    `,
    '#dashboard': `
        <div class="row g-4">
            <aside class="col-12 col-lg-3">
                <div class="card custom-card p-3 sticky-top" style="top: 24px;">
                    <button class="btn btn-linkon w-100 mb-3 shadow-sm" onclick="alert('Fitur pembuatan laporan baru sedang disiapkan oleh sistem!')">
                        <i class="bi bi-plus-circle-fill me-2"></i>Buat Laporan Baru
                    </button>
                    <div class="list-group list-group-flush small">
                        <a href="#dashboard" class="list-group-item list-group-item-action active rounded-3 border-0 py-2.5 mb-1 text-white" style="background-color: #1e70cd !important;">
                            <i class="bi bi-grid-1x2-fill me-2"></i>Dashboard Utama
                        </a>
                        <a href="#dashboard" class="list-group-item list-group-item-action text-secondary rounded-3 border-0 py-2.5 mb-1" onclick="alert('Daftar aduan Anda sedang dimuat dari server...')">
                            <i class="bi bi-file-text me-2"></i>Daftar Laporanku
                        </a>
                        <a href="#dashboard" class="list-group-item list-group-item-action text-secondary rounded-3 border-0 py-2.5" onclick="alert('Profil pengguna terautentikasi aktif.')">
                            <i class="bi bi-person me-2"></i>Informasi Akun
                        </a>
                    </div>
                </div>
            </aside>

            <section class="col-12 col-lg-6">
                <div class="card custom-card p-5 text-center border-dashed d-flex flex-column align-items-center justify-content-center" style="min-height: 380px;">
                    <div class="badge-blue rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 75px; height: 75px;">
                        <i class="bi bi-check-circle-fill fs-2" style="color: #1e70cd;"></i>
                    </div>
                    <h4 class="fw-bold text-dark mb-2">Autentikasi Berhasil Terhubung!</h4>
                    <p class="text-secondary small px-md-3 lh-lg">Selamat datang di panel kendali warga Linkon City. Sesi login Anda saat ini telah berjalan aman menggunakan enkripsi secure token. Seluruh fitur pelaporan, pemantauan infrastruktur, dan sinkronisasi data publik instan siap disajikan di halaman utama ini.</p>
                </div>
            </section>

            <aside class="col-12 col-lg-3 d-none d-lg-block">
                <div class="card custom-card p-4 sticky-top" style="top: 24px;">
                    <h6 class="fw-bold text-dark mb-3">
                        <i class="bi bi-info-circle-fill text-primary me-2" style="color: #1e70cd !important;"></i>Panduan Kota
                    </h6>
                    <p class="small text-secondary lh-lg m-0">Gunakan sistem integrasi satu pintu ini untuk melaporkan segala bentuk kendala infrastruktur jalan, kebersihan umum, atau layanan publik kota.</p>
                    <hr class="my-3" style="border-color: #d0e1f9;">
                    <div class="p-3 rounded-3 small fw-bold text-center" style="background-color: #e1effe; color: #1e70cd;">
                        <i class="bi bi-telephone-fill me-1"></i> Emergency Hotline: 112
                    </div>
                </div>
            </aside>
        </div>
    `
};

export function handleRouting() {
    let hash = window.location.hash;
    if (!hash || hash === '#/' || !routes[hash]) {
        hash = '#login';
    }
    
    const appContent = document.getElementById('app-content');
    if (appContent) {
        appContent.innerHTML = routes[hash];
        
        if (hash === '#login') {
            setupLoginForm();
        }
    }
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);