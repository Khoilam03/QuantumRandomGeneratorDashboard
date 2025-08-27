from flask import Blueprint, jsonify, request
from datetime import datetime
import time
import logging

from ..generators.quantum_rng import QuantumRandomGenerator
from ..generators.fpga_simulator import FPGASimulator
from ..generators.anu_api import ANUQuantumAPI
from ..utils.performance_monitor import PerformanceMonitor
from ..utils.crypto_utils import CryptoUtils

api_bp = Blueprint('api', __name__)
logger = logging.getLogger(__name__)

# Initialize components
quantum_rng = QuantumRandomGenerator()
fpga_sim = FPGASimulator()
anu_api = ANUQuantumAPI()
perf_monitor = PerformanceMonitor()
crypto_utils = CryptoUtils()

@api_bp.route('/docs')
def api_docs():
    return jsonify({
        'title': 'Quantum Random Generator API',
        'version': '1.0.0',
        'description': 'FPGA-based and ANU-API validated quantum random number generation',
        'endpoints': {
            '/random': 'Generate quantum random numbers',
            '/keys': 'Generate cryptographic keys',
            '/stats': 'Get performance statistics',
            '/throughput': 'Get real-time throughput data',
            '/validate': 'Validate random data quality'
        }
    })

@api_bp.route('/random', methods=['POST'])
def generate_random():
    try:
        data = request.get_json() or {}
        size_bytes = data.get('size_bytes', 32)
        source = data.get('source', 'fpga')  # 'fpga' or 'anu'
        format_type = data.get('format', 'hex')  # 'hex', 'base64', 'raw'
        
        start_time = time.time()
        
        if source == 'fpga':
            random_data = fpga_sim.generate_random_bytes(size_bytes)
        elif source == 'anu':
            random_data = anu_api.generate_random_bytes(size_bytes)
        else:
            return jsonify({'error': 'Invalid source. Use "fpga" or "anu"'}), 400
        
        generation_time = time.time() - start_time
        throughput_mbps = (size_bytes * 8) / (generation_time * 1_000_000)
        
        # Record performance metrics
        perf_monitor.record_generation(size_bytes, generation_time, source)
        
        # Format output
        if format_type == 'hex':
            formatted_data = random_data.hex()
        elif format_type == 'base64':
            import base64
            formatted_data = base64.b64encode(random_data).decode('utf-8')
        else:
            formatted_data = list(random_data)
        
        return jsonify({
            'data': formatted_data,
            'metadata': {
                'size_bytes': size_bytes,
                'source': source,
                'format': format_type,
                'generation_time_ms': round(generation_time * 1000, 2),
                'throughput_mbps': round(throughput_mbps, 2),
                'timestamp': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error generating random data: {str(e)}")
        return jsonify({'error': 'Failed to generate random data'}), 500

@api_bp.route('/keys', methods=['POST'])
def generate_crypto_keys():
    try:
        data = request.get_json() or {}
        key_size_bits = data.get('key_size_bits', 256)
        key_type = data.get('type', 'symmetric')  # 'symmetric', 'aes', 'rsa_seed'
        format_type = data.get('format', 'hex')
        
        start_time = time.time()
        
        # Generate high-entropy random data for key material
        key_bytes = key_size_bits // 8
        random_data = fpga_sim.generate_random_bytes(key_bytes)
        
        # Process based on key type
        if key_type == 'symmetric' or key_type == 'aes':
            key_data = crypto_utils.generate_symmetric_key(random_data, key_size_bits)
        elif key_type == 'rsa_seed':
            key_data = crypto_utils.generate_rsa_seed(random_data)
        else:
            return jsonify({'error': 'Invalid key type'}), 400
        
        generation_time = time.time() - start_time
        
        # Format output
        if format_type == 'hex':
            formatted_key = key_data.hex() if isinstance(key_data, bytes) else key_data
        elif format_type == 'base64':
            import base64
            formatted_key = base64.b64encode(key_data).decode('utf-8') if isinstance(key_data, bytes) else key_data
        else:
            formatted_key = list(key_data) if isinstance(key_data, bytes) else key_data
        
        return jsonify({
            'key': formatted_key,
            'metadata': {
                'key_size_bits': key_size_bits,
                'key_type': key_type,
                'format': format_type,
                'generation_time_ms': round(generation_time * 1000, 2),
                'entropy_source': 'fpga_quantum',
                'timestamp': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error generating crypto key: {str(e)}")
        return jsonify({'error': 'Failed to generate cryptographic key'}), 500

@api_bp.route('/stats')
def get_statistics():
    try:
        stats = perf_monitor.get_statistics()
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        return jsonify({'error': 'Failed to retrieve statistics'}), 500

@api_bp.route('/throughput')
def get_throughput():
    try:
        throughput_data = perf_monitor.get_real_time_throughput()
        return jsonify(throughput_data)
    except Exception as e:
        logger.error(f"Error getting throughput data: {str(e)}")
        return jsonify({'error': 'Failed to retrieve throughput data'}), 500

@api_bp.route('/validate', methods=['POST'])
def validate_randomness():
    try:
        data = request.get_json() or {}
        test_size_mb = data.get('test_size_mb', 1)
        
        # Generate test data
        test_bytes = test_size_mb * 1024 * 1024
        random_data = fpga_sim.generate_random_bytes(test_bytes)
        
        # Run randomness tests
        validation_results = quantum_rng.validate_randomness(random_data)
        
        return jsonify({
            'validation_results': validation_results,
            'test_size_mb': test_size_mb,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error validating randomness: {str(e)}")
        return jsonify({'error': 'Failed to validate randomness'}), 500