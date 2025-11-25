"""
DID Authentication Middleware
Processes DID-based authentication for all requests
"""
import logging
from django.utils.deprecation import MiddlewareMixin
from .did_manager import get_did_manager

logger = logging.getLogger(__name__)


class DIDAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to process DID authentication
    Attaches DID information to request object
    """
    
    def process_request(self, request):
        """
        Process incoming request for DID authentication
        """
        # Extract DID from authorization header if present
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('DID '):
            try:
                parts = auth_header[4:].split(' ')
                if len(parts) >= 1:
                    did = parts[0]
                    request.did = did
                    
                    # Resolve DID and attach to request
                    did_manager = get_did_manager()
                    did_document = did_manager.resolve_did(did)
                    request.did_document = did_document
                    
                    logger.debug(f"DID attached to request: {did}")
            except Exception as e:
                logger.warning(f"Error processing DID in middleware: {e}")
        
        return None
