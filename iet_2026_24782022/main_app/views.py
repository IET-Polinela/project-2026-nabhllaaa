from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView, View
from .models import Report
from django.urls import reverse_lazy
from django.views import View
from .forms import ReportForm
from django.contrib import messages
from django.shortcuts import redirect
from django.http import JsonResponse
from .models import Report
from django.db.models import Q

def search_reports(request):
    query = request.GET.get('q', '')

    reports = Report.objects.all()

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

class ReportListView(ListView):
    model = Report
    template_name = 'linkoncity_app/home.html'
    context_object_name = 'reports'

class ReportDetailView(DetailView):
    model = Report
    template_name = 'linkoncity_app/report_detail.html'
    context_object_name = 'report'

class ReportCreateView(AdminRequiredMixin, CreateView):
    model = Report
    template_name = 'linkoncity_app/add_report.html'
    form_class = ReportForm
    success_url = reverse_lazy('home')

class ReportUpdateView(AdminRequiredMixin, UpdateView):
    model = Report
    template_name = 'linkoncity_app/edit_report.html'
    form_class = ReportForm
    success_url = reverse_lazy('home')

    #Delete
class ReportDeleteView(AdminRequiredMixin, DeleteView):
    model = Report
    template_name = 'linkoncity_app/delete_report.html'
    success_url = reverse_lazy('home')

class ReportUpdateStatusView(View):
    def post(self, request, pk):
        if not request.user.is_authenticated or not request.user.is_admin:
            messages.error(request, "Akses ditolak! Hanya admin.")
            return redirect('home')

        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')
        report.status = new_status
        report.save()

        messages.success(request, "Status berhasil diperbarui.")
        return redirect('home')

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
        return JsonResponse({"error": "Not found"}, status=404)