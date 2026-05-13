from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.ReportListView.as_view(), name='home'),
    path('update-status/<int:pk>/', views.ReportUpdateStatusView.as_view(), name='update_status'),
    path('search/', views.search_reports, name='search_reports'),
    path('api/report-detail/<int:pk>/', views.report_detail_api, name='report_detail_api'),
    path('api/', include('main_app.api_urls')),
]