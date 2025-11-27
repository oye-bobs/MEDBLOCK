"""
MEDBLOCK URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

# Create router for API endpoints
router = routers.DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api-auth/', include('rest_framework.urls')),
]
