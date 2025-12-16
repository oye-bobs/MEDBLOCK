"""
API URL Configuration
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .endpoints import records, consent, identity

# Create router
router = DefaultRouter()
router.register(r'observations', records.ObservationViewSet, basename='observation')
router.register(r'consents', consent.ConsentViewSet, basename='consent')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Identity endpoints
    path('identity/patient/create/', identity.create_patient_did, name='create-patient-did'),
    path('identity/provider/create/', identity.create_provider_did, name='create-provider-did'),
    path('identity/resolve/', identity.resolve_did, name='resolve-did'),
    path('identity/profile/', identity.get_profile, name='get-profile'),
]
