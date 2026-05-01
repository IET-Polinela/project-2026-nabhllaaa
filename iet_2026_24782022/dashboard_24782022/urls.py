from django.urls import path
from .views import DashboardView, dashboard_data, search_reports

urlpatterns = [
    path('', DashboardView.as_view(), name='dashboard'),
    path('data/', dashboard_data, name='dashboard_data'),
    path('search/', search_reports, name='live_search'),
]