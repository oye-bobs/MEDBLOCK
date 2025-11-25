"""
Hash Management System
Generates and verifies cryptographic hashes for medical records
"""
import hashlib
import json
import logging
from typing import Any, Dict
from django.conf import settings

logger = logging.getLogger(__name__)


class HashManager:
    """
    Manages cryptographic hashing of medical records
    Ensures data integrity and tamper detection
    """
    
    def __init__(self, algorithm: str = None):
        """
        Initialize hash manager
        
        Args:
            algorithm: Hash algorithm to use (default from settings)
        """
        self.algorithm = algorithm or settings.HASH_ALGORITHM
        
    def generate_hash(self, data: Dict[str, Any]) -> str:
        """
        Generate SHA-256 hash of medical record data
        
        Args:
            data: Dictionary containing record data
            
        Returns:
            Hexadecimal hash string
        """
        try:
            # Serialize data to JSON with sorted keys for consistency
            json_data = json.dumps(data, sort_keys=True, separators=(',', ':'))
            
            # Generate hash
            if self.algorithm == 'SHA256':
                hash_obj = hashlib.sha256(json_data.encode('utf-8'))
            elif self.algorithm == 'SHA512':
                hash_obj = hashlib.sha512(json_data.encode('utf-8'))
            else:
                raise ValueError(f"Unsupported hash algorithm: {self.algorithm}")
            
            hash_value = hash_obj.hexdigest()
            
            logger.debug(f"Generated hash: {hash_value[:16]}...")
            
            return hash_value
            
        except Exception as e:
            logger.error(f"Error generating hash: {e}")
            raise
    
    def verify_hash(self, data: Dict[str, Any], expected_hash: str) -> bool:
        """
        Verify that data matches expected hash
        
        Args:
            data: Dictionary containing record data
            expected_hash: Expected hash value
            
        Returns:
            True if hash matches, False otherwise
        """
        try:
            actual_hash = self.generate_hash(data)
            matches = actual_hash == expected_hash
            
            if not matches:
                logger.warning(
                    f"Hash mismatch! Expected: {expected_hash[:16]}..., "
                    f"Got: {actual_hash[:16]}..."
                )
            
            return matches
            
        except Exception as e:
            logger.error(f"Error verifying hash: {e}")
            return False
    
    def generate_record_hash(self, record_instance) -> str:
        """
        Generate hash for a Django model instance
        
        Args:
            record_instance: Django model instance (Observation, DiagnosticReport, etc.)
            
        Returns:
            Hash of the record
        """
        try:
            # Extract relevant fields for hashing
            # Exclude metadata fields like created_at, updated_at, blockchain_hash
            data = self._extract_hashable_data(record_instance)
            
            return self.generate_hash(data)
            
        except Exception as e:
            logger.error(f"Error generating record hash: {e}")
            raise
    
    def _extract_hashable_data(self, record_instance) -> Dict[str, Any]:
        """
        Extract hashable data from model instance
        Excludes metadata and blockchain-specific fields
        
        Args:
            record_instance: Django model instance
            
        Returns:
            Dictionary of hashable fields
        """
        from django.forms.models import model_to_dict
        
        # Convert model to dictionary
        data = model_to_dict(record_instance)
        
        # Remove fields that shouldn't be hashed
        excluded_fields = {
            'id',
            'created_at',
            'updated_at',
            'blockchain_hash',
            'blockchain_tx_id',
        }
        
        hashable_data = {
            k: v for k, v in data.items()
            if k not in excluded_fields and v is not None
        }
        
        # Convert UUIDs and dates to strings for JSON serialization
        for key, value in hashable_data.items():
            if hasattr(value, 'isoformat'):
                hashable_data[key] = value.isoformat()
            elif hasattr(value, 'hex'):
                hashable_data[key] = str(value)
        
        return hashable_data


# Singleton instance
_hash_manager = None

def get_hash_manager() -> HashManager:
    """Get singleton hash manager instance"""
    global _hash_manager
    if _hash_manager is None:
        _hash_manager = HashManager()
    return _hash_manager
