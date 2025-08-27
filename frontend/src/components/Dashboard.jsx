import { useState, useEffect } from 'react'
import TechniqueSimulations from './TechniqueSimulations'

const Dashboard = ({ apiUrl }) => {
  
  const [systemStatus, setSystemStatus] = useState({
    connected: false,
    loading: true
  })

  useEffect(() => {
    checkConnection()
  }, [apiUrl])

  const checkConnection = async () => {
    try {
      const response = await fetch(`${apiUrl.replace('/api', '')}/health`)
      setSystemStatus({
        connected: response.ok,
        loading: false
      })
    } catch (error) {
      setSystemStatus({
        connected: false,
        loading: false
      })
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        
        {/* Introduction Section */}
        <div className="dashboard-section intro">
          <h2>Quantum Computing Dashboard</h2>
          <div className="intro-content">
            <p>
              Welcome to our comprehensive Quantum Computing Dashboard! This platform demonstrates 
              advanced quantum technologies including high-throughput random number generation and 
              secure multi-party computation using cutting-edge cryptographic protocols.
            </p>
            
            <div className="quantum-explanation">
              <h3>How Quantum Randomness Works</h3>
              
              <div className="detailed-explanation">
                <h4>The Quantum Advantage</h4>
                <p>
                  Classical computers generate pseudo-random numbers using deterministic algorithms. 
                  While these appear random, they're actually predictable if you know the initial state. 
                  Quantum random number generators (QRNGs) exploit the fundamental unpredictability 
                  of quantum mechanics to produce true randomness.
                </p>
                
                <h4>Quantum Physical Processes</h4>
                <p>
                  Our system uses quantum phenomena where outcomes are genuinely unpredictable:
                </p>
                <ul>
                  <li><strong>Photon Detection:</strong> Single photons hit a beam splitter with exactly 50% probability of going either direction</li>
                  <li><strong>Quantum Tunneling:</strong> Electrons randomly tunnel through energy barriers</li>
                  <li><strong>Radioactive Decay:</strong> Individual atomic decay events occur at truly random intervals</li>
                  <li><strong>Vacuum Fluctuations:</strong> Even empty space has quantum noise from virtual particles</li>
                </ul>
              </div>

              <div className="explanation-grid">
                <div className="explanation-item">
                  <div className="explanation-icon">⚛️</div>
                  <div className="explanation-text">
                    <h4>Quantum Superposition</h4>
                    <p>Particles exist in multiple states simultaneously until measured. The measurement forces a random collapse to one state, providing our entropy source.</p>
                  </div>
                </div>
                
                <div className="explanation-item">
                  <div className="explanation-icon">🔬</div>
                  <div className="explanation-text">
                    <h4>FPGA Processing</h4>
                    <p>Field-Programmable Gate Arrays capture quantum events in real-time, amplify weak signals, and convert physical randomness into digital bits at >50 Mbps.</p>
                  </div>
                </div>
                
                <div className="explanation-item">
                  <div className="explanation-icon">📊</div>
                  <div className="explanation-text">
                    <h4>Entropy Extraction</h4>
                    <p>Raw quantum noise is processed through von Neumann extractors and cryptographic hash functions to remove bias and ensure uniform distribution.</p>
                  </div>
                </div>
                
                <div className="explanation-item">
                  <div className="explanation-icon">✅</div>
                  <div className="explanation-text">
                    <h4>Statistical Testing</h4>
                    <p>Generated bits pass NIST SP 800-22 randomness tests and are validated against ANU's quantum service for quality assurance.</p>
                  </div>
                </div>
                
                <div className="explanation-item">
                  <div className="explanation-icon">🔐</div>
                  <div className="explanation-text">
                    <h4>Cryptographic Security</h4>
                    <p>True quantum randomness provides perfect forward secrecy and resistance against quantum computer attacks on cryptographic keys.</p>
                  </div>
                </div>
                
                <div className="explanation-item">
                  <div className="explanation-icon">🌌</div>
                  <div className="explanation-text">
                    <h4>Bell's Theorem</h4>
                    <p>Quantum entanglement proves no hidden variables determine outcomes, confirming the fundamental randomness of quantum measurements.</p>
                  </div>
                </div>
              </div>

              <div className="technical-details">
                <h4>Technical Implementation</h4>
                <div className="implementation-steps">
                  <div className="impl-step">
                    <strong>1. Quantum Event Capture:</strong> Photodetectors measure individual photon arrivals at beam splitters
                  </div>
                  <div className="impl-step">
                    <strong>2. Signal Conditioning:</strong> Analog circuits amplify and digitize quantum signals
                  </div>
                  <div className="impl-step">
                    <strong>3. Bias Correction:</strong> Von Neumann extractors eliminate systematic biases
                  </div>
                  <div className="impl-step">
                    <strong>4. Health Monitoring:</strong> Continuous statistical tests detect equipment malfunctions
                  </div>
                  <div className="impl-step">
                    <strong>5. Output Processing:</strong> Final entropy is formatted for cryptographic applications
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technique Simulations */}
        <div className="dashboard-section simulations">
          <TechniqueSimulations />
        </div>

        {/* System Status */}
        <div className="dashboard-section status">
          <h2>System Status</h2>
          <div className="status-content">
            {systemStatus.loading ? (
              <div className="status-loading">
                <div className="loading-spinner">⚛️</div>
                <p>Checking quantum system status...</p>
              </div>
            ) : (
              <div className="status-display">
                <div className={`status-indicator ${systemStatus.connected ? 'connected' : 'disconnected'}`}>
                  <div className="status-dot"></div>
                  <span className="status-text">
                    Quantum API: {systemStatus.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
                
                <div className="status-info">
                  {systemStatus.connected ? (
                    <p>✅ Ready to generate quantum random data. Use the Generator tab to start creating random values.</p>
                  ) : (
                    <div>
                      <p>❌ Cannot connect to quantum backend. Please ensure the backend server is running.</p>
                      <button onClick={checkConnection} className="retry-button">
                        Retry Connection
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Research Papers and References */}
        <div className="dashboard-section research">
          <h2>Scientific Research & Papers</h2>
          <div className="research-content">
            <p>
              Quantum random number generation is an active area of research. Here are key papers 
              and resources to understand the theoretical foundations and practical implementations:
            </p>

            <div className="papers-section">
              <h4>Foundational Papers</h4>
              <div className="paper-links">
                <div className="paper-item">
                  <h5>Quantum Random Number Generators</h5>
                  <p><strong>Authors:</strong> Herrero-Collantes, M. & Garcia-Escartin, J.C.</p>
                  <p><strong>Journal:</strong> Reviews of Modern Physics (2017)</p>
                  <a href="https://arxiv.org/abs/1604.03304" target="_blank" rel="noopener noreferrer" className="paper-link">
                    📄 Read on arXiv
                  </a>
                  <p className="paper-summary">Comprehensive review of QRNG principles, implementations, and applications.</p>
                </div>

                <div className="paper-item">
                  <h5>Fast Physical Random Number Generator using Amplified Spontaneous Emission</h5>
                  <p><strong>Authors:</strong> Qi, B., Chi, Y.-M., Lo, H.-K., & Qian, L.</p>
                  <p><strong>Journal:</strong> Optics Letters (2010)</p>
                  <a href="https://opg.optica.org/ol/abstract.cfm?uri=ol-35-3-312" target="_blank" rel="noopener noreferrer" className="paper-link">
                    📄 Read Paper
                  </a>
                  <p className="paper-summary">High-speed QRNG implementation achieving Gbps rates.</p>
                </div>

                <div className="paper-item">
                  <h5>Quantum Random Number Generation using Phase Noise from Frequency Qubits</h5>
                  <p><strong>Authors:</strong> Brask, J.B., Martin, A., Esposito, W., et al.</p>
                  <p><strong>Journal:</strong> Quantum Science and Technology (2018)</p>
                  <a href="https://arxiv.org/abs/1801.08121" target="_blank" rel="noopener noreferrer" className="paper-link">
                    📄 Read on arXiv
                  </a>
                  <p className="paper-summary">Novel approach using superconducting qubits for random number generation.</p>
                </div>
              </div>

              <h4>Cryptographic Applications</h4>
              <div className="paper-links">
                <div className="paper-item">
                  <h5>NIST SP 800-90B: Entropy Estimation for Random Number Generators</h5>
                  <p><strong>Institution:</strong> National Institute of Standards and Technology</p>
                  <a href="https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90B.pdf" target="_blank" rel="noopener noreferrer" className="paper-link">
                    📄 NIST Publication
                  </a>
                  <p className="paper-summary">Standard methods for estimating entropy in random number generators.</p>
                </div>

                <div className="paper-item">
                  <h5>Device-Independent Quantum Random Number Generation</h5>
                  <p><strong>Authors:</strong> Pironio, S., Acín, A., Massar, S., et al.</p>
                  <p><strong>Journal:</strong> Nature (2010)</p>
                  <a href="https://www.nature.com/articles/nature09008" target="_blank" rel="noopener noreferrer" className="paper-link">
                    📄 Nature Article
                  </a>
                  <p className="paper-summary">Theoretical foundation for device-independent random number certification.</p>
                </div>
              </div>

              <h4>Implementation Studies</h4>
              <div className="paper-links">
                <div className="paper-item">
                  <h5>Australian National University Quantum Random Number Server</h5>
                  <p><strong>Institution:</strong> ANU Centre for Quantum Computation</p>
                  <a href="https://qrng.anu.edu.au/" target="_blank" rel="noopener noreferrer" className="paper-link">
                    🌐 ANU QRNG Service
                  </a>
                  <p className="paper-summary">Live quantum random number service used for validation in our system.</p>
                </div>

                <div className="paper-item">
                  <h5>Real-Time Demonstration of High Bitrate Quantum Random Number Generation</h5>
                  <p><strong>Authors:</strong> Applegate, M., Thomas, O., Dynes, J.F., et al.</p>
                  <p><strong>Journal:</strong> Applied Physics Letters (2015)</p>
                  <a href="https://arxiv.org/abs/1509.06216" target="_blank" rel="noopener noreferrer" className="paper-link">
                    📄 Read on arXiv
                  </a>
                  <p className="paper-summary">Practical implementation achieving high-speed quantum random number generation.</p>
                </div>
              </div>

              <h4>Theoretical Foundations</h4>
              <div className="paper-links">
                <div className="paper-item">
                  <h5>Bell's Theorem and Quantum Random Number Generation</h5>
                  <p><strong>Authors:</strong> Bell, J.S.</p>
                  <p><strong>Journal:</strong> Physics Physique Физика (1964)</p>
                  <a href="https://cds.cern.ch/record/111654/files/vol1p195-200_001.pdf" target="_blank" rel="noopener noreferrer" className="paper-link">
                    📄 Original Paper
                  </a>
                  <p className="paper-summary">Foundational work proving quantum mechanics contains no hidden variables.</p>
                </div>

                <div className="paper-item">
                  <h5>Quantum Mechanics and Hidden Variables</h5>
                  <p><strong>Authors:</strong> Aspect, A., Dalibard, J., & Roger, G.</p>
                  <p><strong>Journal:</strong> Physical Review Letters (1982)</p>
                  <a href="https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.49.1804" target="_blank" rel="noopener noreferrer" className="paper-link">
                    📄 PRL Article
                  </a>
                  <p className="paper-summary">Experimental confirmation of Bell's theorem violations.</p>
                </div>
              </div>
            </div>

            <div className="external-resources">
              <h4>Additional Resources</h4>
              <div className="resource-links">
                <a href="https://www.quantum-rng.com/" target="_blank" rel="noopener noreferrer" className="resource-link">
                  🔗 Quantum RNG Consortium
                </a>
                <a href="https://csrc.nist.gov/projects/random-bit-generation" target="_blank" rel="noopener noreferrer" className="resource-link">
                  🔗 NIST Random Bit Generation
                </a>
                <a href="https://www.idquantique.com/random-number-generation/" target="_blank" rel="noopener noreferrer" className="resource-link">
                  🔗 ID Quantique QRNG
                </a>
                <a href="https://arxiv.org/list/quant-ph/recent" target="_blank" rel="noopener noreferrer" className="resource-link">
                  🔗 Latest Quantum Physics Papers
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="dashboard-section instructions">
          <h2>How to Use</h2>
          <div className="instructions-content">
            <div className="instruction-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Choose Generation Type</h4>
                  <p>Navigate to the Generator tab and select from Boolean, Hash, Number, or Custom categories.</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Configure Options</h4>
                  <p>Set your parameters (range for numbers, options for custom categories, etc.).</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Generate</h4>
                  <p>Click generate to receive your quantum-random result instantly.</p>
                </div>
              </div>
            </div>
            
            <div className="generation-types">
              <h4>Available Generation Types:</h4>
              <div className="types-grid">
                <div className="type-item">
                  <span className="type-icon">🔄</span>
                  <span className="type-name">Boolean</span>
                  <span className="type-desc">True/False values from quantum superposition collapse</span>
                </div>
                <div className="type-item">
                  <span className="type-icon">#️⃣</span>
                  <span className="type-name">Hash</span>
                  <span className="type-desc">Cryptographic hashes seeded with quantum entropy</span>
                </div>
                <div className="type-item">
                  <span className="type-icon">🔢</span>
                  <span className="type-name">Number</span>
                  <span className="type-desc">Random integers/floats from quantum measurements</span>
                </div>
                <div className="type-item">
                  <span className="type-icon">📝</span>
                  <span className="type-name">Custom</span>
                  <span className="type-desc">Selection from your categories using quantum randomness</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard