import requests
import time
import logging
import json
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import threading

logger = logging.getLogger(__name__)

class ANUQuantumAPI:
    """
    Integration with ANU Quantum Random Numbers Server API.
    Provides validation and backup quantum entropy source.
    """
    
    def __init__(self):
        self.base_url = "https://qrng.anu.edu.au/API/jsonI.php"
        self.logger = logger
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Quantum-RNG-Dashboard/1.0',
            'Accept': 'application/json'
        })
        
        # Rate limiting and caching
        self.last_request_time = 0
        self.min_request_interval = 1.0  # seconds between requests
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes cache TTL
        self.cache_lock = threading.Lock()
        
        # Statistics
        self.stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'cache_hits': 0,
            'total_bytes_received': 0,
            'average_response_time': 0.0,
            'last_request_time': None,
            'api_status': 'unknown'
        }
    
    def generate_random_bytes(self, size: int, timeout: int = 30) -> bytes:
        """
        Generate random bytes using ANU Quantum API.
        
        Args:
            size: Number of bytes to generate (max 1024 per request)
            timeout: Request timeout in seconds
            
        Returns:
            Random bytes from quantum source
        """
        try:
            # Check rate limiting - only allow one request per 70 seconds to be safe
            current_time = time.time()
            if hasattr(self, '_last_successful_request'):
                time_since_last = current_time - self._last_successful_request
                if time_since_last < 70:  # 70 second cooldown to be safe
                    raise Exception(f"ANU API rate limited. Please wait {70 - int(time_since_last)} more seconds.")
            
            # ANU API limits to 1024 bytes per request
            if size > 1024:
                # Split into multiple requests
                result = bytearray()
                remaining = size
                
                while remaining > 0:
                    chunk_size = min(remaining, 1024)
                    chunk_data = self._single_request(chunk_size, timeout)
                    result.extend(chunk_data)
                    remaining -= chunk_size
                    
                    # Rate limiting between requests
                    if remaining > 0:
                        time.sleep(self.min_request_interval)
                
                return bytes(result)
            else:
                return self._single_request(size, timeout)
                
        except Exception as e:
            self.logger.error(f"Error generating random bytes from ANU API: {str(e)}")
            self.stats['failed_requests'] += 1
            raise
    
    def _single_request(self, size: int, timeout: int) -> bytes:
        """Make a single request to ANU API"""
        start_time = time.time()
        
        try:
            # Check cache first
            cache_key = f"random_{size}"
            cached_data = self._get_cached_data(cache_key)
            if cached_data:
                self.stats['cache_hits'] += 1
                return cached_data
            
            # Rate limiting
            current_time = time.time()
            time_since_last = current_time - self.last_request_time
            if time_since_last < self.min_request_interval:
                time.sleep(self.min_request_interval - time_since_last)
            
            # Prepare request parameters
            params = {
                'length': size,
                'type': 'uint8'
            }
            
            # Make request
            self.stats['total_requests'] += 1
            response = self.session.get(
                self.base_url,
                params=params,
                timeout=timeout
            )
            
            self.last_request_time = time.time()
            response_time = self.last_request_time - start_time
            
            # Update statistics
            self._update_response_time_stats(response_time)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    # Extract random data
                    random_values = data.get('data', [])
                    random_bytes = bytes(random_values)
                    
                    # Cache the result
                    self._cache_data(cache_key, random_bytes)
                    
                    # Update statistics and track timing
                    self.stats['successful_requests'] += 1
                    self.stats['total_bytes_received'] += len(random_bytes)
                    self.stats['last_request_time'] = datetime.utcnow().isoformat()
                    self.stats['api_status'] = 'operational'
                    self._last_successful_request = time.time()
                    
                    return random_bytes
                else:
                    error_msg = data.get('error', 'Unknown API error')
                    raise Exception(f"ANU API error: {error_msg}")
            else:
                raise Exception(f"HTTP error: {response.status_code}")
                
        except Exception as e:
            self.stats['failed_requests'] += 1
            self.stats['api_status'] = 'error'
            self.logger.error(f"ANU API request failed: {str(e)}")
            raise
    
    def _get_cached_data(self, key: str) -> Optional[bytes]:
        """Get data from cache if still valid"""
        with self.cache_lock:
            if key in self.cache:
                data, timestamp = self.cache[key]
                if time.time() - timestamp < self.cache_ttl:
                    return data
                else:
                    # Remove expired cache entry
                    del self.cache[key]
        return None
    
    def _cache_data(self, key: str, data: bytes):
        """Cache data with timestamp"""
        with self.cache_lock:
            self.cache[key] = (data, time.time())
            
            # Cleanup old cache entries
            current_time = time.time()
            expired_keys = [
                k for k, (_, timestamp) in self.cache.items()
                if current_time - timestamp >= self.cache_ttl
            ]
            for k in expired_keys:
                del self.cache[k]
    
    def _update_response_time_stats(self, response_time: float):
        """Update average response time statistics"""
        if self.stats['successful_requests'] == 0:
            self.stats['average_response_time'] = response_time
        else:
            # Moving average
            n = self.stats['successful_requests']
            self.stats['average_response_time'] = (
                (self.stats['average_response_time'] * (n - 1) + response_time) / n
            )
    
    def test_api_connection(self) -> Dict[str, Any]:
        """Test connection to ANU API and return status"""
        try:
            start_time = time.time()
            
            # Make a small test request
            response = self.session.get(
                self.base_url,
                params={'length': 1, 'type': 'uint8'},
                timeout=10
            )
            
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                success = data.get('success', False)
                
                return {
                    'status': 'operational' if success else 'api_error',
                    'response_time_ms': round(response_time * 1000, 2),
                    'http_status': response.status_code,
                    'api_response': data,
                    'timestamp': datetime.utcnow().isoformat()
                }
            else:
                return {
                    'status': 'http_error',
                    'response_time_ms': round(response_time * 1000, 2),
                    'http_status': response.status_code,
                    'timestamp': datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            return {
                'status': 'connection_error',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def get_api_status(self) -> Dict[str, Any]:
        """Get current API status and statistics"""
        return {
            'api_endpoint': self.base_url,
            'status': self.stats['api_status'],
            'statistics': self.stats.copy(),
            'cache_info': {
                'entries': len(self.cache),
                'ttl_seconds': self.cache_ttl
            },
            'rate_limiting': {
                'min_interval_seconds': self.min_request_interval,
                'last_request': self.stats['last_request_time']
            }
        }
    
    def validate_with_anu(self, local_data: bytes, sample_size: int = 100) -> Dict[str, Any]:
        """
        Validate local random data quality against ANU quantum source.
        
        Args:
            local_data: Local random data to validate
            sample_size: Size of ANU sample to compare against
            
        Returns:
            Validation results
        """
        try:
            # Get reference data from ANU
            anu_data = self.generate_random_bytes(sample_size)
            
            # Compare statistical properties
            local_sample = local_data[:sample_size] if len(local_data) >= sample_size else local_data
            
            results = {
                'validation_type': 'anu_comparison',
                'local_sample_size': len(local_sample),
                'anu_sample_size': len(anu_data),
                'comparison_metrics': {},
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Calculate basic statistics for comparison
            import numpy as np
            
            local_array = np.frombuffer(local_sample, dtype=np.uint8)
            anu_array = np.frombuffer(anu_data, dtype=np.uint8)
            
            # Mean comparison
            local_mean = np.mean(local_array)
            anu_mean = np.mean(anu_array)
            results['comparison_metrics']['mean_difference'] = abs(local_mean - anu_mean)
            
            # Standard deviation comparison
            local_std = np.std(local_array)
            anu_std = np.std(anu_array)
            results['comparison_metrics']['std_difference'] = abs(local_std - anu_std)
            
            # Entropy comparison (simplified)
            local_entropy = -np.sum(np.bincount(local_array) / len(local_array) * 
                                  np.log2(np.maximum(np.bincount(local_array) / len(local_array), 1e-10)))
            anu_entropy = -np.sum(np.bincount(anu_array) / len(anu_array) * 
                                np.log2(np.maximum(np.bincount(anu_array) / len(anu_array), 1e-10)))
            results['comparison_metrics']['entropy_difference'] = abs(local_entropy - anu_entropy)
            
            # Overall validation score
            mean_score = 1.0 - min(results['comparison_metrics']['mean_difference'] / 127.5, 1.0)
            std_score = 1.0 - min(results['comparison_metrics']['std_difference'] / 73.9, 1.0)
            entropy_score = 1.0 - min(results['comparison_metrics']['entropy_difference'] / 8.0, 1.0)
            
            results['overall_score'] = (mean_score + std_score + entropy_score) / 3
            results['validation_passed'] = results['overall_score'] > 0.8
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error in ANU validation: {str(e)}")
            return {
                'validation_type': 'anu_comparison',
                'error': str(e),
                'validation_passed': False,
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def clear_cache(self):
        """Clear the response cache"""
        with self.cache_lock:
            self.cache.clear()
        self.logger.info("ANU API cache cleared")
    
    def reset_stats(self):
        """Reset API statistics"""
        self.stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'cache_hits': 0,
            'total_bytes_received': 0,
            'average_response_time': 0.0,
            'last_request_time': None,
            'api_status': 'unknown'
        }
        self.logger.info("ANU API statistics reset")