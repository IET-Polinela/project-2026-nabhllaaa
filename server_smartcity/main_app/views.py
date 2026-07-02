from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView, View
from .models import Report
from django.urls import reverse_lazy
from django.views import View
from .forms import ReportForm
from django.contrib import messages
from django.shortcuts import redirect
from django.http import JsonResponse, Http404, HttpResponseForbidden
from django.core.exceptions import PermissionDenied
from .models import Report
from django.db.models import Q

ALLOWED_TRANSITIONS = {
    'REPORTED': ['VERIFIED'],
    'VERIFIED': ['IN_PROGRESS'],
    'IN_PROGRESS': ['RESOLVED'],
}

def search_reports(request):
    is_admin_user = request.user.is_authenticated and (
        request.user.is_superuser or request.user.is_staff or getattr(request.user, 'is_admin', False)
    )
    if not is_admin_user:
        return HttpResponseForbidden("Akses ditolak! Hanya admin yang bisa melakukan pencarian ini.")

    query = request.GET.get('q', '')
    reports = Report.objects.exclude(status='DRAFT')

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
        reports = reports.filter(q_objects)

    data = list(reports.values(
        'id', 'title', 'category', 'description', 'location', 'status'
    ))
    return JsonResponse({'results': data})

class AdminRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, "Silakan login terlebih dahulu.")
            return redirect('login')

        if not request.user.is_admin:
            messages.error(request, "Akses ditolak! Hanya admin yang bisa melakukan aksi ini.")
            return redirect('home')

        return super().dispatch(request, *args, **kwargs)

class HomeView(ListView):
    """Halaman utama publik — bisa diakses siapa saja tanpa login."""
    model = Report
    template_name = 'main_app/home.html'
    context_object_name = 'reports'

    def get_queryset(self):
        return Report.objects.exclude(status='DRAFT').order_by('-updated_at')

class ReportListView(AdminRequiredMixin, ListView):
    """Panel manajemen laporan — khusus admin."""
    model = Report
    template_name = 'main_app/report_list.html'
    context_object_name = 'reports'

    def get_queryset(self):
        return Report.objects.exclude(status='DRAFT').order_by('-updated_at')

class ReportDetailView(AdminRequiredMixin, DetailView):
    model = Report
    template_name = 'linkoncity_app/report_detail.html'
    context_object_name = 'report'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['next_statuses'] = ALLOWED_TRANSITIONS.get(self.object.status, [])
        return context

class ReportCreateView(AdminRequiredMixin, CreateView):
    model = Report
    template_name = 'main_app/add_report.html'
    form_class = ReportForm
    success_url = reverse_lazy('report_list')

class ReportUpdateView(UpdateView):
    """
    Admin TIDAK diizinkan mengedit isi laporan warga.
    Perubahan status laporan harus lewat ReportUpdateStatusView, bukan lewat sini.
    """
    model = Report
    template_name = 'linkoncity_app/edit_report.html'
    form_class = ReportForm
    success_url = reverse_lazy('home')

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, "Silakan login terlebih dahulu.")
            return redirect('login')

        if not request.user.is_admin:
            messages.error(request, "Akses ditolak! Hanya admin yang bisa melakukan aksi ini.")
            return redirect('home')

        # Admin sudah lolos pengecekan di atas, tapi tetap dilarang mengedit
        # konten laporan warga.
        raise PermissionDenied("Admin tidak diizinkan mengedit laporan warga.")


class ReportDeleteView(DeleteView):
    """
    Admin TIDAK diizinkan menghapus laporan warga.
    """
    model = Report
    template_name = 'linkoncity_app/delete_report.html'
    success_url = reverse_lazy('home')

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, "Silakan login terlebih dahulu.")
            return redirect('login')

        if not request.user.is_admin:
            messages.error(request, "Akses ditolak! Hanya admin yang bisa melakukan aksi ini.")
            return redirect('home')

        raise PermissionDenied("Admin tidak diizinkan menghapus laporan warga.")

    def delete(self, request, *args, **kwargs):
        # Jaring pengaman tambahan kalau delete() dipanggil langsung
        # (melewati dispatch), misalnya lewat pemanggilan manual/skrip.
        raise PermissionDenied("Admin tidak diizinkan menghapus laporan warga.")

class ReportUpdateStatusView(View):
    def post(self, request, pk):
        if not request.user.is_authenticated or not request.user.is_admin:
            messages.error(request, "Akses ditolak! Hanya admin.")
            return redirect('home')

        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('new_status') or request.POST.get('status')
        allowed_next = ALLOWED_TRANSITIONS.get(report.status, [])

        if new_status not in allowed_next:
            messages.error(request, f"Transisi status dari {report.status} ke {new_status} tidak diizinkan.")
            return redirect('report_detail', pk=pk)

        report.status = new_status
        report.save()
        messages.success(request, "Status berhasil diperbarui.")
        return redirect('report_detail', pk=pk)

def report_detail_api(request, pk):
    try:
        report = Report.objects.get(pk=pk)
        return JsonResponse({
            "title": report.title,
            "category": report.category,
            "status": report.status,
            "created_at": report.created_at.strftime("%Y-%m-%d"),
            "description": report.description,
        })
    except Report.DoesNotExist:
        raise Http404("Laporan tidak ditemukan")