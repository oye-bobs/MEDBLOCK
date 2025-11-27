"""
Medical Records API Endpoints
Handles CRUD operations for FHIR resources with blockchain integration
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from fhir.models import (
    Patient, Practitioner, Observation,
    DiagnosticReport, MedicationRequest, Encounter,
    ConsentRecord, AccessLog
)
from blockchain import get_cardano_client, get_hash_manager
from identity import DIDAuthentication

logger = logging.getLogger(__name__)


class ObservationViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Observation resources (lab results, vitals)
    """
    queryset = Observation.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [DIDAuthentication]
    
    def create(self, request, *args, **kwargs):
        """
        Create new observation and record hash on blockchain
        """
        try:
            # Extract data from request
            data = request.data
            
            # Create observation instance
            observation = Observation.objects.create(
                patient_id=data['patient_id'],
                practitioner_id=data.get('practitioner_id'),
                status=data.get('status', 'final'),
                code=data['code'],
                value_quantity=data.get('value_quantity'),
                effective_datetime=data.get('effective_datetime', timezone.now()),
            )
            
            # Generate hash
            hash_manager = get_hash_manager()
            record_hash = hash_manager.generate_record_hash(observation)
            
            # Submit to blockchain
            cardano_client = get_cardano_client()
            tx_id = cardano_client.submit_record_hash(
                record_hash=record_hash,
                record_type='observation',
                patient_did=observation.patient.did,
                provider_did=observation.practitioner.did if observation.practitioner else None,
            )
            
            # Update observation with blockchain info
            observation.blockchain_hash = record_hash
            observation.blockchain_tx_id = tx_id
            observation.save()
            
            logger.info(f"Created observation {observation.id} with hash {record_hash[:16]}...")
            
            return Response({
                'id': str(observation.id),
                'blockchain_hash': record_hash,
                'blockchain_tx_id': tx_id,
                'status': 'success'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating observation: {e}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve observation with consent verification and access logging
        """
        try:
            observation = self.get_object()
            
            # Verify consent
            accessor_did = request.user.did
            patient = observation.patient
            
            # Check if accessor has active consent
            active_consent = ConsentRecord.objects.filter(
                patient=patient,
                practitioner__did=accessor_did,
                status='active',
                expires_at__gt=timezone.now()
            ).first()
            
            if not active_consent and accessor_did != patient.did:
                return Response({
                    'error': 'No active consent for accessing this record'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Verify hash integrity
            hash_manager = get_hash_manager()
            current_hash = hash_manager.generate_record_hash(observation)
            
            if current_hash != observation.blockchain_hash:
                logger.error(f"Hash mismatch for observation {observation.id}!")
                return Response({
                    'error': 'Data integrity check failed - record may have been tampered with'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Log access to blockchain
            cardano_client = get_cardano_client()
            access_tx_id = cardano_client.submit_access_log(
                accessor_did=accessor_did,
                patient_did=patient.did,
                resource_type='Observation',
                resource_id=str(observation.id),
                action='read'
            )
            
            # Create access log record
            AccessLog.objects.create(
                accessor_did=accessor_did,
                patient=patient,
                resource_type='Observation',
                resource_id=observation.id,
                action='read',
                consent=active_consent,
                blockchain_tx_id=access_tx_id,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
            )
            
            # Return observation data
            return Response({
                'id': str(observation.id),
                'patient_id': str(observation.patient.id),
                'status': observation.status,
                'code': observation.code,
                'value_quantity': observation.value_quantity,
                'effective_datetime': observation.effective_datetime,
                'blockchain_hash': observation.blockchain_hash,
                'blockchain_tx_id': observation.blockchain_tx_id,
                'hash_verified': True,
            })
            
        except Exception as e:
            logger.error(f"Error retrieving observation: {e}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def patient_observations(self, request):
        """
        Get all observations for a patient (requires consent)
        """
        patient_id = request.query_params.get('patient_id')
        
        if not patient_id:
            return Response({
                'error': 'patient_id parameter required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            patient = Patient.objects.get(id=patient_id)
            accessor_did = request.user.did
            
            # Check consent
            if accessor_did != patient.did:
                active_consent = ConsentRecord.objects.filter(
                    patient=patient,
                    practitioner__did=accessor_did,
                    status='active',
                    expires_at__gt=timezone.now()
                ).first()
                
                if not active_consent:
                    return Response({
                        'error': 'No active consent'
                    }, status=status.HTTP_403_FORBIDDEN)
            
            # Get observations
            observations = Observation.objects.filter(patient=patient).order_by('-effective_datetime')
            
            return Response({
                'count': observations.count(),
                'observations': [
                    {
                        'id': str(obs.id),
                        'code': obs.code,
                        'status': obs.status,
                        'effective_datetime': obs.effective_datetime,
                        'blockchain_hash': obs.blockchain_hash,
                    }
                    for obs in observations
                ]
            })
            
        except Patient.DoesNotExist:
            return Response({
                'error': 'Patient not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving patient observations: {e}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
