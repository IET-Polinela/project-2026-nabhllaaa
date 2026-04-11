from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView, View
from .models import Report
from django.urls import reverse_lazy
from django.views import View
from .forms import ReportForm

class ReportListView(ListView):
    model = Report
    template_name = 'linkoncity_app/home.html'
    context_object_name = 'reports'

class ReportDetailView(DetailView):
    model = Report
    template_name = 'linkoncity_app/report_detail.html'
    context_object_name = 'report'

class ReportCreateView(CreateView):
    model = Report
    template_name = 'linkoncity_app/add_report.html'
    form_class = ReportForm
    success_url = reverse_lazy('home')

class ReportUpdateView(UpdateView):
    model = Report
    template_name = 'linkoncity_app/edit_report.html'
    form_class = ReportForm
    success_url = reverse_lazy('home')

    #Delete
class ReportDeleteView(DeleteView):
    model = Report
    template_name = 'linkoncity_app/delete_report.html'
    success_url = reverse_lazy('home')

class ReportUpdateStatusView(View):
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')
        report.status = new_status
        report.save()
        return redirect('home')