"""
Identity API Endpoints
Handles DID creation and management
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from fhir.models import Patient, Practitioner
from identity import get_did_manager, DIDAuthentication

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_patient_did(request):
    """
    Create a new DID for a patient
    Public endpoint (no authentication required for registration)
    """
    try:
        data = request.data
        
        # Create DID
        did_manager = get_did_manager()
        did_result = did_manager.create_did(entity_type='patient')
        
        # Create patient record
        patient = Patient.objects.create(
            did=did_result['did'],
            name=data.get('name', []),
            gender=data.get('gender', 'unknown'),
            birth_date=data.get('birth_date'),
            telecom=data.get('telecom', []),
            address=data.get('address', []),
        )
        
        logger.info(f"Created patient with DID: {did_result['did']}")
        
        return Response({
            'patient_id': str(patient.id),
            'did': did_result['did'],
            'public_key': did_result['public_key'],
            'private_key': did_result['private_key'],  # User must store securely!
            'warning': 'Store your private key securely. It cannot be recovered if lost.',
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error creating patient DID: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_provider_did(request):
    """
    Create a new DID for a healthcare provider
    """
    try:
        data = request.data
        
        # Create DID
        did_manager = get_did_manager()
        did_result = did_manager.create_did(entity_type='provider')
        
        # Create practitioner record
        practitioner = Practitioner.objects.create(
            did=did_result['did'],
            name=data.get('name', []),
            gender=data.get('gender'),
            telecom=data.get('telecom', []),
            address=data.get('address', []),
            qualification=data.get('qualification', []),
        )
        
        logger.info(f"Created provider with DID: {did_result['did']}")
        
        return Response({
            'practitioner_id': str(practitioner.id),
            'did': did_result['did'],
            'public_key': did_result['public_key'],
            'private_key': did_result['private_key'],
            'warning': 'Store your private key securely. It cannot be recovered if lost.',
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error creating provider DID: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def resolve_did(request):
    """
    Resolve a DID to its document
    """
    try:
        did = request.query_params.get('did')
        
        if not did:
            return Response({
                'error': 'did parameter required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        did_manager = get_did_manager()
        did_document = did_manager.resolve_did(did)
        
        if not did_document:
            return Response({
                'error': 'DID not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(did_document)
        
    except Exception as e:
        logger.error(f"Error resolving DID: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get profile for authenticated DID
    """
    try:
        user_did = request.user.did
        
        # Try to find as patient
        try:
            patient = Patient.objects.get(did=user_did)
            return Response({
                'type': 'patient',
                'id': str(patient.id),
                'did': patient.did,
                'name': patient.name,
                'gender': patient.gender,
                'birth_date': patient.birth_date,
            })
        except Patient.DoesNotExist:
            pass
        
        # Try to find as provider
        try:
            provider = Practitioner.objects.get(did=user_did)
            return Response({
                'type': 'provider',
                'id': str(provider.id),
                'did': provider.did,
                'name': provider.name,
                'qualification': provider.qualification,
            })
        except Practitioner.DoesNotExist:
            pass
        
        return Response({
            'error': 'Profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
