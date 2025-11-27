"""
Consent and Access Control Models
Tracks blockchain-based consent and access permissions
"""
from django.db import models
from fhir.models.resources import Patient, Practitioner
import uuid


class ConsentRecord(models.Model):
    """
    Tracks patient consent for data access
    Linked to Plutus smart contract on Cardano
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Parties
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='consents')
    practitioner = models.ForeignKey(Practitioner, on_delete=models.CASCADE, related_name='consents_received')
    
    # Consent details
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('revoked', 'Revoked'),
        ('pending', 'Pending'),
    ], default='pending')
    
    # Scope - what records are accessible
    scope = models.JSONField(default=list)  # List of resource types or specific IDs
    
    # Time bounds
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)
    
    # Blockchain proof
    smart_contract_address = models.CharField(max_length=255)
    consent_tx_id = models.CharField(max_length=255, unique=True)
    consent_nft_policy_id = models.CharField(max_length=56, null=True, blank=True)
    consent_nft_asset_name = models.CharField(max_length=64, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'consent_record'
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['practitioner', 'status']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"Consent {self.id} - Patient: {self.patient.did} -> Provider: {self.practitioner.did}"
    
    def is_active(self):
        """Check if consent is currently valid"""
        from django.utils import timezone
        return (
            self.status == 'active' and
            self.expires_at > timezone.now() and
            self.revoked_at is None
        )


class AccessLog(models.Model):
    """
    Immutable audit log of all data access events
    Each access is recorded on Cardano blockchain
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Who accessed what
    accessor_did = models.CharField(max_length=255, db_index=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='access_logs')
    
    # What was accessed
    resource_type = models.CharField(max_length=50)  # Observation, DiagnosticReport, etc.
    resource_id = models.UUIDField()
    
    # Access details
    action = models.CharField(max_length=20, choices=[
        ('read', 'Read'),
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
    ])
    
    # Consent reference
    consent = models.ForeignKey(ConsentRecord, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Timestamp
    accessed_at = models.DateTimeField(auto_now_add=True)
    
    # Blockchain proof
    blockchain_tx_id = models.CharField(max_length=255, unique=True)
    
    # IP and user agent for additional security
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'access_log'
        indexes = [
            models.Index(fields=['patient', 'accessed_at']),
            models.Index(fields=['accessor_did', 'accessed_at']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]
        ordering = ['-accessed_at']
    
    def __str__(self):
        return f"Access {self.id} - {self.accessor_did} accessed {self.resource_type} at {self.accessed_at}"
