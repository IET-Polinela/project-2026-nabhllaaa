from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from main_app.models import Report

# ─────────────────────────────────────────────────────────────────────────────
# PENJELASAN: get_user_model()
# ─────────────────────────────────────────────────────────────────────────────
# Django mendukung custom user model melalui setting AUTH_USER_MODEL.
# Pada proyek ini, user model kustom didefinisikan di usermanagement.User.
# Menggunakan get_user_model() memastikan kita selalu mereferensikan model
# user yang benar, bukan django.contrib.auth.models.User bawaan.
# ─────────────────────────────────────────────────────────────────────────────
User = get_user_model()

# =============================================================================
# MODUL 4: PENGUJIAN FUNGSIONALITAS DASAR & VALIDASI INPUT
# =============================================================================
# Fokus: Memastikan fungsi CRUD (Create, Read, Update, Delete) berjalan normal,
# validasi input wajib ditegakkan, dan keamanan dari serangan injeksi (XSS).
#
# KONSEP KUNCI:
#   - Serializer DRF secara otomatis memvalidasi field yang required
#   - Django template engine secara default melakukan HTML escaping
#   - SearchFilter DRF melakukan pencarian berbasis teks di field yang
#     terdaftar pada search_fields
# =============================================================================

class CRUDAndValidationTests(APITestCase):
    """
    Kelas pengujian untuk fungsionalitas dasar dan validasi input.

    Menguji pembuatan data baru (CREATE), validasi field wajib, pertahanan
    terhadap serangan XSS, dan fitur pencarian/filter data.
    """

    def setUp(self):
        """
        Persiapan: Buat warga dan autentikasi untuk test CRUD.
        """
        self.warga = User.objects.create_user(
            username='warga_crud', password='TestPass123!', is_admin=False
        )
        # force_authenticate memastikan semua request di test ini terautentikasi
        self.client.force_authenticate(user=self.warga)

# ─────────────────────────────────────────────────────────────────────────
    # FT-01: Membuat Laporan Baru dengan Data Lengkap
    # ─────────────────────────────────────────────────────────────────────────
    def test_FT_01_buat_laporan_dengan_data_lengkap(self):
        """
        [FT-01] Mengirim data laporan baru dengan seluruh kolom (field)
        terisi lengkap dan benar.

        SKENARIO:
            Warga mengirim POST request ke endpoint /api/report/ dengan
            semua field wajib terisi: title, category, description, location.

        HASIL YANG DIHARAPKAN:
            Basis data berhasil menyimpan record baru dan API mengembalikan
            status HTTP 201 Created.

        PENJELASAN TEKNIS:
            Method perform_create() di ViewSet otomatis mengisi field
            reporter dengan request.user, sehingga warga tidak perlu
            mengirim field reporter secara manual.
        """
        # ARRANGE: Tentukan URL endpoint dan siapkan payload data pelaporan lengkap
        try:
            url = reverse('report-list')
        except:
            url = '/api/report/'

        payload = {
            'title': 'Tiang Listrik Roboh',
            'category': 'Infrastruktur',
            'description': 'Tiang listrik hampir roboh menghalangi jalan utama kampus.',
            'location': 'Dekat Gedung Baru TRI',
            'status': 'DRAFT'
        }

        # ACT: Kirim POST request menggunakan client API terautentikasi
        response = self.client.post(url, payload, format='json')

        # ASSERT: Validasi respons HTTP 201 Created dan pengecekan integritas data di DB
        self.assertEqual(
            response.status_code, 
            status.HTTP_201_CREATED, 
            "Pembuatan laporan dengan data lengkap seharusnya mengembalikan HTTP 201 Created."
        )
        
        # Pastikan data tersimpan secara fisik di database
        self.assertEqual(Report.objects.filter(title='Tiang Listrik Roboh').count(), 1)
        
        # Pastikan relasi reporter otomatis terikat ke user 'warga_crud' yang sedang login
        laporan_terbuat = Report.objects.get(title='Tiang Listrik Roboh')
        self.assertEqual(
            laporan_terbuat.reporter, 
            self.warga, 
            "Field reporter harus diisi otomatis oleh server dengan user yang sedang login."
        )

    # ─────────────────────────────────────────────────────────────────────────
    # FT-02: Laporan Ditolak Jika Judul Kosong
    # ─────────────────────────────────────────────────────────────────────────
    def test_FT_02_ditolak_jika_judul_kosong(self):
        """
        [FT-02] Mengirim data pembuatan laporan baru dengan mengosongkan
        kolom judul (title).

        SKENARIO:
            Warga mengirim POST request TANPA field title.

        HASIL YANG DIHARAPKAN:
            Sistem menolak input dan mengembalikan HTTP 400 Bad Request
            beserta pesan error spesifik untuk kolom wajib.

        PENJELASAN TEKNIS:
            Django ModelSerializer secara otomatis memvalidasi field yang
            tidak memiliki blank=True dan null=True. Field `title` dengan
            max_length=200 tanpa blank=True akan di-reject jika kosong.
        """
        # ARRANGE: Siapkan URL dan payload TANPA menyertakan kunci 'title'
        try:
            url = reverse('report-list')
        except:
            url = '/api/report/'

        payload = {
            'category': 'Infrastruktur',
            'description': 'Deskripsi tanpa judul pelaporan.',
            'location': 'Lokasi Pelaporan',
            'status': 'DRAFT'
        }

        # ACT: Jalankan pengiriman request POST ke server
        response = self.client.post(url, payload, format='json')

        # ASSERT: Validasi kegagalan input (HTTP 400 Bad Request)
        self.assertEqual(
            response.status_code, 
            status.HTTP_400_BAD_REQUEST, 
            "Server seharusnya mengembalikan HTTP 400 Bad Request jika field title absen."
        )
        
        # Validasi bahwa serializer mendeteksi error pada field 'title'
        self.assertIn(
            'title', 
            response.data, 
            "Respons pesan error dari server harus mengindikasikan kegagalan validasi pada kolom 'title'."
        )

    # ─────────────────────────────────────────────────────────────────────────
    # FT-03: Laporan Ditolak Jika Deskripsi Kosong
    # ─────────────────────────────────────────────────────────────────────────
    def test_FT_03_ditolak_jika_deskripsi_kosong(self):
        """
        [FT-03] Mengirim data pembuatan laporan baru dengan mengosongkan
        kolom deskripsi (description).

        SKENARIO:
            Warga mengirim POST request TANPA field description.

        HASIL YANG DIHARAPKAN:
            Sistem menolak input dan mengembalikan HTTP 400 Bad Request.
        """
        # ARRANGE: Siapkan URL dan payload TANPA menyertakan kunci 'description'
        try:
            url = reverse('report-list')
        except:
            url = '/api/report/'

        payload = {
            'title': 'Judul Laporan Valid',
            'category': 'Kebersihan',
            'location': 'Samping Kantin',
            'status': 'DRAFT'
        }

        # ACT: Kirim data tidak lengkap tersebut ke API
        response = self.client.post(url, payload, format='json')

        # ASSERT: Pastikan server mendeteksi anomali kolom wajib dan melemparkan kode 400
        self.assertEqual(
            response.status_code, 
            status.HTTP_400_BAD_REQUEST, 
            "Server seharusnya mengembalikan HTTP 400 Bad Request jika deskripsi dikosongkan."
        )
        self.assertIn(
            'description', 
            response.data, 
            "Respons data dari server harus secara eksplisit menunjuk error pada variabel 'description'."
        )