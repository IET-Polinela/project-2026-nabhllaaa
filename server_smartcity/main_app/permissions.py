from rest_framework import permissions

class IsOwnerAndDraftOrReadOnly(permissions.BasePermission):
    """
    Custom permission untuk memastikan hanya pemilik laporan yang bisa mengedit,
    dan itu pun hanya jika status laporan masih 'DRAFT'.
    Namun, Admin/Staff diberikan pengecualian agar bisa mengubah status.
    """
    def has_object_permission(self, request, view, obj):
        # Jika cuma numpang lewat/baca data (GET, HEAD, OPTIONS), semua boleh
        if request.method in permissions.SAFE_METHODS:
            return True

        # === PINTU DARURAT UNTUK ADMIN ===
        # Jika user yang sedang login adalah Admin atau Staff, LANGSUNG IZINKAN (True)
        # Jadi Admin tidak akan diperiksa apakah dia pemilik laporan atau bukan.
        if (
            getattr(request.user, 'is_admin', False) or
            request.user.is_superuser or
            request.user.is_staff
        ):
            return True

        # === ATURAN UNTUK WARGA BIASA (CITIZEN) ===
        # Harus dipastikan dia adalah pemilik laporan DAN statusnya wajib DRAFT
        return obj.reporter == request.user and obj.status == 'DRAFT'
