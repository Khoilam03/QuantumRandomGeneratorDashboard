import numpy as np
import hashlib
import logging
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)

class QuantumRandomGenerator:
    """
    Core quantum random number generator with validation and quality assessment.
    """
    
    def __init__(self):
        self.logger = logger
        self.generation_history = []
        
    def validate_randomness(self, data: bytes) -> Dict[str, Any]:
        """
        Perform statistical tests on random data to validate quality.
        
        Args:
            data: Random bytes to validate
            
        Returns:
            Dictionary containing validation results
        """
        try:
            results = {
                'timestamp': datetime.utcnow().isoformat(),
                'data_size_bytes': len(data),
                'tests': {}
            }
            
            # Convert to numpy array for analysis
            data_array = np.frombuffer(data, dtype=np.uint8)
            
            # Test 1: Frequency (Monobit) Test
            results['tests']['frequency_test'] = self._frequency_test(data_array)
            
            # Test 2: Runs Test
            results['tests']['runs_test'] = self._runs_test(data_array)
            
            # Test 3: Chi-Square Test
            results['tests']['chi_square_test'] = self._chi_square_test(data_array)
            
            # Test 4: Entropy Calculation
            results['tests']['entropy'] = self._calculate_entropy(data_array)
            
            # Test 5: Serial Correlation Test
            results['tests']['serial_correlation'] = self._serial_correlation_test(data_array)
            
            # Overall assessment
            passed_tests = sum(1 for test in results['tests'].values() 
                             if isinstance(test, dict) and test.get('passed', False))
            total_tests = len([t for t in results['tests'].values() if isinstance(t, dict)])
            
            results['overall_quality'] = {
                'passed_tests': passed_tests,
                'total_tests': total_tests,
                'quality_score': passed_tests / total_tests if total_tests > 0 else 0,
                'assessment': 'GOOD' if passed_tests >= total_tests * 0.8 else 'FAIR' if passed_tests >= total_tests * 0.6 else 'POOR'
            }
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error validating randomness: {str(e)}")
            return {'error': str(e)}
    
    def _frequency_test(self, data: np.ndarray) -> Dict[str, Any]:
        """Monobit frequency test"""
        try:
            # Convert to bits
            bits = np.unpackbits(data)
            ones = np.sum(bits)
            zeros = len(bits) - ones
            
            # Expected frequency should be close to 50%
            expected = len(bits) / 2
            chi_square = ((ones - expected) ** 2 + (zeros - expected) ** 2) / expected
            
            # Critical value for chi-square with 1 degree of freedom at 95% confidence
            critical_value = 3.841
            passed = chi_square < critical_value
            
            return {
                'ones': int(ones),
                'zeros': int(zeros),
                'total_bits': len(bits),
                'chi_square': float(chi_square),
                'critical_value': critical_value,
                'passed': passed
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _runs_test(self, data: np.ndarray) -> Dict[str, Any]:
        """Test for runs of consecutive identical bits"""
        try:
            bits = np.unpackbits(data)
            n = len(bits)
            
            # Count runs
            runs = 1
            for i in range(1, n):
                if bits[i] != bits[i-1]:
                    runs += 1
            
            # Expected number of runs
            ones = np.sum(bits)
            expected_runs = (2 * ones * (n - ones)) / n + 1
            
            # Variance of runs
            variance = (2 * ones * (n - ones) * (2 * ones * (n - ones) - n)) / (n * n * (n - 1))
            
            if variance > 0:
                z_score = abs(runs - expected_runs) / np.sqrt(variance)
                passed = z_score < 1.96  # 95% confidence
            else:
                z_score = 0
                passed = True
            
            return {
                'runs_observed': runs,
                'runs_expected': float(expected_runs),
                'z_score': float(z_score),
                'passed': passed
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _chi_square_test(self, data: np.ndarray) -> Dict[str, Any]:
        """Chi-square test for uniform distribution of bytes"""
        try:
            # Count frequency of each byte value (0-255)
            observed = np.bincount(data, minlength=256)
            expected = len(data) / 256
            
            # Calculate chi-square statistic
            chi_square = np.sum((observed - expected) ** 2 / expected)
            
            # Critical value for 255 degrees of freedom at 95% confidence
            critical_value = 293.25
            passed = chi_square < critical_value
            
            return {
                'chi_square': float(chi_square),
                'critical_value': critical_value,
                'degrees_of_freedom': 255,
                'passed': passed
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _calculate_entropy(self, data: np.ndarray) -> Dict[str, Any]:
        """Calculate Shannon entropy"""
        try:
            # Count frequency of each byte value
            counts = np.bincount(data, minlength=256)
            probabilities = counts / len(data)
            
            # Remove zero probabilities to avoid log(0)
            probabilities = probabilities[probabilities > 0]
            
            # Calculate Shannon entropy
            entropy = -np.sum(probabilities * np.log2(probabilities))
            max_entropy = 8.0  # Maximum entropy for 8-bit values
            
            return {
                'entropy': float(entropy),
                'max_entropy': max_entropy,
                'entropy_ratio': float(entropy / max_entropy),
                'passed': entropy > 7.5  # Good entropy threshold
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _serial_correlation_test(self, data: np.ndarray) -> Dict[str, Any]:
        """Test for correlation between consecutive bytes"""
        try:
            if len(data) < 2:
                return {'error': 'Insufficient data for correlation test'}
            
            # Calculate correlation coefficient
            x = data[:-1].astype(float)
            y = data[1:].astype(float)
            
            correlation = np.corrcoef(x, y)[0, 1]
            
            # For good randomness, correlation should be close to 0
            passed = abs(correlation) < 0.1
            
            return {
                'correlation': float(correlation) if not np.isnan(correlation) else 0.0,
                'threshold': 0.1,
                'passed': passed
            }
        except Exception as e:
            return {'error': str(e)}
    
    def get_quality_metrics(self, data: bytes) -> Dict[str, float]:
        """Get quick quality metrics for real-time monitoring"""
        try:
            data_array = np.frombuffer(data, dtype=np.uint8)
            
            # Quick entropy calculation
            counts = np.bincount(data_array, minlength=256)
            probabilities = counts / len(data_array)
            probabilities = probabilities[probabilities > 0]
            entropy = -np.sum(probabilities * np.log2(probabilities))
            
            # Quick frequency test
            bits = np.unpackbits(data_array)
            ones_ratio = np.sum(bits) / len(bits)
            
            return {
                'entropy': float(entropy),
                'ones_ratio': float(ones_ratio),
                'uniformity_score': 1.0 - abs(ones_ratio - 0.5) * 2
            }
        except Exception:
            return {'entropy': 0.0, 'ones_ratio': 0.5, 'uniformity_score': 0.0}