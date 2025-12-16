"""
Consent Management API Endpoints
Handles patient consent for data access via smart contracts
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

from fhir.models import Patient, Practitioner, ConsentRecord
from identity import DIDAuthentication

logger = logging.getLogger(__name__)


class ConsentViewSet(viewsets.ModelViewSet):
    """
    API endpoints for consent management
    """
    queryset = ConsentRecord.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [DIDAuthentication]
    
    @action(detail=False, methods=['post'])
    def grant(self, request):
        """
        Grant consent to a provider
        Deploys Plutus smart contract on Cardano
        """
        try:
            data = request.data
            
            # Get patient (must be the requester)
            patient_did = request.user.did
            patient = Patient.objects.get(did=patient_did)
            
            # Get provider
            provider_did = data['provider_did']
            provider = Practitioner.objects.get(did=provider_did)
            
            # Parse expiration
            duration_hours = data.get('duration_hours', 72)  # Default 72 hours
            expires_at = timezone.now() + timedelta(hours=duration_hours)
            
            # Scope (what records can be accessed)
            scope = data.get('scope', ['all'])  # Default: all records
            
            # TODO: Deploy Plutus consent smart contract
            # For now, create mock contract address and transaction
            contract_address = f"addr_test1_consent_{patient.id}_{provider.id}"
            consent_tx_id = f"consent_tx_{patient_did[:8]}_{provider_did[:8]}"
            
            # Create consent record
            consent = ConsentRecord.objects.create(
                patient=patient,
                practitioner=provider,
                status='active',
                scope=scope,
                expires_at=expires_at,
                smart_contract_address=contract_address,
                consent_tx_id=consent_tx_id,
            )
            
            logger.info(f"Granted consent: {patient_did} -> {provider_did}")
            
            return Response({
                'consent_id': str(consent.id),
                'status': 'active',
                'expires_at': expires_at.isoformat(),
                'smart_contract_address': contract_address,
                'consent_tx_id': consent_tx_id,
                'scope': scope,
            }, status=status.HTTP_201_CREATED)
            
        except Patient.DoesNotExist:
            return Response({
                'error': 'Patient not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Practitioner.DoesNotExist:
            return Response({
                'error': 'Provider not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error granting consent: {e}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """
        Revoke consent
        Updates smart contract on Cardano
        """
        try:
            consent = self.get_object()
            
            # Verify requester is the patient
            if request.user.did != consent.patient.did:
                return Response({
                    'error': 'Only the patient can revoke consent'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update consent status
            consent.status = 'revoked'
            consent.revoked_at = timezone.now()
            consent.save()
            
            # TODO: Update smart contract on blockchain
            
            logger.info(f"Revoked consent: {consent.id}")
            
            return Response({
                'consent_id': str(consent.id),
                'status': 'revoked',
                'revoked_at': consent.revoked_at.isoformat(),
            })
            
        except Exception as e:
            logger.error(f"Error revoking consent: {e}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get all active consents for the authenticated user
        """
        try:
            user_did = request.user.did
            
            # Check if user is patient or provider
            try:
                patient = Patient.objects.get(did=user_did)
                consents = ConsentRecord.objects.filter(
                    patient=patient,
                    status='active',
                    expires_at__gt=timezone.now()
                )
                role = 'patient'
            except Patient.DoesNotExist:
                try:
                    provider = Practitioner.objects.get(did=user_did)
                    consents = ConsentRecord.objects.filter(
                        practitioner=provider,
                        status='active',
                        expires_at__gt=timezone.now()
                    )
                    role = 'provider'
                except Practitioner.DoesNotExist:
                    return Response({
                        'error': 'User not found as patient or provider'
                    }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'role': role,
                'count': consents.count(),
                'consents': [
                    {
                        'id': str(c.id),
                        'patient_did': c.patient.did,
                        'provider_did': c.practitioner.did,
                        'granted_at': c.granted_at.isoformat(),
                        'expires_at': c.expires_at.isoformat(),
                        'scope': c.scope,
                        'smart_contract_address': c.smart_contract_address,
                    }
                    for c in consents
                ]
            })
            
        except Exception as e:
            logger.error(f"Error retrieving active consents: {e}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
