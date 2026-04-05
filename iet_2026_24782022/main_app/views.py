from django.shortcuts import render, redirect, get_object_or_404
from .models import Report
from .forms import ReportForm

def home(request):
    reports = Report.objects.all()
    return render(request, 'linkoncity_app/home.html', {'reports': reports})

def add_report(request):
    if request.method == 'POST':
        form = ReportForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = ReportForm()
    return render(request, 'linkoncity_app/add_report.html', {'form': form})

    #Update
def edit_report(request, report_id):
    report = Report.objects.get(id=report_id)
    if request.method == 'POST':
        form = ReportForm(request.POST, instance=report)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = ReportForm(instance=report)
    return render(request, 'linkoncity_app/edit_report.html', {'form': form})

    #Delete
def delete_report(request, report_id):
    report = Report.objects.get(id=report_id)
    if request.method == 'POST':
        report.delete()
        return redirect('home')
    return render(request, 'linkoncity_app/delete_report.html', {'report': report})

def update_status_process(request, report_id):
    report = get_object_or_404(Report, id=report_id)
    report.status = 'PROCESS'
    report.save()
    return redirect('home')


def update_status_done(request, report_id):
    report = get_object_or_404(Report, id=report_id)
    report.status = 'DONE'
    report.save()
    return redirect('home')