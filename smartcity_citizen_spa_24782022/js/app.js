import { handleRouting } from './router.js';
import { requestAPI } from './api.js';

let currentTab = 'feed';
let currentPage = 1;
let allReports = [];
let totalPages = 1;
let editingReportId = null;

// =========================================================
// FETCH API AUTO-REFRESH (Polling)
// =========================================================
// Interval ID untuk polling agar bisa dihentikan kapan saja
let pollingIntervalId = null;

// Waktu polling dalam milidetik (5 detik)
const POLLING_INTERVAL_MS = 5000;

/**
 * Mulai polling otomatis: setiap POLLING_INTERVAL_MS detik,
 * cek apakah ada perubahan status laporan dari server.
 * Hanya jalan ketika citizen sedang di halaman #dashboard.
 */
function startStatusPolling() {
    // Hentikan polling lama jika sudah berjalan, supaya tidak dobel
    stopStatusPolling();

    pollingIntervalId = setInterval(async () => {
        // Hanya poll jika sedang di halaman dashboard
        if (window.location.hash !== '#dashboard') {
            stopStatusPolling();
            return;
        }

        try {
            // Ambil data laporan terbaru dari server via Fetch API
            const response = await requestAPI(`/api/reports/?tab=${currentTab}&page=${currentPage}`, 'GET');

            const latestResults = Array.isArray(response?.results)
                ? response.results
                : Array.isArray(response?.data?.results)
                    ? response.data.results
                    : [];

            // Bandingkan status setiap laporan dengan data yang sedang ditampilkan
            const hasStatusChange = latestResults.some(latestReport => {
                const displayed = allReports.find(r => Number(r.id) === Number(latestReport.id));
                // Jika ada laporan baru atau status berubah, tandai perlu refresh
                return !displayed || displayed.status !== latestReport.status;
            });

            // Jika jumlah laporan berubah (laporan baru ditambah/dihapus), juga perlu refresh
            const hasSizeChange = latestResults.length !== allReports.length;

            if (hasStatusChange || hasSizeChange) {
                // Update data lokal dengan data terbaru dari server
                allReports = latestResults;
                const count = Number(response?.count ?? response?.data?.count ?? 0);
                totalPages = count > 0 ? Math.ceil(count / 10) : 1;

                // Re-render kartu laporan tanpa flicker
                renderList();
                renderPagination();

                // Perbarui statistik ringkasan di sidebar kanan
                await loadSummaryStats();

                // Tampilkan notifikasi kecil ke citizen bahwa ada update status
                showStatusUpdateNotification();
            }
        } catch (error) {
            // Polling gagal (jaringan putus, dsb) — abaikan, coba lagi nanti
            console.warn('Polling status laporan gagal:', error);
        }
    }, POLLING_INTERVAL_MS);
}

/**
 * Hentikan polling yang sedang berjalan.
 */
function stopStatusPolling() {
    if (pollingIntervalId !== null) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
    }
}

/**
 * Tampilkan notifikasi kecil di pojok kanan atas selama 3 detik
 * saat ada perubahan status laporan dari admin.
 */
function showStatusUpdateNotification() {
    // Cegah notifikasi dobel
    const existingToast = document.getElementById('statusUpdateToast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'statusUpdateToast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background-color: #1e70cd;
        color: white;
        padding: 12px 18px;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(30, 112, 205, 0.35);
        font-size: 0.875rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideInRight 0.3s ease;
        max-width: 280px;
    `;
    toast.innerHTML = `
        <i class="bi bi-arrow-repeat" style="font-size: 1rem;"></i>
        Status laporan telah diperbarui oleh admin!
    `;

    // Inject keyframe animasi jika belum ada
    if (!document.getElementById('toastAnimStyle')) {
        const style = document.createElement('style');
        style.id = 'toastAnimStyle';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(110%); opacity: 0; }
                to   { transform: translateX(0);    opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0);    opacity: 1; }
                to   { transform: translateX(110%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Hilangkan otomatis setelah 3 detik dengan animasi keluar
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Ekspor agar bisa dipanggil dari router.js
window.startStatusPolling = startStatusPolling;
window.stopStatusPolling = stopStatusPolling;
// =========================================================
// END FETCH API AUTO-REFRESH
// =========================================================

function getReporterLabel() {
    return 'Warga Anonim';
}

function getStatusProgress(status) {
    const value = String(status || '').trim().toLowerCase();

    if (value === 'draft' || value === 'draf') {
        return { label: 'Draft', width: 20, color: 'warning', badgeClass: 'bg-warning-subtle text-warning-emphasis', progressClass: 'bg-warning', isDraft: true };
    }
    if (value === 'reported' || value === 'report' || value === 'submitted') {
        return { label: 'Reported', width: 40, color: 'dark', badgeClass: 'bg-dark text-white', progressClass: 'bg-dark', isDraft: false };
    }
    if (value === 'verified' || value === 'verifikasi' || value === 'review') {
        return { label: 'Verified', width: 65, color: 'primary', badgeClass: 'bg-primary-subtle text-primary-emphasis', progressClass: 'bg-primary', isDraft: false };
    }
    if (value === 'in_progress' || value === 'diproses' || value === 'processed' || value === 'proses' || value === 'progress') {
        return { label: 'In Progress', width: 75, color: 'warning', badgeClass: 'bg-warning-subtle text-warning-emphasis', progressClass: 'bg-warning', isDraft: false };
    }
    if (value === 'resolved' || value === 'selesai' || value === 'completed' || value === 'done' || value === 'finish') {
        return { label: 'Resolved', width: 100, color: 'success', badgeClass: 'bg-success-subtle text-success-emphasis', progressClass: 'bg-success', isDraft: false };
    }

    return { label: 'Reported', width: 40, color: 'dark', badgeClass: 'bg-dark text-white', progressClass: 'bg-dark', isDraft: false };
}

function renderList() {
    const listContainer = document.getElementById('listContainer');

    if (!listContainer) return;

    if (!allReports.length) {
        listContainer.innerHTML = `
            <div class="col-12 text-center text-muted p-5">
                <i class="bi bi-inbox fs-1"></i>
                <p class="mt-2 mb-0">Belum ada laporan untuk tab ini.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = allReports.map(report => {
        const progress = getStatusProgress(report.status);
        const isDraft = progress.isDraft;
        const canEdit = Boolean(report.is_owner) && isDraft;

        return `
            <article class="col-12 col-md-6 col-xl-4">
                <div class="card custom-card report-card p-3 h-100 shadow-sm">
                    <div class="d-flex justify-content-between align-items-start mb-2 gap-2 flex-wrap">
                        <h6 class="fw-bold text-dark mb-0 report-title flex-grow-1">${report.title || 'Judul laporan'}</h6>
                        <span class="badge ${progress.badgeClass} px-2 py-1 status-badge" style="white-space: nowrap; flex-shrink: 0;">${progress.label}</span>
                    </div>
                    <p class="text-secondary small mb-3 report-description">${report.description || 'Tidak ada deskripsi.'}</p>
                    <div class="small text-secondary mb-2 report-meta">Kategori: ${report.category || 'Umum'} · Lokasi: ${report.location || 'Belum ditentukan'}</div>
                    <div class="mb-3">
                        <div class="d-flex justify-content-between small text-secondary mb-1">
                            <span>Status laporan</span>
                            <strong>${progress.label}</strong>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar ${progress.progressClass}" role="progressbar" style="width: ${progress.width}%" aria-valuenow="${progress.width}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <div>
                            <div class="text-muted small">Pelapor: ${getReporterLabel(report)}</div>
                            <div class="text-muted small">ID: ${report.id || '-'}</div>
                        </div>
                        ${canEdit ? `<button type="button" class="btn btn-sm btn-outline-primary" onclick="editDraft(${report.id})">Edit</button>` : ''}
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');

    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    const pages = [];
    for (let i = 1; i <= totalPages; i += 1) {
        pages.push(`
            <button
                type="button"
                class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'}"
                data-page="${i}"
            >
                ${i}
            </button>
        `);
    }

    paginationContainer.innerHTML = `
        <div class="d-flex flex-wrap gap-2 justify-content-center mt-3">${pages.join('')}</div>
    `;

    paginationContainer.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', () => {
            const page = Number(button.dataset.page);
            loadDashboardData(currentTab, page);
        });
    });
}

function getReportModal() {
    return document.getElementById('reportModal');
}

function getCurrentUserId() {
    return localStorage.getItem('current_user_id') || '';
}

function isAdminUser() {
    return localStorage.getItem('is_admin') === 'true';
}

function mergeFeedWithMyReports(feedItems, myItems) {
    const merged = [...feedItems, ...myItems]
        .filter(item => String(item?.status || '').toLowerCase() !== 'draft')
        .filter((item, index, array) => array.findIndex(candidate => Number(candidate.id) === Number(item.id)) === index);

    return merged.sort((a, b) => {
        const aTime = new Date(b.updated_at || b.updated_at || b.created_at || 0).getTime();
        const bTime = new Date(a.updated_at || a.updated_at || a.created_at || 0).getTime();
        return aTime - bTime;
    });
}

function normalizeStatus(status) {
    const value = String(status || '').trim().toUpperCase();
    if (value === 'DRAFT' || value === 'DRAF') return 'DRAFT';
    if (value === 'REPORTED' || value === 'REPORT' || value === 'SUBMITTED' || value === 'DIPROSES' || value === 'PROSES') return 'REPORTED';
    return value || 'DRAFT';
}

function closeReportModal() {
    const modalEl = getReportModal();
    if (!modalEl) return;

    const modal = window.bootstrap?.Modal?.getOrCreateInstance(modalEl);
    modal?.hide();
}

function fillReportForm(report = null) {
    const titleInput = document.getElementById('reportTitle');
    const descriptionInput = document.getElementById('reportDescription');
    const categoryInput = document.getElementById('reportCategory');
    const locationInput = document.getElementById('reportLocation');
    const reportIdInput = document.getElementById('reportId');

    if (titleInput) titleInput.value = report?.title || '';
    if (descriptionInput) descriptionInput.value = report?.description || '';
    if (categoryInput) categoryInput.value = report?.category || '';
    if (locationInput) locationInput.value = report?.location || '';
    if (reportIdInput) reportIdInput.value = report?.id || '';
}

export function editDraft(id) {
    const report = allReports.find(item => Number(item.id) === Number(id));

    if (!report) {
        alert('Data laporan tidak ditemukan.');
        return;
    }

    editingReportId = Number(id);
    fillReportForm(report);

    const modalEl = getReportModal();
    if (!modalEl) return;

    const modal = window.bootstrap?.Modal?.getOrCreateInstance(modalEl);
    modal?.show();
}

window.editDraft = editDraft;

async function submitReport(status) {
    const titleInput = document.getElementById('reportTitle');
    const descriptionInput = document.getElementById('reportDescription');
    const categoryInput = document.getElementById('reportCategory');
    const locationInput = document.getElementById('reportLocation');
    const reportForm = document.getElementById('reportForm');

    if (!titleInput || !descriptionInput || !categoryInput || !locationInput || !reportForm) return;

    const payload = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        category: categoryInput.value.trim() || 'Umum',
        location: locationInput.value.trim() || 'Lokasi belum ditentukan',
        status: normalizeStatus(status)
    };

    if (!payload.title || !payload.description) {
        alert('Judul dan deskripsi wajib diisi.');
        return;
    }

    try {
        const endpoint = editingReportId ? `/api/reports/${editingReportId}/` : '/api/reports/';
        const method = editingReportId ? 'PUT' : 'POST';
        
        const result = await requestAPI(endpoint, method, payload);

        const isSuccess = result && (result.status === 200 || result.status === 201 || result.id);

        if (isSuccess) {
            closeReportModal();
            reportForm.reset();
            editingReportId = null;
            
            await loadDashboardData(currentTab, currentPage);
            await loadSummaryStats();
        } else {
            alert('Gagal menyimpan laporan. Periksa log backend Anda.');
        }
    } catch (error) {
        console.error('submitReport error:', error);
        const detail = error?.detail || error?.message || error?.error || 'Backend menolak request.';

        if (String(detail).toLowerCase().includes('token') || String(detail).toLowerCase().includes('expired') || String(detail).toLowerCase().includes('authentication credentials')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            alert('Sesi login Anda telah kadaluarsa. Silakan login kembali.');
            window.location.hash = '#login';
            return;
        }

        alert(`Terjadi kesalahan saat menyimpan laporan: ${detail}`);
    }
}

export async function loadSummaryStats() {
    try {
        const response = await requestAPI('/api/reports/?tab=my_reports&page_size=1000', 'GET');
        const items = response?.data?.results || response?.results || [];

        const draftCount = items.filter(item => {
            const status = String(item?.status || '').toLowerCase();
            return status === 'draft' || status === 'draf';
        }).length;

        const processedCount = items.filter(item => {
            const status = String(item?.status || '').toLowerCase();
            return status === 'reported' || status === 'report' || status === 'submitted'
                || status === 'verified' || status === 'verifikasi' || status === 'review'
                || status === 'in_progress' || status === 'diproses' || status === 'processed' || status === 'proses' || status === 'progress';
        }).length;

        const completedCount = items.filter(item => {
            const status = String(item?.status || '').toLowerCase();
            return status === 'resolved' || status === 'selesai' || status === 'completed' || status === 'done' || status === 'finish';
        }).length;

        const draftEl = document.getElementById('draftCount');
        const processedEl = document.getElementById('processedCount');
        const completedEl = document.getElementById('completedCount');

        if (draftEl) draftEl.textContent = draftCount;
        if (processedEl) processedEl.textContent = processedCount;
        if (completedEl) completedEl.textContent = completedCount;
    } catch (error) {
        console.error('loadSummaryStats error:', error);
    }
}

export async function loadDashboardData(tab = currentTab, page = currentPage) {
    if (tab !== currentTab) {
        page = 1;
    }
    currentTab = tab;
    currentPage = page;

    try {
        const response = await requestAPI(`/api/reports/?tab=${tab}&page=${page}`, 'GET');

        let results = Array.isArray(response?.results)
            ? response.results
            : Array.isArray(response?.data?.results)
                ? response.data.results
                : [];

        let count = Number(response?.count ?? response?.data?.count ?? 0);

        allReports = results;
        totalPages = count > 0 ? Math.ceil(count / 10) : 1;

        renderList();
        renderPagination();
        await loadSummaryStats();

        // Pastikan polling berjalan setelah data pertama berhasil dimuat
        startStatusPolling();
    } catch (error) {
        console.error('loadDashboardData error:', error);

        const listContainer = document.getElementById('listContainer');
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="col-12 text-center text-muted p-5">
                    <i class="bi bi-exclamation-triangle fs-1"></i>
                    <p class="mt-2 mb-0">Gagal memuat data laporan.</p>
                </div>
            `;
        }

        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) paginationContainer.innerHTML = '';
    }
}

function refreshDashboardIfNeeded() {
    if (window.location.hash === '#dashboard') {
        loadDashboardData('feed', 1);
    }
}

function attachReportModalEvents() {
    const modalEl = getReportModal();
    const btnDraft = document.getElementById('btnDraft');
    const btnSubmit = document.getElementById('btnSubmit');
    const createReportBtn = document.querySelector('[data-bs-target="#reportModal"]');

    if (createReportBtn && !createReportBtn.dataset.boundCreate) {
        createReportBtn.dataset.boundCreate = 'true';
        createReportBtn.addEventListener('click', () => {
            editingReportId = null;
            fillReportForm();
        });
    }

    if (modalEl && !modalEl.dataset.boundShown) {
        modalEl.dataset.boundShown = 'true';
        modalEl.addEventListener('shown.bs.modal', () => {
            if (editingReportId === null) {
                fillReportForm();
            }
        });
    }

    if (btnDraft && !btnDraft.dataset.boundDraft) {
        btnDraft.dataset.boundDraft = 'true';
        btnDraft.addEventListener('click', () => submitReport('DRAFT'));
    }

    if (btnSubmit && !btnSubmit.dataset.boundSubmit) {
        btnSubmit.dataset.boundSubmit = 'true';
        btnSubmit.addEventListener('click', () => submitReport('REPORTED'));
    }
}

window.loadDashboardData = loadDashboardData;
window.loadSummaryStats = loadSummaryStats;
window.attachReportModalEvents = attachReportModalEvents;

// Jalankan router begitu halaman web selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    handleRouting();
    refreshDashboardIfNeeded();
    attachReportModalEvents();
});

window.addEventListener('hashchange', () => {
    handleRouting();
    // Hentikan polling jika berpindah dari dashboard
    if (window.location.hash !== '#dashboard') {
        stopStatusPolling();
    }
    refreshDashboardIfNeeded();
});