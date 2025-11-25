"""
DID-Based Authentication
Custom authentication backend for Django REST Framework
"""
import logging
from typing import Optional, Tuple
from rest_framework import authentication, exceptions
from django.contrib.auth.models import AnonymousUser
from .did_manager import get_did_manager

logger = logging.getLogger(__name__)


class DIDUser:
    """
    Represents an authenticated user via DID
    Compatible with Django's authentication system
    """
    
    def __init__(self, did: str, did_document: dict):
        self.did = did
        self.did_document = did_document
        self.is_authenticated = True
        self.is_anonymous = False
    
    def __str__(self):
        return f"DIDUser({self.did})"
    
    @property
    def is_active(self):
        return True


class DIDAuthentication(authentication.BaseAuthentication):
    """
    DID-based authentication for REST API
    Expects Authorization header with DID signature
    """
    
    def authenticate(self, request) -> Optional[Tuple[DIDUser, None]]:
        """
        Authenticate request using DID signature
        
        Expected header format:
        Authorization: DID did:prism:abc123 signature:xyz789
        
        Returns:
            (DIDUser, None) if authenticated, None otherwise
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('DID '):
            return None
        
        try:
            # Parse authorization header
            parts = auth_header[4:].split(' ')
            if len(parts) != 2:
                raise exceptions.AuthenticationFailed('Invalid DID authorization format')
            
            did = parts[0]
            signature_part = parts[1]
            
            if not signature_part.startswith('signature:'):
                raise exceptions.AuthenticationFailed('Missing signature')
            
            signature = signature_part[10:]
            
            # Get message to verify (could be timestamp or challenge)
            message = request.META.get('HTTP_X_DID_MESSAGE', '')
            if not message:
                raise exceptions.AuthenticationFailed('Missing X-DID-Message header')
            
            # Verify signature
            did_manager = get_did_manager()
            if not did_manager.verify_did_signature(did, message, signature):
                raise exceptions.AuthenticationFailed('Invalid DID signature')
            
            # Resolve DID to get document
            did_document = did_manager.resolve_did(did)
            if not did_document:
                raise exceptions.AuthenticationFailed('Could not resolve DID')
            
            # Create DID user
            user = DIDUser(did=did, did_document=did_document)
            
            logger.info(f"Authenticated user with DID: {did}")
            
            return (user, None)
            
        except exceptions.AuthenticationFailed:
            raise
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            raise exceptions.AuthenticationFailed('Authentication failed')
    
    def authenticate_header(self, request):
        """
        Return authentication header for 401 responses
        """
        return 'DID'
