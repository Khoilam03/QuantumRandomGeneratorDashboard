from flask import Blueprint, jsonify, request
from datetime import datetime
import time
import logging
import hashlib
import secrets

from ..generators.fpga_simulator import FPGASimulator
from ..generators.anu_api import ANUQuantumAPI
from ..generators.quantum_rng import QuantumRandomGenerator
from ..utils.performance_monitor import PerformanceMonitor

generate_bp = Blueprint('generate', __name__)
logger = logging.getLogger(__name__)

# Initialize components
fpga_sim = FPGASimulator()
anu_api = ANUQuantumAPI()
quantum_rng = QuantumRandomGenerator()
perf_monitor = PerformanceMonitor()

# Available random generation techniques
TECHNIQUES = {
    'fpga': {
        'name': 'FPGA Quantum Simulation',
        'description': 'High-speed quantum noise simulation with thermal/shot noise',
        'generator': fpga_sim,
        'default': True
    },
    'anu': {
        'name': 'ANU Quantum API',
        'description': 'Real quantum random numbers (LIMITED: 1 request/minute)',
        'generator': anu_api,
        'default': False
    },
    'hybrid': {
        'name': 'Hybrid (FPGA + ANU Validation)',
        'description': 'FPGA generation with ANU quantum validation',
        'generator': fpga_sim,  # Primary generator
        'default': False
    },
    'cryptographic': {
        'name': 'Cryptographically Secure',
        'description': 'OS-level cryptographic randomness (secrets module)',
        'generator': None,  # Special case
        'default': False
    },
}

def get_random_bytes(size: int, technique: str = 'fpga') -> tuple[bytes, dict]:
    """Get random bytes using specified technique"""
    start_time = time.time()
    metadata = {'technique': technique, 'generation_time_ms': 0}
    
    try:
        if technique not in TECHNIQUES:
            raise ValueError(f"Unknown technique: {technique}")
        
        if technique == 'fpga':
            data = fpga_sim.generate_random_bytes(size)
            metadata['source'] = 'FPGA Quantum Simulator'
            
        elif technique == 'anu':
            data = anu_api.generate_random_bytes(size)
            metadata['source'] = 'ANU Quantum API'
            
        elif technique == 'hybrid':
            # Generate with FPGA, validate with ANU sample
            data = fpga_sim.generate_random_bytes(size)
            validation_sample_size = min(size, 100)
            try:
                validation = anu_api.validate_with_anu(data, validation_sample_size)
                metadata['validation'] = validation
                metadata['validation_passed'] = validation.get('validation_passed', False)
            except:
                metadata['validation'] = {'error': 'ANU validation failed'}
                metadata['validation_passed'] = False
            metadata['source'] = 'FPGA + ANU Validation'
            
        elif technique == 'cryptographic':
            data = secrets.token_bytes(size)
            metadata['source'] = 'OS Cryptographic'
            
        else:
            raise ValueError(f"Unsupported technique: {technique}")
        
        # Add quality metrics
        try:
            quality = quantum_rng.get_quality_metrics(data)
            metadata['quality_metrics'] = quality
        except:
            metadata['quality_metrics'] = {}
        
        metadata['generation_time_ms'] = round((time.time() - start_time) * 1000, 2)
        metadata['size_bytes'] = len(data)
        
        return data, metadata
        
    except Exception as e:
        logger.error(f"Error generating random bytes with {technique}: {str(e)}")
        # Fallback to FPGA if other techniques fail
        if technique != 'fpga':
            logger.info(f"Falling back to FPGA technique")
            return get_random_bytes(size, 'fpga')
        raise

@generate_bp.route('/boolean', methods=['POST'])
def generate_boolean():
    """Generate quantum random boolean values"""
    try:
        data = request.get_json() or {}
        count = min(data.get('count', 1), 100)  # Limit to 100 values
        technique = data.get('technique', 'fpga')
        
        # Generate random bytes and convert to booleans
        bytes_needed = (count + 7) // 8  # Ceiling division
        random_bytes, gen_metadata = get_random_bytes(bytes_needed, technique)
        
        # Extract boolean values from random bytes
        results = []
        for i in range(count):
            byte_index = i // 8
            bit_index = i % 8
            bit_value = (random_bytes[byte_index] >> bit_index) & 1
            results.append(bool(bit_value))
        
        # Record performance
        perf_monitor.record_generation(bytes_needed, gen_metadata['generation_time_ms'] / 1000, technique)
        
        # Combine metadata
        metadata = {
            'count': count,
            'type': 'boolean',
            'timestamp': datetime.utcnow().isoformat(),
            **gen_metadata
        }
        
        return jsonify({
            'results': results,
            'metadata': metadata
        })
        
    except Exception as e:
        logger.error(f"Error generating boolean values: {str(e)}")
        return jsonify({'error': 'Failed to generate boolean values'}), 500

@generate_bp.route('/hash', methods=['POST'])
def generate_hash():
    """Generate quantum-seeded cryptographic hashes"""
    try:
        data = request.get_json() or {}
        algorithm = data.get('algorithm', 'sha256')
        count = min(data.get('count', 1), 20)  # Limit to 20 hashes
        
        start_time = time.time()
        
        # Validate algorithm
        hash_functions = {
            'sha256': hashlib.sha256,
            'sha512': hashlib.sha512,
            'md5': hashlib.md5,
            'blake2b': hashlib.blake2b
        }
        
        if algorithm not in hash_functions:
            return jsonify({'error': 'Unsupported hash algorithm'}), 400
        
        hash_func = hash_functions[algorithm]
        
        results = []
        total_bytes = 0
        
        technique = data.get('technique', 'fpga')
        
        for _ in range(count):
            # Generate quantum random seed (32 bytes for strong entropy)
            random_seed, seed_metadata = get_random_bytes(32, technique)
            total_bytes += 32
            
            # Create hash
            if algorithm == 'blake2b':
                hash_obj = hash_func(random_seed)
            else:
                hash_obj = hash_func()
                hash_obj.update(random_seed)
            
            results.append(hash_obj.hexdigest())
        
        generation_time = time.time() - start_time
        
        # Record performance
        perf_monitor.record_generation(total_bytes, generation_time, 'fpga')
        
        return jsonify({
            'results': results,
            'metadata': {
                'count': count,
                'type': 'hash',
                'algorithm': algorithm,
                'generation_time_ms': round(generation_time * 1000, 2),
                'timestamp': datetime.utcnow().isoformat(),
                'technique': technique,
                'source': seed_metadata.get('source', 'Unknown')
            }
        })
        
    except Exception as e:
        logger.error(f"Error generating hash values: {str(e)}")
        return jsonify({'error': 'Failed to generate hash values'}), 500

@generate_bp.route('/number', methods=['POST'])
def generate_number():
    """Generate quantum random numbers"""
    try:
        data = request.get_json() or {}
        number_type = data.get('type', 'integer')
        count = min(data.get('count', 1), 100)  # Limit to 100 numbers
        technique = data.get('technique', 'fpga')
        
        start_time = time.time()
        
        if number_type == 'integer':
            min_val = data.get('min', 1)
            max_val = data.get('max', 100)
            
            if min_val >= max_val:
                return jsonify({'error': 'Minimum value must be less than maximum value'}), 400
            
            range_size = max_val - min_val + 1
            
            # Calculate bytes needed for uniform distribution
            bytes_per_number = 4  # Use 4 bytes per number for good distribution
            total_bytes = count * bytes_per_number
            random_bytes, gen_metadata = get_random_bytes(total_bytes, technique)
            
            results = []
            for i in range(count):
                # Extract 4 bytes and convert to integer
                byte_start = i * 4
                int_value = int.from_bytes(random_bytes[byte_start:byte_start+4], byteorder='big')
                
                # Use modulo to get value in range (with slight bias for large ranges)
                random_number = min_val + (int_value % range_size)
                results.append(random_number)
                
        elif number_type == 'float':
            # Generate random floats between 0 and 1
            bytes_per_float = 4  # Use 4 bytes per float
            total_bytes = count * bytes_per_float
            random_bytes, gen_metadata = get_random_bytes(total_bytes, technique)
            
            results = []
            for i in range(count):
                byte_start = i * 4
                int_value = int.from_bytes(random_bytes[byte_start:byte_start+4], byteorder='big')
                # Convert to float between 0 and 1
                float_value = int_value / (2**32 - 1)
                results.append(round(float_value, 6))
        else:
            return jsonify({'error': 'Invalid number type. Use "integer" or "float"'}), 400
        
        generation_time = time.time() - start_time
        
        # Record performance
        perf_monitor.record_generation(total_bytes, generation_time, 'fpga')
        
        metadata = {
            'count': count,
            'type': 'number',
            'number_type': number_type,
            'generation_time_ms': round(generation_time * 1000, 2),
            'timestamp': datetime.utcnow().isoformat(),
            **gen_metadata
        }
        
        if number_type == 'integer':
            metadata['range'] = f"{min_val}-{max_val}"
        
        return jsonify({
            'results': results,
            'metadata': metadata
        })
        
    except Exception as e:
        logger.error(f"Error generating number values: {str(e)}")
        return jsonify({'error': 'Failed to generate number values'}), 500

@generate_bp.route('/custom', methods=['POST'])
def generate_custom():
    """Generate random selections from custom categories"""
    try:
        data = request.get_json() or {}
        options = data.get('options', [])
        count = min(data.get('count', 1), 50)  # Limit to 50 selections
        technique = data.get('technique', 'fpga')
        
        if not options or len(options) == 0:
            return jsonify({'error': 'No options provided'}), 400
        
        # Clean options
        options = [str(opt).strip() for opt in options if str(opt).strip()]
        
        if len(options) == 0:
            return jsonify({'error': 'No valid options provided'}), 400
        
        start_time = time.time()
        
        # Calculate bytes needed for uniform distribution
        bytes_per_selection = 4  # Use 4 bytes per selection
        total_bytes = count * bytes_per_selection
        random_bytes, gen_metadata = get_random_bytes(total_bytes, technique)
        
        results = []
        for i in range(count):
            # Extract 4 bytes and convert to integer
            byte_start = i * 4
            int_value = int.from_bytes(random_bytes[byte_start:byte_start+4], byteorder='big')
            
            # Select option using modulo
            option_index = int_value % len(options)
            results.append(options[option_index])
        
        generation_time = time.time() - start_time
        
        # Record performance
        perf_monitor.record_generation(total_bytes, generation_time, technique)
        
        # Combine metadata
        metadata = {
            'count': count,
            'type': 'custom',
            'options_count': len(options),
            'generation_time_ms': round(generation_time * 1000, 2),
            'timestamp': datetime.utcnow().isoformat(),
            **gen_metadata
        }
        
        return jsonify({
            'results': results,
            'metadata': metadata
        })
        
    except Exception as e:
        logger.error(f"Error generating custom selections: {str(e)}")
        return jsonify({'error': 'Failed to generate custom selections'}), 500


@generate_bp.route('/techniques', methods=['GET'])
def get_techniques():
    """Get available random generation techniques"""
    try:
        techniques_info = {}
        for key, info in TECHNIQUES.items():
            techniques_info[key] = {
                'name': info['name'],
                'description': info['description'],
                'default': info['default']
            }
            
            # Add status check for external APIs (but NOT for ANU to preserve quota)
            if key == 'anu':
                # Check ANU cooldown status without making a request
                import time
                current_time = time.time()
                if hasattr(anu_api, '_last_successful_request'):
                    time_since_last = current_time - anu_api._last_successful_request
                    if time_since_last < 70:  # 70 second cooldown
                        cooldown_remaining = int(70 - time_since_last)
                        techniques_info[key]['status'] = 'cooldown'
                        techniques_info[key]['cooldown_seconds'] = cooldown_remaining
                        techniques_info[key]['warning'] = f'Rate limited. Available in {cooldown_remaining}s'
                    else:
                        techniques_info[key]['status'] = 'available'
                        techniques_info[key]['warning'] = 'Ready to use (1 request per minute)'
                else:
                    # Never used before
                    techniques_info[key]['status'] = 'available'
                    techniques_info[key]['warning'] = 'Ready to use (1 request per minute)'
                techniques_info[key]['response_time_ms'] = 0
            else:
                techniques_info[key]['status'] = 'available'
        
        return jsonify({
            'techniques': techniques_info,
            'default_technique': next(k for k, v in TECHNIQUES.items() if v['default']),
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting techniques: {str(e)}")
        return jsonify({'error': 'Failed to get techniques'}), 500