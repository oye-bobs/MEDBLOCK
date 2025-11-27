"""
FHIR R4 Data Models for MEDBLOCK
Implements core FHIR resources with Django ORM
"""
from django.db import models
from django.contrib.postgres.fields import JSONField
import uuid


class Patient(models.Model):
    """FHIR Patient Resource"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # DID for blockchain identity
    did = models.CharField(max_length=255, unique=True, db_index=True)
    
    # FHIR identifiers
    identifier = models.JSONField(default=list)  # List of identifiers
    
    # Demographics
    active = models.BooleanField(default=True)
    name = models.JSONField(default=list)  # HumanName
    telecom = models.JSONField(default=list)  # ContactPoint
    gender = models.CharField(max_length=20, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('unknown', 'Unknown'),
    ])
    birth_date = models.DateField(null=True, blank=True)
    deceased = models.BooleanField(default=False)
    deceased_datetime = models.DateTimeField(null=True, blank=True)
    
    # Contact information
    address = models.JSONField(default=list)  # Address
    marital_status = models.JSONField(null=True, blank=True)  # CodeableConcept
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Blockchain hash of this record
    blockchain_hash = models.CharField(max_length=64, null=True, blank=True)
    blockchain_tx_id = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        db_table = 'fhir_patient'
        indexes = [
            models.Index(fields=['did']),
            models.Index(fields=['birth_date']),
        ]
    
    def __str__(self):
        return f"Patient {self.id} - DID: {self.did}"


class Practitioner(models.Model):
    """FHIR Practitioner Resource (Healthcare Provider)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # DID for blockchain identity
    did = models.CharField(max_length=255, unique=True, db_index=True)
    
    # FHIR identifiers
    identifier = models.JSONField(default=list)
    
    # Demographics
    active = models.BooleanField(default=True)
    name = models.JSONField(default=list)  # HumanName
    telecom = models.JSONField(default=list)  # ContactPoint
    address = models.JSONField(default=list)  # Address
    gender = models.CharField(max_length=20, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    
    # Professional information
    qualification = models.JSONField(default=list)  # Qualifications
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fhir_practitioner'
        indexes = [
            models.Index(fields=['did']),
        ]
    
    def __str__(self):
        return f"Practitioner {self.id} - DID: {self.did}"


class Observation(models.Model):
    """FHIR Observation Resource (Lab results, vitals, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # References
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='observations')
    practitioner = models.ForeignKey(Practitioner, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('registered', 'Registered'),
        ('preliminary', 'Preliminary'),
        ('final', 'Final'),
        ('amended', 'Amended'),
        ('corrected', 'Corrected'),
        ('cancelled', 'Cancelled'),
        ('entered-in-error', 'Entered in Error'),
    ])
    
    # Category and code
    category = models.JSONField(default=list)  # CodeableConcept
    code = models.JSONField()  # CodeableConcept (what was observed)
    
    # Subject and context
    effective_datetime = models.DateTimeField(null=True, blank=True)
    effective_period = models.JSONField(null=True, blank=True)
    issued = models.DateTimeField(auto_now_add=True)
    
    # Value
    value_quantity = models.JSONField(null=True, blank=True)  # Quantity
    value_codeable_concept = models.JSONField(null=True, blank=True)  # CodeableConcept
    value_string = models.TextField(null=True, blank=True)
    value_boolean = models.BooleanField(null=True, blank=True)
    value_integer = models.IntegerField(null=True, blank=True)
    value_range = models.JSONField(null=True, blank=True)
    
    # Interpretation and notes
    interpretation = models.JSONField(default=list)  # CodeableConcept
    note = models.JSONField(default=list)  # Annotation
    
    # Reference range
    reference_range = models.JSONField(default=list)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Blockchain proof
    blockchain_hash = models.CharField(max_length=64, unique=True, db_index=True)
    blockchain_tx_id = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        db_table = 'fhir_observation'
        indexes = [
            models.Index(fields=['patient', 'effective_datetime']),
            models.Index(fields=['blockchain_hash']),
        ]
    
    def __str__(self):
        return f"Observation {self.id} - Patient: {self.patient.id}"


class DiagnosticReport(models.Model):
    """FHIR DiagnosticReport Resource (Imaging, pathology, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # References
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='diagnostic_reports')
    practitioner = models.ForeignKey(Practitioner, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('registered', 'Registered'),
        ('partial', 'Partial'),
        ('preliminary', 'Preliminary'),
        ('final', 'Final'),
        ('amended', 'Amended'),
        ('corrected', 'Corrected'),
        ('cancelled', 'Cancelled'),
        ('entered-in-error', 'Entered in Error'),
    ])
    
    # Category and code
    category = models.JSONField(default=list)  # CodeableConcept
    code = models.JSONField()  # CodeableConcept (type of report)
    
    # Timing
    effective_datetime = models.DateTimeField(null=True, blank=True)
    effective_period = models.JSONField(null=True, blank=True)
    issued = models.DateTimeField(auto_now_add=True)
    
    # Results
    result = models.ManyToManyField(Observation, blank=True, related_name='diagnostic_reports')
    
    # Conclusion
    conclusion = models.TextField(null=True, blank=True)
    conclusion_code = models.JSONField(default=list)  # CodeableConcept
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Blockchain proof
    blockchain_hash = models.CharField(max_length=64, unique=True, db_index=True)
    blockchain_tx_id = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        db_table = 'fhir_diagnostic_report'
        indexes = [
            models.Index(fields=['patient', 'effective_datetime']),
            models.Index(fields=['blockchain_hash']),
        ]
    
    def __str__(self):
        return f"DiagnosticReport {self.id} - Patient: {self.patient.id}"


class MedicationRequest(models.Model):
    """FHIR MedicationRequest Resource (Prescriptions)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # References
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medication_requests')
    practitioner = models.ForeignKey(Practitioner, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('on-hold', 'On Hold'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('entered-in-error', 'Entered in Error'),
        ('stopped', 'Stopped'),
        ('draft', 'Draft'),
    ])
    
    # Intent
    intent = models.CharField(max_length=20, choices=[
        ('proposal', 'Proposal'),
        ('plan', 'Plan'),
        ('order', 'Order'),
        ('original-order', 'Original Order'),
        ('reflex-order', 'Reflex Order'),
        ('filler-order', 'Filler Order'),
        ('instance-order', 'Instance Order'),
    ])
    
    # Medication
    medication_codeable_concept = models.JSONField()  # CodeableConcept
    
    # Dosage
    dosage_instruction = models.JSONField(default=list)  # Dosage
    
    # Timing
    authored_on = models.DateTimeField(auto_now_add=True)
    
    # Dispense request
    dispense_request = models.JSONField(null=True, blank=True)
    
    # Notes
    note = models.JSONField(default=list)  # Annotation
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Blockchain proof
    blockchain_hash = models.CharField(max_length=64, unique=True, db_index=True)
    blockchain_tx_id = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        db_table = 'fhir_medication_request'
        indexes = [
            models.Index(fields=['patient', 'authored_on']),
            models.Index(fields=['blockchain_hash']),
        ]
    
    def __str__(self):
        return f"MedicationRequest {self.id} - Patient: {self.patient.id}"


class Encounter(models.Model):
    """FHIR Encounter Resource (Patient visits)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # References
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='encounters')
    practitioner = models.ForeignKey(Practitioner, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('planned', 'Planned'),
        ('arrived', 'Arrived'),
        ('triaged', 'Triaged'),
        ('in-progress', 'In Progress'),
        ('onleave', 'On Leave'),
        ('finished', 'Finished'),
        ('cancelled', 'Cancelled'),
        ('entered-in-error', 'Entered in Error'),
    ])
    
    # Class
    encounter_class = models.JSONField()  # Coding (inpatient, outpatient, etc.)
    
    # Type
    encounter_type = models.JSONField(default=list)  # CodeableConcept
    
    # Period
    period_start = models.DateTimeField()
    period_end = models.DateTimeField(null=True, blank=True)
    
    # Reason
    reason_code = models.JSONField(default=list)  # CodeableConcept
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Blockchain proof
    blockchain_hash = models.CharField(max_length=64, unique=True, db_index=True)
    blockchain_tx_id = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        db_table = 'fhir_encounter'
        indexes = [
            models.Index(fields=['patient', 'period_start']),
            models.Index(fields=['blockchain_hash']),
        ]
    
    def __str__(self):
        return f"Encounter {self.id} - Patient: {self.patient.id}"
