from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('reports/manage/', views.ReportListView.as_view(), name='report_list'),
    path('update-status/<int:pk>/', views.ReportUpdateStatusView.as_view(), name='update_status'),
    path('search/', views.search_reports, name='report_search'),
    path('api/report-detail/<int:pk>/', views.report_detail_api, name='report_detail_api'),
    path('api/', include('main_app.api_urls')),
    path('update-status/<int:pk>/', views.ReportUpdateStatusView.as_view(), name='update_status'),
    path('update-status/<int:pk>/', views.ReportUpdateStatusView.as_view(), name='update_report_status'),  # ← baris baru ini
    path('reports/', include('dashboard_24782022.urls')),
]