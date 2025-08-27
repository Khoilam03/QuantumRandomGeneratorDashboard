from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
from datetime import datetime
import os

from src.api.routes import api_bp
from src.api.generate_routes import generate_bp
from src.config.settings import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for all routes
    CORS(app, origins=["http://localhost:5173"])  # Vite default port
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(generate_bp, url_prefix='/api/generate')
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'quantum-random-generator'
        })
    
    # Root endpoint
    @app.route('/')
    def root():
        return jsonify({
            'message': 'Quantum Random Generator API',
            'version': '1.0.0',
            'documentation': '/api/docs'
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )