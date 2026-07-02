from rest_framework.routers import DefaultRouter
from .api_views import ReportViewSet, api_register
from django.urls import path

router = DefaultRouter()
router.register(r'report', ReportViewSet, basename='report')

urlpatterns = [
    path('register/', api_register, name='api_register'),
] + router.urls