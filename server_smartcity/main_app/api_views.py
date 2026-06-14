from rest_framework import viewsets, permissions, exceptions
from rest_framework.pagination import PageNumberPagination
from .models import Report
from .serializers import ReportSerializer, normalize_report_status
from .permissions import IsOwnerAndDraftOrReadOnly
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from usermanagement_24782022.forms import RegisterForm

def is_admin_user(user):
    return bool(
        getattr(user, 'is_admin', False) or
        getattr(user, 'is_staff', False) or
        getattr(user, 'is_superuser', False)
    )

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

# Aktivasi PageNumberPagination
class ReportPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        # Jika page yang diminta melebihi total halaman,
        # kembalikan halaman terakhir yang valid (bukan 404)
        from django.core.paginator import InvalidPage
        page_size = self.get_page_size(request)
        if not page_size:
            return None
        paginator = self.django_paginator_class(queryset, page_size)
        page_number = self.get_page_number(request, paginator)
        try:
            self.page = paginator.page(page_number)
        except InvalidPage:
            # Fallback ke halaman pertama jika page tidak valid
            self.page = paginator.page(1)
        self.request = request
        if paginator.num_pages > 1 and self.template is not None:
            self.display_page_controls = True
        return list(self.page)


# --- KELAS PERMISSION KHUSUS: Hanya Untuk Warga (Bukan Admin) ---
class IsCitizenOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Mengembalikan True HANYA jika user yang login BUKAN admin/staff
        return not is_admin_user(request.user)


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    pagination_class = ReportPagination

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
        submitted_status = normalize_report_status(self.request.data.get('status', 'DRAFT'))
        serializer.save(reporter=self.request.user, status=submitted_status)

    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q

        base_queryset = Report.objects.all().order_by('-updated_at')
        tab = self.request.query_params.get('tab', None)
        query = self.request.query_params.get('q') or self.request.query_params.get('search')

        if user.is_anonymous:
            queryset = base_queryset.exclude(status='DRAFT')
        elif is_admin_user(user):
            # Admin/staff: TIDAK BOLEH melihat laporan berstatus DRAFT milik citizen,
            # baik di list maupun detail (retrieve).
            queryset = base_queryset.exclude(status='DRAFT')
        elif tab == 'my_reports':
            queryset = base_queryset.filter(reporter=user)
        elif tab == 'feed':
            # Feed publik harus sama untuk semua citizen:
            # tampilkan semua laporan non-DRAFT, termasuk milik user sendiri
            # dan laporan tanpa reporter (reporter=NULL / dummy data).
            queryset = base_queryset.exclude(status='DRAFT')
        else:
            queryset = base_queryset.filter(Q(reporter=user) | ~Q(status='DRAFT'))

        if query:
            words = query.split()
            q_objects = Q()
            for word in words:
                q_objects &= (
                    Q(title__icontains=word) |
                    Q(category__icontains=word) |
                    Q(description__icontains=word) |
                    Q(location__icontains=word)
                )
            queryset = queryset.filter(q_objects)

        return queryset

    def get_object(self):
        """
        Override get_object agar admin yang mencoba mengakses
        /api/reports/<id>/ dengan status DRAFT mendapat 404,
        bukan 403 — konsisten dengan queryset yang sudah di-exclude.
        """
        obj = super().get_object()
        user = self.request.user
        if is_admin_user(user) and obj.status == 'DRAFT':
            from rest_framework.exceptions import NotFound
            raise NotFound("Laporan dengan status DRAFT tidak dapat diakses oleh admin.")
        return obj

    def get_serializer_class(self):
        user = self.request.user
        if self.action in ['update', 'partial_update'] and is_admin_user(user):
            from rest_framework import serializers
            class AdminStatusOnlySerializer(serializers.ModelSerializer):
                class Meta:
                    model = Report
                    fields = ['status']
                def to_internal_value(self, data):
                    mutable_data = data.copy()
                    if 'status' in mutable_data:
                        mutable_data['status'] = normalize_report_status(mutable_data['status'])
                    return super().to_internal_value(mutable_data)
                def validate_status(self, value):
                    if value == 'DRAFT':
                        # Tambahkan kata 'serializers.' di depan ValidationError
                        raise serializers.ValidationError("Admin dilarang mengubah status laporan menjadi DRAFT!")
                    return value

            return AdminStatusOnlySerializer
        return self.serializer_class
