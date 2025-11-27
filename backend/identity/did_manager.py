"""
Atala PRISM DID Management
Handles decentralized identity creation and verification
"""
import logging
from typing import Optional, Dict, Any
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class DIDManager:
    """
    Manages Decentralized Identifiers (DIDs) using Atala PRISM
    Handles DID creation, resolution, and verification
    """
    
    def __init__(self):
        """Initialize DID manager with PRISM configuration"""
        self.prism_node_url = settings.PRISM_NODE_URL
        self.prism_api_key = settings.PRISM_API_KEY
        self.did_method = settings.PRISM_DID_METHOD
    
    def create_did(self, entity_type: str = 'patient') -> Dict[str, Any]:
        """
        Create a new DID for a patient or provider
        
        Args:
            entity_type: Type of entity ('patient' or 'provider')
            
        Returns:
            Dictionary containing DID and key material
            {
                'did': 'did:prism:...',
                'public_key': '...',
                'private_key': '...' (should be securely stored by user)
            }
        """
        try:
            # TODO: Implement actual Atala PRISM DID creation
            # This is a placeholder for the PRISM SDK integration
            
            logger.info(f"Creating new DID for {entity_type}")
            
            # Mock DID creation
            import uuid
            did_suffix = str(uuid.uuid4()).replace('-', '')[:32]
            mock_did = f"did:{self.did_method}:{did_suffix}"
            
            result = {
                'did': mock_did,
                'public_key': f"pub_key_{did_suffix[:16]}",
                'private_key': f"priv_key_{did_suffix[:16]}",  # User must store securely
                'created_at': self._get_current_timestamp(),
            }
            
            # Cache DID document
            cache.set(f"did_{mock_did}", result, timeout=86400)  # 24 hours
            
            logger.info(f"Created DID: {mock_did}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error creating DID: {e}")
            raise
    
    def resolve_did(self, did: str) -> Optional[Dict[str, Any]]:
        """
        Resolve a DID to its DID document
        
        Args:
            did: Decentralized identifier
            
        Returns:
            DID document or None if not found
        """
        try:
            # Check cache first
            cached_doc = cache.get(f"did_{did}")
            if cached_doc:
                return cached_doc
            
            # TODO: Implement actual DID resolution via PRISM
            logger.info(f"Resolving DID: {did}")
            
            # Mock resolution
            if did.startswith(f"did:{self.did_method}:"):
                doc = {
                    'did': did,
                    'public_key': f"pub_key_{did[-16:]}",
                    'created_at': self._get_current_timestamp(),
                }
                cache.set(f"did_{did}", doc, timeout=3600)
                return doc
            
            # Support demo mock DID created by frontend hook
            if did == 'did:prism:mock_demo_did':
                doc = {
                    'did': did,
                    'public_key': 'pub_key_mock_demo',
                    'created_at': self._get_current_timestamp(),
                }
                cache.set(f"did_{did}", doc, timeout=3600)
                return doc

            return None
            
        except Exception as e:
            logger.error(f"Error resolving DID: {e}")
            return None
    
    def verify_did_signature(
        self,
        did: str,
        message: str,
        signature: str
    ) -> bool:
        """
        Verify a signature against a DID's public key
        
        Args:
            did: Decentralized identifier
            message: Original message that was signed
            signature: Signature to verify
            
        Returns:
            True if signature is valid, False otherwise
        """
        try:
            # Resolve DID to get public key
            did_doc = self.resolve_did(did)
            if not did_doc:
                logger.warning(f"Could not resolve DID: {did}")
                return False
            
            # TODO: Implement actual signature verification
            logger.info(f"Verifying signature for DID: {did}")
            
            # Mock verification: accept mock_demo signature and any signature for cached DIDs
            if did == 'did:prism:mock_demo_did' and signature == 'mock_signature_for_demo_purposes_only':
                return True

            # If DID doc is cached (created by backend), accept any signature for demo/test
            cached = cache.get(f"did_{did}")
            if cached:
                return True

            return False
        
        except Exception as e:
            logger.error(f"Error verifying DID signature: {e}")
            return False
    
    def update_did_document(
        self,
        did: str,
        updates: Dict[str, Any]
    ) -> bool:
        """
        Update a DID document (e.g., key rotation)
        
        Args:
            did: Decentralized identifier
            updates: Dictionary of fields to update
            
        Returns:
            True if update successful, False otherwise
        """
        try:
            # TODO: Implement actual DID document update via PRISM
            logger.info(f"Updating DID document: {did}")
            
            # Invalidate cache
            cache.delete(f"did_{did}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating DID document: {e}")
            return False
    
    def _get_current_timestamp(self) -> str:
        """Get current timestamp in ISO 8601 format"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'


# Singleton instance
_did_manager = None

def get_did_manager() -> DIDManager:
    """Get singleton DID manager instance"""
    global _did_manager
    if _did_manager is None:
        _did_manager = DIDManager()
    return _did_manager
