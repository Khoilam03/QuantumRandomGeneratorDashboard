# Quantum Random Generator Dashboard

A high-throughput quantum random number generation dashboard featuring FPGA-based quantum noise simulation and ANU quantum API validation. This full-stack application provides real-time quantum entropy generation with comprehensive performance monitoring and cryptographic key generation capabilities.

## Features

- **High-Throughput Generation**: 50+ Mbps quantum entropy generation
- **FPGA Simulation**: Advanced quantum noise modeling with von Neumann debiasing
- **ANU Validation**: External validation against Australian National University quantum sources
- **Interactive Dashboard**: Real-time performance metrics and system health monitoring
- **Cryptographic Keys**: Quantum-seeded key generation for high-security applications
- **REST API**: Comprehensive endpoints for random data and key generation
- **Performance Monitoring**: Detailed throughput, latency, and quality metrics

## Architecture

### Frontend (React + Vite)
- Modern React 19.1.1 dashboard with quantum-themed styling
- Real-time visualization of generation throughput and performance
- Interactive controls for random data and cryptographic key generation
- Technical simulations explaining quantum generation techniques

### Backend (Python Flask)
- Flask API server with quantum random number generators
- FPGA-based quantum noise simulation
- ANU Quantum API integration for validation
- Performance monitoring and statistical analysis
- Cryptographic utilities for secure key generation

## Quick Start

### Prerequisites
- Node.js (for frontend)
- Python 3.10+ and conda (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd QuantumRandomGeneratorDashboard
   ```

2. **Setup Backend**
   ```bash
   conda env create -f environment.yml
   conda activate quantumenv
   cd backend
   python app.py
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Dashboard**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Endpoints

### Random Generation
- `POST /api/generate/boolean` - Generate quantum boolean values
- `POST /api/generate/hash` - Generate quantum-seeded hashes  
- `POST /api/generate/number` - Generate quantum random numbers
- `POST /api/generate/custom` - Generate custom category selections
- `GET /api/generate/techniques` - Get available generation techniques

### Core API
- `POST /api/random` - Generate quantum random data
- `POST /api/keys` - Generate cryptographic keys
- `POST /api/validate` - Validate randomness quality

### Monitoring
- `GET /api/stats` - Performance statistics
- `GET /api/throughput` - Real-time throughput data
- `GET /health` - Health check

## Usage Examples

### Generate Random Numbers
```bash
curl -X POST http://localhost:5000/api/generate/number \
  -H "Content-Type: application/json" \
  -d '{"type": "integer", "min": 1, "max": 100, "count": 5, "technique": "fpga"}'
```

### Generate Cryptographic Keys
```bash
curl -X POST http://localhost:5000/api/keys \
  -H "Content-Type: application/json" \
  -d '{"key_size_bits": 256, "type": "symmetric", "format": "hex"}'
```

### Generate Random Data
```bash
curl -X POST http://localhost:5000/api/random \
  -H "Content-Type: application/json" \
  -d '{"size_bytes": 32, "source": "fpga", "format": "hex"}'
```

## Development

### Frontend Development
```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Backend Development
```bash
cd backend
python app.py                    # Start server
FLASK_DEBUG=True python app.py   # Start with debug mode
```

## Project Structure

```
QuantumRandomGeneratorDashboard/
├── frontend/                    # React + Vite dashboard
│   ├── src/components/         # Dashboard components
│   └── package.json           # Frontend dependencies
├── backend/                    # Python Flask API
│   ├── src/generators/        # Quantum RNG implementations
│   ├── src/api/              # API routes
│   ├── src/utils/            # Utilities and monitoring
│   └── app.py                # Flask entry point
├── environment.yml           # Conda environment
└── README.md                # This file
```

## Technical Details

### Quantum Generation Techniques
- **FPGA Simulation**: High-speed quantum noise modeling
- **ANU API**: Real quantum source validation
- **Statistical Testing**: Multiple entropy quality tests
- **Debiasing**: von Neumann bias correction

### Performance Monitoring
- Real-time throughput tracking
- Latency percentile analysis
- Quality assurance metrics
- System health monitoring

### Security Features
- Cryptographically secure key generation
- Quantum entropy sources
- Statistical randomness validation
- High-entropy output guaranteed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure quality
5. Submit a pull request

## License

[Add your license information here]
