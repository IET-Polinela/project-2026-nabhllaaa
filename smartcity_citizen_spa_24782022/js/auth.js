import { requestAPI } from './api.js';

export function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) return; // Jika form login gak ada di layar, batalkan

    loginForm.addEventListener('submit', async (event) => {
        // PENTING: Wajib mencegah halaman reload otomatis biar password gak bocor ke URL!
        event.preventDefault(); 

        // Ambil data inputan dari form login
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // Tembak data login ke endpoint JWT Token milik Django
            const data = await requestAPI('/api/token/', 'POST', {
                username: username,
                password: password
            });

            // Jika sukses (Status 200), simpan sepasang token ke localStorage browser
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('current_username', username.trim());

            const tokenPayload = JSON.parse(atob(data.access.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            localStorage.setItem('current_user_id', tokenPayload.user_id || tokenPayload.id || '');
            localStorage.setItem('is_admin', String(Boolean(tokenPayload.is_staff || tokenPayload.is_superuser || tokenPayload.role === 'admin')));

            alert('Login Berhasil! Selamat Datang Warga.');

            // Alihkan halaman SPA secara instan ke #dashboard tanpa reload
            window.location.hash = '#dashboard';

        } catch (error) {
            // Tampilkan pesan error kalau username/password salah
            alert('Login Gagal: ' + (error.detail || 'Username atau password salah!'));
        }
    });
}