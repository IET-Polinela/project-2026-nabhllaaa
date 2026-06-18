from django.urls import include, path
from main_app import views
from django.contrib import admin
from django.contrib.auth import views as auth_views
from usermanagement_24782022.views import CustomTokenObtainPairView, register
from rest_framework_simplejwt.views import (
    TokenRefreshView
)
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from django_scalar.views import scalar_viewer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main_app.urls')),
    path('about/', include('about.urls')),
    path('contacts/', include('contacts.urls')),
    path('add/', views.ReportCreateView.as_view(), name='add_report'),
    path('edit/<int:pk>/', views.ReportUpdateView.as_view(), name='edit_report'),
    path('delete/<int:pk>/', views.ReportDeleteView.as_view(), name='delete_report'),
    path('detail/<int:pk>/', views.ReportDetailView.as_view(), name='report_detail'),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('register/', register, name='register'),
    path('dashboard/', include('dashboard_24782022.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('main_app.api_urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/swagger/',
            SpectacularSwaggerView.as_view(url_name='schema'),name='swagger-ui'),
    path('api/docs/scalar/', scalar_viewer, name='scalar-ui'),
]