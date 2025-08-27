import hashlib
import hmac
import secrets
import base64
import logging
from typing import Union, Dict, Any, Optional, List
from datetime import datetime
import numpy as np

logger = logging.getLogger(__name__)

class CryptoUtils:
    """
    Cryptographic utilities for quantum random data processing.
    Provides key generation, entropy processing, and validation functions.
    """
    
    def __init__(self):
        self.logger = logger
        self.supported_algorithms = {
            'sha256': hashlib.sha256,
            'sha3_256': hashlib.sha3_256,
            'blake2b': hashlib.blake2b,
            'sha512': hashlib.sha512
        }
    
    def generate_symmetric_key(self, entropy_data: bytes, key_size_bits: int = 256) -> bytes:
        """
        Generate symmetric cryptographic key from quantum entropy.
        
        Args:
            entropy_data: High-entropy random data
            key_size_bits: Desired key size in bits
            
        Returns:
            Cryptographic key bytes
        """
        try:
            key_size_bytes = key_size_bits // 8
            
            if len(entropy_data) >= key_size_bytes:
                # Use entropy directly if sufficient
                return entropy_data[:key_size_bytes]
            else:
                # Expand entropy using HKDF-like process
                return self._expand_entropy(entropy_data, key_size_bytes)
                
        except Exception as e:
            self.logger.error(f"Error generating symmetric key: {str(e)}")
            return secrets.token_bytes(key_size_bits // 8)
    
    def generate_rsa_seed(self, entropy_data: bytes, seed_size: int = 64) -> Dict[str, Any]:
        """
        Generate high-quality seed data for RSA key generation.
        
        Args:
            entropy_data: Quantum entropy source
            seed_size: Size of seed in bytes
            
        Returns:
            Dictionary with seed data and metadata
        """
        try:
            # Generate multiple seeds for p and q prime generation
            seed_p = self._expand_entropy(entropy_data, seed_size)
            seed_q = self._expand_entropy(entropy_data[seed_size:], seed_size)
            
            # Additional randomness for other RSA parameters
            aux_entropy = self._expand_entropy(entropy_data[seed_size*2:], 32)
            
            return {
                'seed_p': seed_p,
                'seed_q': seed_q,
                'auxiliary_entropy': aux_entropy,
                'entropy_quality': self._assess_entropy_quality(entropy_data),
                'generation_time': datetime.utcnow().isoformat(),
                'algorithm_recommendation': 'RSA-4096' if len(entropy_data) >= 128 else 'RSA-2048'
            }
            
        except Exception as e:
            self.logger.error(f"Error generating RSA seed: {str(e)}")
            return {
                'seed_p': secrets.token_bytes(seed_size),
                'seed_q': secrets.token_bytes(seed_size),
                'auxiliary_entropy': secrets.token_bytes(32),
                'error': str(e)
            }
    
    def _expand_entropy(self, seed: bytes, output_size: int, algorithm: str = 'sha256') -> bytes:
        """
        Expand entropy using HKDF-like key derivation.
        
        Args:
            seed: Input entropy
            output_size: Desired output size in bytes
            algorithm: Hash algorithm to use
            
        Returns:
            Expanded entropy
        """
        try:
            hash_func = self.supported_algorithms.get(algorithm, hashlib.sha256)
            hash_length = hash_func().digest_size
            
            # HKDF Extract phase
            salt = b'quantum-rng-salt'
            prk = hmac.new(salt, seed, hash_func).digest()
            
            # HKDF Expand phase
            info = b'quantum-key-expansion'
            n = (output_size + hash_length - 1) // hash_length  # Ceiling division
            
            okm = b''
            previous = b''
            
            for i in range(n):
                hmac_input = previous + info + bytes([i + 1])
                previous = hmac.new(prk, hmac_input, hash_func).digest()
                okm += previous
            
            return okm[:output_size]
            
        except Exception as e:
            self.logger.error(f"Error expanding entropy: {str(e)}")
            return secrets.token_bytes(output_size)
    
    def _assess_entropy_quality(self, data: bytes) -> Dict[str, float]:
        """
        Assess the quality of entropy data.
        
        Args:
            data: Entropy data to assess
            
        Returns:
            Quality metrics
        """
        try:
            data_array = np.frombuffer(data, dtype=np.uint8)
            
            # Shannon entropy
            counts = np.bincount(data_array, minlength=256)
            probabilities = counts / len(data_array)
            probabilities = probabilities[probabilities > 0]
            shannon_entropy = -np.sum(probabilities * np.log2(probabilities))
            
            # Min-entropy (worst-case entropy)
            max_prob = np.max(probabilities)
            min_entropy = -np.log2(max_prob) if max_prob > 0 else 0
            
            # Collision entropy
            collision_entropy = -np.log2(np.sum(probabilities ** 2))
            
            # Serial correlation
            if len(data_array) > 1:
                correlation = np.corrcoef(data_array[:-1], data_array[1:])[0, 1]
                correlation = 0.0 if np.isnan(correlation) else abs(correlation)
            else:
                correlation = 0.0
            
            return {
                'shannon_entropy': float(shannon_entropy),
                'min_entropy': float(min_entropy),
                'collision_entropy': float(collision_entropy),
                'serial_correlation': float(correlation),
                'quality_score': float(min(shannon_entropy / 8.0, 1.0))
            }
            
        except Exception as e:
            self.logger.error(f"Error assessing entropy quality: {str(e)}")
            return {
                'shannon_entropy': 0.0,
                'min_entropy': 0.0,
                'collision_entropy': 0.0,
                'serial_correlation': 1.0,
                'quality_score': 0.0
            }
    
    def derive_keys(self, master_key: bytes, key_count: int, key_size: int = 32) -> List[bytes]:
        """
        Derive multiple keys from a master key using HKDF.
        
        Args:
            master_key: Master key material
            key_count: Number of keys to derive
            key_size: Size of each derived key in bytes
            
        Returns:
            List of derived keys
        """
        try:
            derived_keys = []
            
            for i in range(key_count):
                info = f'derived-key-{i}'.encode('utf-8')
                derived_key = self._expand_entropy(master_key, key_size)
                master_key = hashlib.sha256(master_key + derived_key).digest()  # Update master key
                derived_keys.append(derived_key)
            
            return derived_keys
            
        except Exception as e:
            self.logger.error(f"Error deriving keys: {str(e)}")
            return [secrets.token_bytes(key_size) for _ in range(key_count)]
    
    def create_key_commitment(self, key: bytes) -> Dict[str, str]:
        """
        Create a cryptographic commitment to a key.
        
        Args:
            key: Key to commit to
            
        Returns:
            Commitment data
        """
        try:
            # Generate random nonce
            nonce = secrets.token_bytes(32)
            
            # Create commitment hash
            commitment_data = nonce + key
            commitment = hashlib.sha256(commitment_data).digest()
            
            return {
                'commitment': base64.b64encode(commitment).decode('utf-8'),
                'nonce': base64.b64encode(nonce).decode('utf-8'),
                'algorithm': 'SHA256',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error creating key commitment: {str(e)}")
            return {'error': str(e)}
    
    def verify_key_commitment(self, key: bytes, commitment_data: Dict[str, str]) -> bool:
        """
        Verify a key against its commitment.
        
        Args:
            key: Key to verify
            commitment_data: Commitment data from create_key_commitment
            
        Returns:
            True if key matches commitment
        """
        try:
            nonce = base64.b64decode(commitment_data['nonce'].encode('utf-8'))
            expected_commitment = base64.b64decode(commitment_data['commitment'].encode('utf-8'))
            
            # Recreate commitment
            commitment_input = nonce + key
            actual_commitment = hashlib.sha256(commitment_input).digest()
            
            return hmac.compare_digest(expected_commitment, actual_commitment)
            
        except Exception as e:
            self.logger.error(f"Error verifying key commitment: {str(e)}")
            return False
    
    def generate_protocol_seeds(self, entropy_data: bytes, protocol: str) -> Dict[str, Any]:
        """
        Generate protocol-specific seeds for cryptographic protocols.
        
        Args:
            entropy_data: High-entropy quantum data
            protocol: Protocol name ('TLS', 'SSH', 'IPSec', etc.)
            
        Returns:
            Protocol-specific seed data
        """
        try:
            protocol_configs = {
                'TLS': {'seed_size': 48, 'additional_entropy': 32},
                'SSH': {'seed_size': 32, 'additional_entropy': 16},
                'IPSec': {'seed_size': 64, 'additional_entropy': 32},
                'OpenVPN': {'seed_size': 32, 'additional_entropy': 16},
                'WireGuard': {'seed_size': 32, 'additional_entropy': 0}
            }
            
            config = protocol_configs.get(protocol, {'seed_size': 32, 'additional_entropy': 16})
            
            # Generate main seed
            main_seed = self._expand_entropy(entropy_data, config['seed_size'])
            
            # Generate additional entropy if needed
            additional_entropy = None
            if config['additional_entropy'] > 0:
                additional_entropy = self._expand_entropy(
                    entropy_data[config['seed_size']:], 
                    config['additional_entropy']
                )
            
            # Generate session-specific data
            session_id = self._expand_entropy(entropy_data[-16:], 16)
            
            result = {
                'protocol': protocol,
                'main_seed': base64.b64encode(main_seed).decode('utf-8'),
                'session_id': base64.b64encode(session_id).decode('utf-8'),
                'entropy_quality': self._assess_entropy_quality(entropy_data),
                'generation_time': datetime.utcnow().isoformat()
            }
            
            if additional_entropy:
                result['additional_entropy'] = base64.b64encode(additional_entropy).decode('utf-8')
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error generating protocol seeds: {str(e)}")
            return {'error': str(e), 'protocol': protocol}
    
    def constant_time_compare(self, a: bytes, b: bytes) -> bool:
        """
        Constant-time comparison of two byte strings.
        
        Args:
            a: First byte string
            b: Second byte string
            
        Returns:
            True if strings are equal
        """
        return hmac.compare_digest(a, b)
    
    def secure_zero(self, data: bytearray):
        """
        Securely zero out sensitive data in memory.
        
        Args:
            data: Bytearray to zero out
        """
        try:
            for i in range(len(data)):
                data[i] = 0
        except Exception as e:
            self.logger.error(f"Error securely zeroing data: {str(e)}")
    
    def format_key_output(self, key_data: bytes, format_type: str) -> Union[str, bytes, List[int]]:
        """
        Format key data in the requested format.
        
        Args:
            key_data: Raw key bytes
            format_type: Output format ('hex', 'base64', 'raw', 'pem')
            
        Returns:
            Formatted key data
        """
        try:
            if format_type == 'hex':
                return key_data.hex()
            elif format_type == 'base64':
                return base64.b64encode(key_data).decode('utf-8')
            elif format_type == 'raw':
                return list(key_data)
            elif format_type == 'pem':
                # Basic PEM-like formatting for demonstration
                b64_data = base64.b64encode(key_data).decode('utf-8')
                pem_lines = [b64_data[i:i+64] for i in range(0, len(b64_data), 64)]
                return '-----BEGIN QUANTUM KEY-----\n' + '\n'.join(pem_lines) + '\n-----END QUANTUM KEY-----'
            else:
                return key_data.hex()  # Default to hex
                
        except Exception as e:
            self.logger.error(f"Error formatting key output: {str(e)}")
            return key_data.hex()  # Fallback to hex