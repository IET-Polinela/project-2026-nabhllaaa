from django.urls import include, path
from main_app import views

urlpatterns = [
    path('', include('main_app.urls')),
    path('about/', include('about.urls')),
    path('contacts/', include('contacts.urls')),
    path('add/', views.ReportCreateView.as_view(), name='add_report'),
    path('edit/<int:pk>/', views.ReportUpdateView.as_view(), name='edit_report'),
    path('delete/<int:pk>/', views.ReportDeleteView.as_view(), name='delete_report'),
    path('detail/<int:pk>/', views.ReportDetailView.as_view(), name='report_detail'),
]