import { useState, useEffect } from 'react'
import { RotateCcw, Hash, Calculator, FileText, Play, Square, Copy, CheckCircle, XCircle, AlertTriangle, Clock, Circle } from 'lucide-react'

const GeneratorControl = ({ apiUrl }) => {
  const [activeTab, setActiveTab] = useState('boolean')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [techniques, setTechniques] = useState({
    fpga: {
      name: 'FPGA Quantum Simulation',
      description: 'High-speed quantum noise simulation with thermal/shot noise',
      status: 'operational',
      warning: 'High-speed quantum simulation ready'
    },
    anu: {
      name: 'ANU Quantum API',
      description: 'Real quantum random numbers (LIMITED: 1 request/minute)',
      status: 'available',
      warning: 'Ready to use (1 request per minute)'
    },
    hybrid: {
      name: 'Hybrid (FPGA + ANU Validation)',
      description: 'FPGA generation with ANU quantum validation',
      status: 'operational',
      warning: 'Hybrid mode ready'
    },
    cryptographic: {
      name: 'Cryptographically Secure',
      description: 'OS-level cryptographic randomness (secrets module)',
      status: 'operational',
      warning: 'System entropy ready'
    }
  })
  const [selectedTechnique, setSelectedTechnique] = useState('fpga')
  const [anurCooldownEnd, setAnuCooldownEnd] = useState(null)
  const [currentTime, setCurrentTime] = useState(Date.now())
  
  // Boolean generator state
  const [booleanRequest, setBooleanRequest] = useState({
    count: 1
  })
  
  // Hash generator state
  const [hashRequest, setHashRequest] = useState({
    algorithm: 'sha256',
    count: 1
  })
  
  // Number generator state
  const [numberRequest, setNumberRequest] = useState({
    type: 'integer',
    min: 1,
    max: 100,
    count: 1
  })
  
  // Custom generator state
  const [customRequest, setCustomRequest] = useState({
    options: 'apple,banana,cherry,date',
    count: 1
  })
  

  // Load available techniques on component mount and refresh periodically
  useEffect(() => {
    const loadTechniques = async () => {
      try {
        const res = await fetch(`${apiUrl}/generate/techniques`)
        if (res.ok) {
          const data = await res.json()
          const anurInfo = data.techniques.anu
          
          // Update ANU cooldown end time if we get cooldown_seconds from server
          if (anurInfo && anurInfo.cooldown_seconds) {
            const endTime = Date.now() + (anurInfo.cooldown_seconds * 1000)
            setAnuCooldownEnd(endTime)
          } else if (anurInfo && anurInfo.status === 'available') {
            setAnuCooldownEnd(null)
          }
          
          setTechniques(data.techniques)
          if (!selectedTechnique) {
            setSelectedTechnique(data.default_technique)
          }
        }
      } catch (error) {
        console.error('Error loading techniques:', error)
      }
    }
    
    loadTechniques()
    
    // Refresh every 15 seconds to sync with backend (less frequent)
    const interval = setInterval(loadTechniques, 15000)
    return () => clearInterval(interval)
  }, [apiUrl])

  // Client-side timer that updates every second for smooth countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Function to get current ANU status with smooth countdown
  const getAnuStatus = () => {
    if (!anurCooldownEnd) {
      return {
        status: 'available',
        warning: 'Ready to use (1 request per minute)',
        cooldownSeconds: null
      }
    }
    
    const remainingMs = anurCooldownEnd - currentTime
    if (remainingMs <= 0) {
      return {
        status: 'available',
        warning: 'Ready to use (1 request per minute)',
        cooldownSeconds: null
      }
    }
    
    const remainingSeconds = Math.ceil(remainingMs / 1000)
    return {
      status: 'cooldown',
      warning: `Rate limited. Available in ${remainingSeconds}s`,
      cooldownSeconds: remainingSeconds
    }
  }

  // Update ANU cooldown when a request is made
  const handleAnuRequest = () => {
    const newCooldownEnd = Date.now() + (70 * 1000) // 70 seconds from now
    setAnuCooldownEnd(newCooldownEnd)
  }

  const generateBoolean = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/generate/boolean`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...booleanRequest, technique: selectedTechnique})
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      
      // If ANU was used successfully, start the cooldown
      if (selectedTechnique === 'anu') {
        handleAnuRequest()
      }
      
      setResponse({ type: 'boolean', data })
    } catch (error) {
      console.error('Boolean generation error:', error)
      setResponse({ type: 'error', error: error.message })
    }
    setLoading(false)
  }

  const generateHash = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/generate/hash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...hashRequest, technique: selectedTechnique})
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      
      // If ANU was used successfully, start the cooldown
      if (selectedTechnique === 'anu') {
        handleAnuRequest()
      }
      
      setResponse({ type: 'hash', data })
    } catch (error) {
      console.error('Hash generation error:', error)
      setResponse({ type: 'error', error: error.message })
    }
    setLoading(false)
  }

  const generateNumber = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/generate/number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...numberRequest, technique: selectedTechnique})
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      
      // If ANU was used successfully, start the cooldown
      if (selectedTechnique === 'anu') {
        handleAnuRequest()
      }
      
      setResponse({ type: 'number', data })
    } catch (error) {
      console.error('Number generation error:', error)
      setResponse({ type: 'error', error: error.message })
    }
    setLoading(false)
  }

  const generateCustom = async () => {
    setLoading(true)
    try {
      const options = customRequest.options.split(',').map(opt => opt.trim()).filter(opt => opt)
      const res = await fetch(`${apiUrl}/generate/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          options,
          count: customRequest.count,
          technique: selectedTechnique
        })
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      
      // If ANU was used successfully, start the cooldown
      if (selectedTechnique === 'anu') {
        handleAnuRequest()
      }
      
      setResponse({ type: 'custom', data })
    } catch (error) {
      console.error('Custom generation error:', error)
      setResponse({ type: 'error', error: error.message })
    }
    setLoading(false)
  }


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const renderResponse = () => {
    if (!response) return null

    if (response.type === 'error') {
      return (
        <div className="response-container error">
          <h3><XCircle size={20} /> Error</h3>
          <p>{response.error}</p>
        </div>
      )
    }

    const { results, metadata } = response.data

    return (
      <div className="response-container success">
        <div className="response-header">
          <h3><CheckCircle size={20} /> Generated Successfully</h3>
          <button 
            className="copy-button"
            onClick={() => copyToClipboard(Array.isArray(results) ? results.map(r => String(r)).join(', ') : String(results))}
            title="Copy to clipboard"
          >
            <Copy size={16} />
          </button>
        </div>
        
        <div className="response-metadata">
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="label">Type:</span>
              <span className="value">{response.type.toUpperCase()}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Count:</span>
              <span className="value">{metadata.count}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Technique:</span>
              <span className="value">{metadata.technique?.toUpperCase() || 'QUANTUM'}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Source:</span>
              <span className="value">{metadata.source || 'QUANTUM'}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Time:</span>
              <span className="value">{metadata.generation_time_ms} ms</span>
            </div>
          </div>
        </div>

        <div className="response-data">
          <div className="results-display">
            {Array.isArray(results) ? (
              <div className="results-list">
                {results.map((result, index) => (
                  <div key={index} className="result-item">
                    <span className="result-index">{index + 1}:</span>
                    <span className="result-value">{String(result)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="single-result">
                {String(results)}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="generator-control">
      <div className="generator-header">
        <h1>Quantum Random Generator</h1>
        <p>Generate truly random values using quantum mechanical processes</p>
      </div>

      {/* Technique Selector */}
      <div className="technique-selector">
        <h3>Random Generation Technique</h3>
        <div className="technique-grid">
          {Object.entries(techniques).map(([key, info]) => {
            // Use client-side calculated status for ANU
            const displayInfo = key === 'anu' ? { ...info, ...getAnuStatus() } : info
            
            return (
              <div 
                key={key}
                className={`technique-option ${selectedTechnique === key ? 'selected' : ''} ${displayInfo.status === 'error' ? 'disabled' : ''} ${displayInfo.status === 'cooldown' ? 'cooldown' : ''} ${displayInfo.status === 'available' && key === 'anu' ? 'anu-available' : ''}`}
                onClick={() => {
                  if (displayInfo.status !== 'error') {
                    setSelectedTechnique(key)
                  }
                }}
              >
                <div className="technique-header">
                  <h4>{displayInfo.name}</h4>
                  <span className={`status-indicator ${displayInfo.status}`}>
                    {displayInfo.status === 'available' ? <CheckCircle size={16} /> : 
                     displayInfo.status === 'operational' ? <CheckCircle size={16} /> :
                     displayInfo.status === 'cooldown' ? <XCircle size={16} /> :
                     displayInfo.status === 'error' ? <XCircle size={16} /> : <AlertTriangle size={16} />}
                  </span>
                </div>
                <p className="technique-description">{displayInfo.description}</p>
                {displayInfo.warning && (
                  <p className={`technique-warning ${displayInfo.status === 'available' && key === 'anu' ? 'warning-success' : ''}`}>
                    {displayInfo.status === 'available' && key === 'anu' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />} {displayInfo.warning}
                  </p>
                )}
                {displayInfo.cooldownSeconds && (
                  <p className="technique-countdown">
                    <Clock size={14} /> Cooldown: {displayInfo.cooldownSeconds}s remaining
                  </p>
                )}
                {displayInfo.response_time_ms && (
                  <p className="technique-timing">Response time: {displayInfo.response_time_ms}ms</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="control-tabs">
        <button 
          className={`tab ${activeTab === 'boolean' ? 'active' : ''}`}
          onClick={() => setActiveTab('boolean')}
        >
          <RotateCcw className="tab-icon" size={16} />
          Boolean
        </button>
        <button 
          className={`tab ${activeTab === 'hash' ? 'active' : ''}`}
          onClick={() => setActiveTab('hash')}
        >
          <Hash className="tab-icon" size={16} />
          Hash
        </button>
        <button 
          className={`tab ${activeTab === 'number' ? 'active' : ''}`}
          onClick={() => setActiveTab('number')}
        >
          <Calculator className="tab-icon" size={16} />
          Number
        </button>
        <button 
          className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          <FileText className="tab-icon" size={16} />
          Custom
        </button>
      </div>

      <div className="control-content">
        {activeTab === 'boolean' && (
          <div className="generator-section">
            <h2>Generate Boolean Values</h2>
            <p>Generate quantum random true/false values</p>
            
            <div className="form-group">
              <label>Number of values:</label>
              <input
                type="number"
                min="1"
                max="100"
                value={booleanRequest.count}
                onChange={(e) => setBooleanRequest({...booleanRequest, count: parseInt(e.target.value)})}
              />
            </div>

            <button 
              className="generate-button"
              onClick={generateBoolean}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Circle className="spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <RotateCcw size={16} />
                  Generate Boolean
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'hash' && (
          <div className="generator-section">
            <h2>Generate Cryptographic Hashes</h2>
            <p>Generate quantum-seeded cryptographic hash values</p>
            
            <div className="form-group">
              <label>Hash Algorithm:</label>
              <select
                value={hashRequest.algorithm}
                onChange={(e) => setHashRequest({...hashRequest, algorithm: e.target.value})}
              >
                <option value="sha256">SHA-256</option>
                <option value="sha512">SHA-512</option>
                <option value="md5">MD5</option>
                <option value="blake2b">BLAKE2b</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of hashes:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={hashRequest.count}
                onChange={(e) => setHashRequest({...hashRequest, count: parseInt(e.target.value)})}
              />
            </div>

            <button 
              className="generate-button"
              onClick={generateHash}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Circle className="spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <Hash size={16} />
                  Generate Hash
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'number' && (
          <div className="generator-section">
            <h2>Generate Random Numbers</h2>
            <p>Generate quantum random numbers within specified ranges</p>
            
            <div className="form-group">
              <label>Number Type:</label>
              <select
                value={numberRequest.type}
                onChange={(e) => setNumberRequest({...numberRequest, type: e.target.value})}
              >
                <option value="integer">Integer</option>
                <option value="float">Float (0-1)</option>
              </select>
            </div>

            {numberRequest.type === 'integer' && (
              <>
                <div className="form-group">
                  <label>Minimum value:</label>
                  <input
                    type="number"
                    value={numberRequest.min}
                    onChange={(e) => setNumberRequest({...numberRequest, min: parseInt(e.target.value)})}
                  />
                </div>

                <div className="form-group">
                  <label>Maximum value:</label>
                  <input
                    type="number"
                    value={numberRequest.max}
                    onChange={(e) => setNumberRequest({...numberRequest, max: parseInt(e.target.value)})}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Number of values:</label>
              <input
                type="number"
                min="1"
                max="100"
                value={numberRequest.count}
                onChange={(e) => setNumberRequest({...numberRequest, count: parseInt(e.target.value)})}
              />
            </div>

            <button 
              className="generate-button"
              onClick={generateNumber}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Circle className="spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <Calculator size={16} />
                  Generate Number
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="generator-section">
            <h2>Generate Custom Categories</h2>
            <p>Define your own options and let quantum mechanics choose randomly</p>
            
            <div className="form-group">
              <label>Options (comma-separated):</label>
              <textarea
                rows="3"
                placeholder="red,blue,green,yellow"
                value={customRequest.options}
                onChange={(e) => setCustomRequest({...customRequest, options: e.target.value})}
              />
              <small>Enter your options separated by commas. Example: apple,banana,cherry,date</small>
            </div>

            <div className="form-group">
              <label>Number of selections:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={customRequest.count}
                onChange={(e) => setCustomRequest({...customRequest, count: parseInt(e.target.value)})}
              />
            </div>

            <div className="custom-preview">
              <h4>Your Options:</h4>
              <div className="options-list">
                {customRequest.options.split(',').map((opt, index) => (
                  opt.trim() && (
                    <span key={index} className="option-tag">
                      {opt.trim()}
                    </span>
                  )
                ))}
              </div>
            </div>

            <button 
              className="generate-button"
              onClick={generateCustom}
              disabled={loading || !customRequest.options.trim()}
            >
              {loading ? (
                <>
                  <Circle className="spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Generate Custom
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {renderResponse()}
    </div>
  )
}

export default GeneratorControl