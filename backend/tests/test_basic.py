"""
Basic tests for MEDBLOCK backend
"""
import pytest
from django.test import TestCase
from fhir.models import Patient, Observation
from blockchain import get_hash_manager
from identity import get_did_manager


class HashManagerTests(TestCase):
    """Test hash generation and verification"""
    
    def test_hash_generation(self):
        """Test that hash is generated correctly"""
        hash_manager = get_hash_manager()
        
        data = {
            'patient_id': '123',
            'code': {'text': 'Blood Pressure'},
            'value': 120
        }
        
        hash1 = hash_manager.generate_hash(data)
        hash2 = hash_manager.generate_hash(data)
        
        # Same data should produce same hash
        assert hash1 == hash2
        assert len(hash1) == 64  # SHA-256 produces 64 hex characters
    
    def test_hash_verification(self):
        """Test hash verification"""
        hash_manager = get_hash_manager()
        
        data = {'test': 'data'}
        hash_value = hash_manager.generate_hash(data)
        
        # Verification should succeed
        assert hash_manager.verify_hash(data, hash_value) is True
        
        # Modified data should fail verification
        modified_data = {'test': 'modified'}
        assert hash_manager.verify_hash(modified_data, hash_value) is False


class DIDManagerTests(TestCase):
    """Test DID management"""
    
    def test_did_creation(self):
        """Test DID creation"""
        did_manager = get_did_manager()
        
        result = did_manager.create_did(entity_type='patient')
        
        assert 'did' in result
        assert result['did'].startswith('did:prism:')
        assert 'public_key' in result
        assert 'private_key' in result
    
    def test_did_resolution(self):
        """Test DID resolution"""
        did_manager = get_did_manager()
        
        # Create a DID
        result = did_manager.create_did(entity_type='patient')
        did = result['did']
        
        # Resolve it
        did_doc = did_manager.resolve_did(did)
        
        assert did_doc is not None
        assert did_doc['did'] == did


class PatientModelTests(TestCase):
    """Test Patient model"""
    
    def test_patient_creation(self):
        """Test creating a patient"""
        patient = Patient.objects.create(
            did='did:prism:test123',
            name=[{'given': ['John'], 'family': 'Doe'}],
            gender='male',
        )
        
        assert patient.id is not None
        assert patient.did == 'did:prism:test123'
        assert patient.gender == 'male'


class ObservationModelTests(TestCase):
    """Test Observation model"""
    
    def test_observation_with_hash(self):
        """Test creating observation with blockchain hash"""
        # Create patient first
        patient = Patient.objects.create(
            did='did:prism:test123',
            name=[{'given': ['John'], 'family': 'Doe'}],
            gender='male',
        )
        
        # Create observation
        observation = Observation.objects.create(
            patient=patient,
            status='final',
            code={'text': 'Blood Pressure'},
            value_quantity={'value': 120, 'unit': 'mmHg'},
            blockchain_hash='abc123' * 10,  # Mock hash
        )
        
        assert observation.id is not None
        assert observation.patient == patient
        assert observation.blockchain_hash is not None
