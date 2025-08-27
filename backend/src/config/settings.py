import os
from datetime import timedelta

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'quantum-secure-key-development'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # API Configuration
    API_VERSION = "1.0.0"
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max request size
    
    # Quantum Generator Configuration
    FPGA_SIMULATION_MODE = os.environ.get('FPGA_SIMULATION_MODE', 'True').lower() == 'true'
    TARGET_THROUGHPUT_MBPS = 50  # Target throughput in Mbps
    
    # ANU API Configuration
    ANU_API_BASE_URL = "https://qrng.anu.edu.au/API/jsonI.php"
    ANU_API_TIMEOUT = 30  # seconds
    ANU_API_MAX_RETRIES = 3
    
    # Performance Monitoring
    PERFORMANCE_MONITORING_ENABLED = True
    STATS_COLLECTION_INTERVAL = 1  # seconds
    
    # Cryptographic Configuration
    DEFAULT_KEY_SIZE_BITS = 256
    SUPPORTED_KEY_FORMATS = ['hex', 'base64', 'raw']
    
    # Rate Limiting
    RATE_LIMIT_ENABLED = True
    RATE_LIMIT_PER_MINUTE = 100
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'