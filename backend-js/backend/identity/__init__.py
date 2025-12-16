"""
Identity Module
Handles Atala PRISM DID management and authentication
"""
from .did_manager import DIDManager, get_did_manager
from .authentication import DIDAuthentication, DIDUser
from .auth_middleware import DIDAuthenticationMiddleware

__all__ = [
    'DIDManager',
    'get_did_manager',
    'DIDAuthentication',
    'DIDUser',
    'DIDAuthenticationMiddleware',
]
