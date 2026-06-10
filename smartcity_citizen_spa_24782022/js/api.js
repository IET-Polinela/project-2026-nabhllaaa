const BASE_URL = 'http://103.151.63.84:8005'; // URL Backend Django kamu co

// Fungsi global untuk nembak API secara otomatis membawa token
export async function requestAPI(endpoint, method = 'GET', bodyData = null) {
    // Ambil access token yang tersimpan di localStorage
    const accessToken = localStorage.getItem('access_token');
    
    // Setup header default
    const headers = {
        'Content-Type': 'application/json',
    };

    // Kalau di localStorage ada token, otomatis pasang ke Header Authorization
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Setup konfigurasi request fetch
    const config = {
        method: method,
        headers: headers
    };

    // Kalau ada data payload (seperti username/password pas login), masukkan ke body
    if (bodyData) {
        config.body = JSON.stringify(bodyData);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        
        // Jika response error (401, 400, 403, dll) tetap lempar datanya biar ketahuan erornya
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Permintaan gagal.' }));

            if (response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }

            throw errorData;
        }

        // Jika method DELETE biasanya tidak mengembalikan JSON, handle aman
        if (method === 'DELETE') return { success: true };

        return await response.json();
    } catch (error) {
        console.error("API Request Error:", error);
        throw error;
    }
}