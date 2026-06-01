from rest_framework import viewsets, permissions, exceptions # <-- Pastikan ada exceptions
from .models import Report
from .serializers import ReportSerializer
from .permissions import IsOwnerAndDraftOrReadOnly
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from usermanagement_24782022.forms import RegisterForm

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny]) 
def api_register(request):
    form = RegisterForm(request.data) 
    if form.is_valid():
        user = form.save(commit=False)
        user.is_admin = False  
        user.save()
        return Response(
            {"message": "Registrasi via API berhasil! Akun Citizen siap digunakan."}, 
            status=status.HTTP_201_CREATED
        )
    return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

# --- KELAS PERMISSION KHUSUS: Hanya Untuk Warga (Bukan Admin) ---
class IsCitizenOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Mengembalikan True HANYA jika user yang login BUKAN admin/staff
        return not (request.user.is_superuser or request.user.is_staff)


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer 

    def get_permissions(self):
        # 1. POIN 3.b: Aksi CREATE (POST) hanya boleh diakses oleh yang SUDAH LOGIN dan DIA ADALAH WARGA (Bukan Admin)
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsCitizenOnly()]

        # 2. POIN 3.c: Edit & Delete hanya untuk pemilik + status DRAFT
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerAndDraftOrReadOnly()]
                
        # 3. POIN 3.a: List dan Detail bisa diakses oleh semua pengguna yang login
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user, status='DRAFT')

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous:
            return Report.objects.exclude(status='DRAFT')
        if user.is_superuser or user.is_staff:
            return Report.objects.exclude(status='DRAFT')
        
        from django.db.models import Q
        return Report.objects.filter(
            Q(reporter=user) | ~Q(status='DRAFT')
        )

    def get_serializer_class(self):
        user = self.request.user
        if self.action in ['update', 'partial_update'] and (user.is_superuser or user.is_staff):
            from rest_framework import serializers
            class AdminStatusOnlySerializer(serializers.ModelSerializer):
                class Meta:
                    model = Report
                    fields = ['status']
                def validate_status(self, value):
                    if value == 'DRAFT':
                        # Tambahkan kata 'serializers.' di depan ValidationError
                        raise serializers.ValidationError("Admin dilarang mengubah status laporan menjadi DRAFT!")
                    return value

            return AdminStatusOnlySerializer
        return self.serializer_class