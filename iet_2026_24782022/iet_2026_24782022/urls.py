from django.urls import include, path
from main_app import views

urlpatterns = [
    path('', include('main_app.urls')),
    path('about/', include('about.urls')),
    path('contacts/', include('contacts.urls')),
    path('add/', views.add_report, name='add_report'),
    path('edit/<int:report_id>/', views.edit_report, name='edit_report'),
    path('delete/<int:report_id>/', views.delete_report, name='delete_report'),
    path('status/process/<int:report_id>/', views.update_status_process, name='status_process'),
    path('status/done/<int:report_id>/', views.update_status_done, name='status_done'),
]