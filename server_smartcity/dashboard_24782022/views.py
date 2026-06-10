from django.views.generic import TemplateView
from django.http import JsonResponse
from django.db.models import Count
from main_app.models import Report
from django.db.models import Q

class DashboardView(TemplateView):
    template_name = 'dashboard.html'
# dashboard/views.py[cite: 5]
def search_reports(request):
    query = request.GET.get('q', '')
    reports = Report.objects.all()

    if query:
        reports = reports.filter(
            Q(title__icontains=query) | Q(category__icontains=query)
        )

    # Pisahkan hasil search berdasarkan statusnya[cite: 5]
    results_reported = list(reports.filter(status='REPORTED')[:10].values('id', 'title', 'category'))
    results_resolved = list(reports.filter(status='RESOLVED')[:10].values('id', 'title', 'category'))

    return JsonResponse({
        'reported': results_reported,
        'resolved': results_resolved
    })

def dashboard_data(request):
    # status
    status_data = list(
        Report.objects.values('status')
        .annotate(total=Count('id'))
    )

    # kategori
    category_data = list(
        Report.objects.values('category')
        .annotate(total=Count('id'))
    )

    latest_reported = list(
        Report.objects.filter(status='REPORTED')
        .order_by('-created_at')[:5]
        .values('id', 'title', 'category', 'created_at')  # 🔥 TAMBAH ID
    )

    latest_resolved = list(
        Report.objects.filter(status='RESOLVED')
        .order_by('-created_at')[:5]
        .values('id', 'title', 'category', 'created_at')  # 🔥 TAMBAH ID
    )

    return JsonResponse({
        'status_data': status_data,
        'category_data': category_data,
        'latest_reported': latest_reported,
        'latest_resolved': latest_resolved,
    })
