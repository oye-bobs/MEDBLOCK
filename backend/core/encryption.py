"""
Encryption Service
Handles AES-256 encryption/decryption for sensitive medical data
"""
import base64
import logging
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from django.conf import settings

logger = logging.getLogger(__name__)


class EncryptionService:
    """
    Handles encryption and decryption of sensitive patient data
    Uses AES-256 via Fernet (symmetric encryption)
    """
    
    def __init__(self):
        """Initialize encryption service with key from settings"""
        self.cipher = self._get_cipher()
    
    def _get_cipher(self) -> Fernet:
        """
        Get Fernet cipher instance from encryption key
        
        Returns:
            Fernet cipher instance
        """
        encryption_key = settings.DB_ENCRYPTION_KEY
        
        if not encryption_key:
            raise ValueError("DB_ENCRYPTION_KEY not configured in settings")
        
        # Ensure key is properly formatted for Fernet
        if len(encryption_key) == 64:  # Hex string
            key_bytes = bytes.fromhex(encryption_key)
        else:
            key_bytes = encryption_key.encode('utf-8')
        
        # Derive Fernet key using PBKDF2
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'medblock_salt',  # In production, use unique salt per deployment
            iterations=100000,
        )
        fernet_key = base64.urlsafe_b64encode(kdf.derive(key_bytes))
        
        return Fernet(fernet_key)
    
    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt plaintext data
        
        Args:
            plaintext: String to encrypt
            
        Returns:
            Base64-encoded encrypted string
        """
        try:
            if not plaintext:
                return ""
            
            encrypted_bytes = self.cipher.encrypt(plaintext.encode('utf-8'))
            encrypted_str = base64.urlsafe_b64encode(encrypted_bytes).decode('utf-8')
            
            logger.debug(f"Encrypted data (length: {len(plaintext)} -> {len(encrypted_str)})")
            
            return encrypted_str
            
        except Exception as e:
            logger.error(f"Encryption error: {e}")
            raise
    
    def decrypt(self, encrypted_text: str) -> str:
        """
        Decrypt encrypted data
        
        Args:
            encrypted_text: Base64-encoded encrypted string
            
        Returns:
            Decrypted plaintext string
        """
        try:
            if not encrypted_text:
                return ""
            
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_text.encode('utf-8'))
            decrypted_bytes = self.cipher.decrypt(encrypted_bytes)
            plaintext = decrypted_bytes.decode('utf-8')
            
            logger.debug(f"Decrypted data (length: {len(encrypted_text)} -> {len(plaintext)})")
            
            return plaintext
            
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            raise
    
    def encrypt_dict(self, data: dict) -> dict:
        """
        Encrypt all string values in a dictionary
        
        Args:
            data: Dictionary with plaintext values
            
        Returns:
            Dictionary with encrypted values
        """
        encrypted_data = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                encrypted_data[key] = self.encrypt(value)
            elif isinstance(value, dict):
                encrypted_data[key] = self.encrypt_dict(value)
            elif isinstance(value, list):
                encrypted_data[key] = [
                    self.encrypt(item) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                encrypted_data[key] = value
        
        return encrypted_data
    
    def decrypt_dict(self, data: dict) -> dict:
        """
        Decrypt all encrypted string values in a dictionary
        
        Args:
            data: Dictionary with encrypted values
            
        Returns:
            Dictionary with decrypted values
        """
        decrypted_data = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                try:
                    decrypted_data[key] = self.decrypt(value)
                except Exception:
                    # If decryption fails, assume it's not encrypted
                    decrypted_data[key] = value
            elif isinstance(value, dict):
                decrypted_data[key] = self.decrypt_dict(value)
            elif isinstance(value, list):
                decrypted_data[key] = [
                    self.decrypt(item) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                decrypted_data[key] = value
        
        return decrypted_data


# Singleton instance
_encryption_service = None

def get_encryption_service() -> EncryptionService:
    """Get singleton encryption service instance"""
    global _encryption_service
    if _encryption_service is None:
        _encryption_service = EncryptionService()
    return _encryption_service
