from django.urls import path
from . import views

urlpatterns = [
    path('', views.ReportListView.as_view(), name='home'),
    path('update-status/<int:pk>/', views.ReportUpdateStatusView.as_view(), name='update_status'),
]