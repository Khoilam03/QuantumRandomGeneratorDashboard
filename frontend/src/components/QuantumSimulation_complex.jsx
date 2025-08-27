import { useState, useEffect, useRef } from 'react'

const QuantumSimulation = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [isRunning, setIsRunning] = useState(true)
  const [particles, setParticles] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [measurementMode, setMeasurementMode] = useState(false)
  const [selectedParticle, setSelectedParticle] = useState(null)
  const [lastMeasurement, setLastMeasurement] = useState(null)
  const [simulationMode, setSimulationMode] = useState('beamsplitter') // 'beamsplitter' or 'particles'
  const [photons, setPhotons] = useState([])
  const [detectorHits, setDetectorHits] = useState({ top: 0, bottom: 0 })
  const [probability, setProbability] = useState(0.5) // 0.5 = 50/50, 0.6 = 60/40, etc.

  useEffect(() => {
    if (simulationMode === 'particles') {
      initializeParticles()
    }
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    // Always start animation when component mounts or mode changes
    if (isRunning) {
      startAnimation()
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, simulationMode])

  // Make sure animation continues when photons are added
  useEffect(() => {
    if (isRunning && photons.length > 0 && !animationRef.current) {
      console.log('Restarting animation for photons')
      startAnimation()
    }
  }, [photons.length, isRunning])

  // Separate effect for photons initialization
  useEffect(() => {
    if (simulationMode === 'beamsplitter') {
      setPhotons([])
      setDetectorHits({ top: 0, bottom: 0 })
      
      // Auto-create a test photon after 2 seconds for debugging
      setTimeout(() => {
        console.log('Auto-creating test photon')
        createPhoton()
      }, 2000)
    }
  }, [simulationMode])

  const initializeParticles = () => {
    const newParticles = []
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 600,
        y: Math.random() * 300,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        phase: Math.random() * Math.PI * 2,
        amplitude: Math.random() * 20 + 10,
        frequency: Math.random() * 0.05 + 0.02,
        color: `hsl(${120 + Math.random() * 60}, 70%, 60%)`, // Green to cyan range
        size: Math.random() * 4 + 2,
        spin: 0,
        spinSpeed: (Math.random() - 0.5) * 0.2
      })
    }
    setParticles(newParticles)
  }

  const createPhoton = () => {
    console.log('Creating photon with probability:', probability)
    const newPhoton = {
      id: Date.now() + Math.random(),
      x: 80,
      y: 150,
      vx: 3,
      vy: 0,
      inSuperposition: true,
      superpositionY: 150,
      topAmplitude: Math.sqrt(probability), // Probability amplitude for top path
      bottomAmplitude: Math.sqrt(1 - probability), // Probability amplitude for bottom path
      phase: 0,
      measured: false,
      finalPath: null,
      trailX: [80], // Start trail with initial position
      trailY: [150]
    }
    setPhotons(prev => {
      console.log('Adding photon, total photons will be:', prev.length + 1)
      return [...prev, newPhoton]
    })
  }

  const drawBeamSplitterSetup = (ctx, canvas) => {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw beam splitter (diagonal line in center)
    ctx.strokeStyle = '#00ff88'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(250, 100)
    ctx.lineTo(350, 200)
    ctx.stroke()

    // Label beam splitter
    ctx.fillStyle = '#00ff88'
    ctx.font = '14px Arial'
    ctx.fillText('Beam Splitter', 260, 90)
    const topPercent = Math.round(probability * 100)
    const bottomPercent = 100 - topPercent
    ctx.fillText(`(${topPercent}/${bottomPercent})`, 280, 220)

    // Draw photon source
    ctx.fillStyle = '#ffaa00'
    ctx.beginPath()
    ctx.arc(50, 150, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillText('Photon', 15, 140)
    ctx.fillText('Source', 20, 155)

    // Draw top detector
    ctx.fillStyle = '#ff4444'
    ctx.fillRect(520, 80, 30, 20)
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px Arial'
    ctx.fillText('Detector A', 480, 75)
    ctx.fillText(`Hits: ${detectorHits.top}`, 480, 125)

    // Draw bottom detector
    ctx.fillStyle = '#4444ff'
    ctx.fillRect(520, 200, 30, 20)
    ctx.fillStyle = '#ffffff'
    ctx.fillText('Detector B', 480, 195)
    ctx.fillText(`Hits: ${detectorHits.bottom}`, 480, 245)

    // Draw paths
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    
    // Top path
    ctx.beginPath()
    ctx.moveTo(80, 150)
    ctx.lineTo(300, 150)
    ctx.lineTo(535, 90)
    ctx.stroke()

    // Bottom path  
    ctx.beginPath()
    ctx.moveTo(80, 150)
    ctx.lineTo(300, 150)
    ctx.lineTo(535, 210)
    ctx.stroke()

    ctx.setLineDash([])
  }

  const startAnimation = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const animate = () => {
      if (simulationMode === 'beamsplitter') {
        // Always draw beam splitter setup first
        drawBeamSplitterSetup(ctx, canvas)
        
        if (photons.length > 0) {
          console.log('Animation running with', photons.length, 'photons')
        }

        // Update and draw photons
        setPhotons(prevPhotons => {
          const updatedPhotons = prevPhotons.map(photon => {
            // Add to trail for visualization
            photon.trailX.push(photon.x)
            photon.trailY.push(photon.y)
            if (photon.trailX.length > 10) {
              photon.trailX.shift()
              photon.trailY.shift()
            }

            if (photon.x < 300 && !photon.measured) {
              // Photon approaching beam splitter - in superposition
              return {
                ...photon,
                x: photon.x + photon.vx,
                phase: photon.phase + 0.15
              }
            } else if (photon.x >= 300 && !photon.measured) {
              // Photon hits beam splitter - quantum measurement happens!
              const measurementResult = Math.random() < probability ? 'top' : 'bottom'
              
              return {
                ...photon,
                measured: true,
                finalPath: measurementResult,
                y: measurementResult === 'top' ? 90 : 210,
                vx: 3,
                vy: 0,
                inSuperposition: false
              }
            } else if (photon.measured && photon.x < 520) {
              // Photon traveling to detector
              return {
                ...photon,
                x: photon.x + photon.vx
              }
            } else if (photon.measured && photon.x >= 520) {
              // Photon hits detector - record hit and remove
              setDetectorHits(prev => ({
                ...prev,
                [photon.finalPath]: prev[photon.finalPath] + 1
              }))
              
              // Add to measurement history
              const measurement = {
                id: Date.now() + Math.random(),
                particleId: photon.id,
                value: photon.finalPath === 'top' ? 1 : 0,
                timestamp: new Date().toLocaleTimeString()
              }
              setMeasurements(prev => [measurement, ...prev.slice(0, 9)])
              setLastMeasurement(measurement)
              
              return null // Remove photon
            }
            return photon
          }).filter(Boolean) // Remove null photons

          return updatedPhotons
        })

        // Draw existing photons with enhanced visibility
        photons.forEach(photon => {
          ctx.save()
          
          // Draw trail
          if (photon.trailX.length > 1) {
            ctx.strokeStyle = photon.measured 
              ? (photon.finalPath === 'top' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(68, 68, 255, 0.3)')
              : 'rgba(255, 255, 0, 0.3)'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.moveTo(photon.trailX[0], photon.trailY[0])
            for (let i = 1; i < photon.trailX.length; i++) {
              ctx.lineTo(photon.trailX[i], photon.trailY[i])
            }
            ctx.stroke()
          }
          
          if (!photon.measured && photon.x < 300) {
            // Show superposition - photon exists in both paths simultaneously
            
            // Draw probability clouds on both paths with different intensities
            const topIntensity = photon.topAmplitude * photon.topAmplitude // |ψ|²
            const bottomIntensity = photon.bottomAmplitude * photon.bottomAmplitude
            
            const superposY1 = 90 + Math.sin(photon.phase) * 8
            const superposY2 = 210 + Math.sin(photon.phase + Math.PI) * 8
            
            // Top path probability cloud
            ctx.globalAlpha = 0.4 + topIntensity * 0.4
            ctx.fillStyle = '#ff6666'
            ctx.beginPath()
            ctx.arc(photon.x, superposY1, 12, 0, Math.PI * 2)
            ctx.fill()
            
            // Bottom path probability cloud
            ctx.globalAlpha = 0.4 + bottomIntensity * 0.4
            ctx.fillStyle = '#6666ff'
            ctx.beginPath()
            ctx.arc(photon.x, superposY2, 12, 0, Math.PI * 2)
            ctx.fill()
            
            // Main photon - bright and large
            ctx.globalAlpha = 1
            ctx.fillStyle = '#ffff00'
            ctx.beginPath()
            ctx.arc(photon.x, photon.y, 10, 0, Math.PI * 2)
            ctx.fill()
            
            // Pulsing glow effect
            ctx.globalAlpha = 0.5 + Math.sin(photon.phase * 2) * 0.3
            ctx.strokeStyle = '#ffff00'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(photon.x, photon.y, 15 + Math.sin(photon.phase) * 3, 0, Math.PI * 2)
            ctx.stroke()
            
          } else if (photon.measured) {
            // Collapsed state - definite path with bright colors
            ctx.globalAlpha = 1
            ctx.fillStyle = photon.finalPath === 'top' ? '#ff2222' : '#2222ff'
            ctx.beginPath()
            ctx.arc(photon.x, photon.y, 12, 0, Math.PI * 2)
            ctx.fill()
            
            // Bright glow around measured photon
            ctx.globalAlpha = 0.6
            ctx.strokeStyle = photon.finalPath === 'top' ? '#ff4444' : '#4444ff'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.arc(photon.x, photon.y, 18, 0, Math.PI * 2)
            ctx.stroke()
            
            // Inner bright core
            ctx.globalAlpha = 1
            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.arc(photon.x, photon.y, 4, 0, Math.PI * 2)
            ctx.fill()
          }
          
          ctx.restore()
        })

        // Add instructional text
        ctx.fillStyle = '#ffffff'
        ctx.font = '16px Arial'
        ctx.fillText('🎯 Click "Send Photon" to see quantum randomness in action!', 50, 30)
        
        // Always show a test dot to prove canvas is working
        ctx.fillStyle = '#ff0000'
        ctx.beginPath()
        ctx.arc(100, 50, 5, 0, Math.PI * 2)
        ctx.fill()
        
      } else {
        // Original particle animation mode
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      setParticles(prevParticles => {
        const updatedParticles = prevParticles.map(particle => {
          // Quantum wave behavior
          const waveX = Math.sin(particle.phase) * particle.amplitude
          const waveY = Math.cos(particle.phase * 1.3) * particle.amplitude

          // Update position with quantum uncertainty
          let newX = particle.x + particle.vx + waveX * 0.1
          let newY = particle.y + particle.vy + waveY * 0.1

          // Boundary conditions with quantum tunneling effect
          if (newX < 0 || newX > canvas.width) {
            if (Math.random() < 0.1) {
              // Quantum tunneling - particle appears on other side
              newX = newX < 0 ? canvas.width : 0
            } else {
              particle.vx *= -0.8
              newX = Math.max(0, Math.min(canvas.width, newX))
            }
          }

          if (newY < 0 || newY > canvas.height) {
            if (Math.random() < 0.1) {
              newY = newY < 0 ? canvas.height : 0
            } else {
              particle.vy *= -0.8
              newY = Math.max(0, Math.min(canvas.height, newY))
            }
          }

          // Draw particle with quantum superposition effect
          const drawX = newX + waveX
          const drawY = newY + waveY

          // Create quantum interference pattern
          ctx.save()
          
          // Highlight selected particle
          const isSelected = selectedParticle === particle.id
          if (isSelected) {
            ctx.globalAlpha = 1
            ctx.strokeStyle = '#ff4444'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(drawX, drawY, particle.size + 10, 0, Math.PI * 2)
            ctx.stroke()
            
            // Measurement collapse effect
            ctx.globalAlpha = 0.3
            ctx.fillStyle = '#ff4444'
            ctx.beginPath()
            ctx.arc(drawX, drawY, particle.size + 15, 0, Math.PI * 2)
            ctx.fill()
          }
          
          ctx.globalAlpha = isSelected ? 1 : (0.6 + Math.sin(particle.phase) * 0.3)
          
          // Draw particle
          ctx.beginPath()
          ctx.arc(drawX, drawY, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = isSelected ? '#ffffff' : particle.color
          ctx.fill()
          
          // Draw quantum spin visualization
          ctx.save()
          ctx.translate(drawX, drawY)
          ctx.rotate(particle.spin)
          ctx.strokeStyle = particle.color
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(-particle.size, 0)
          ctx.lineTo(particle.size, 0)
          ctx.stroke()
          ctx.restore()

          // Draw wave function
          ctx.globalAlpha = 0.3
          ctx.strokeStyle = particle.color
          ctx.lineWidth = 2
          ctx.beginPath()
          for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
            const radius = particle.size + Math.sin(particle.phase + angle * 3) * 5
            const x = drawX + Math.cos(angle) * radius
            const y = drawY + Math.sin(angle) * radius
            if (angle === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.closePath()
          ctx.stroke()
          
          ctx.restore()

          return {
            ...particle,
            x: newX,
            y: newY,
            phase: particle.phase + particle.frequency,
            spin: particle.spin + particle.spinSpeed,
            // Add quantum randomness to velocity
            vx: particle.vx + (Math.random() - 0.5) * 0.1,
            vy: particle.vy + (Math.random() - 0.5) * 0.1
          }
        })

        return updatedParticles
      })

      // Draw quantum field visualization
      ctx.save()
      ctx.globalAlpha = 0.1
      ctx.strokeStyle = '#00ff88'
      ctx.lineWidth = 1
      
      // Draw field lines
      for (let x = 0; x < canvas.width; x += 50) {
        for (let y = 0; y < canvas.height; y += 50) {
          const fieldX = Math.sin(Date.now() * 0.001 + x * 0.01) * 20
          const fieldY = Math.cos(Date.now() * 0.001 + y * 0.01) * 20
          
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + fieldX, y + fieldY)
          ctx.stroke()
        }
      }
      ctx.restore()
      } // Close the else block for particle mode
      
      if (isRunning) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()
  }

  const toggleAnimation = () => {
    setIsRunning(!isRunning)
  }

  const resetSimulation = () => {
    initializeParticles()
    setMeasurements([])
    setSelectedParticle(null)
    setLastMeasurement(null)
    setPhotons([])
    setDetectorHits({ top: 0, bottom: 0 })
  }

  const switchSimulationMode = () => {
    const newMode = simulationMode === 'beamsplitter' ? 'particles' : 'beamsplitter'
    setSimulationMode(newMode)
    resetSimulation()
  }

  const performMeasurement = () => {
    if (particles.length === 0) return
    
    const randomParticle = particles[Math.floor(Math.random() * particles.length)]
    setSelectedParticle(randomParticle.id)
    
    // Simulate quantum measurement collapse
    const measurementValue = Math.random() < 0.5 ? 0 : 1
    const measurement = {
      id: Date.now(),
      particleId: randomParticle.id,
      value: measurementValue,
      timestamp: new Date().toLocaleTimeString()
    }
    
    setMeasurements(prev => [measurement, ...prev.slice(0, 9)]) // Keep last 10
    setLastMeasurement(measurement)
    
    // Particle collapses after measurement
    setTimeout(() => {
      setSelectedParticle(null)
    }, 2000)
  }

  const handleCanvasClick = (event) => {
    if (!measurementMode || simulationMode !== 'particles') return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Find closest particle
    let closestParticle = null
    let minDistance = Infinity
    
    particles.forEach(particle => {
      const distance = Math.sqrt((particle.x - x) ** 2 + (particle.y - y) ** 2)
      if (distance < minDistance && distance < 30) {
        minDistance = distance
        closestParticle = particle
      }
    })
    
    if (closestParticle) {
      setSelectedParticle(closestParticle.id)
      
      const measurementValue = Math.random() < 0.5 ? 0 : 1
      const measurement = {
        id: Date.now(),
        particleId: closestParticle.id,
        value: measurementValue,
        timestamp: new Date().toLocaleTimeString(),
        manual: true
      }
      
      setMeasurements(prev => [measurement, ...prev.slice(0, 9)])
      setLastMeasurement(measurement)
      
      setTimeout(() => {
        setSelectedParticle(null)
      }, 2000)
    }
  }

  return (
    <div className="quantum-simulation">
      <div className="simulation-container">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="simulation-canvas"
          onClick={handleCanvasClick}
          style={{ cursor: (measurementMode && simulationMode === 'particles') ? 'crosshair' : 'default' }}
        />
        
        <div className="simulation-controls">
          <button 
            onClick={switchSimulationMode} 
            className="control-button mode-switch"
          >
            🔄 {simulationMode === 'beamsplitter' ? 'Switch to Particle View' : 'Switch to Beam Splitter'}
          </button>
          
          {simulationMode === 'beamsplitter' ? (
            <>
              <button 
                onClick={createPhoton} 
                className="control-button photon-button"
                disabled={!isRunning}
              >
                💡 Send Photon
              </button>
              <button onClick={resetSimulation} className="control-button">
                🔄 Reset Detectors
              </button>
              
              <div className="probability-controls">
                <label>Probability Bias:</label>
                <select 
                  value={probability} 
                  onChange={(e) => setProbability(parseFloat(e.target.value))}
                  className="probability-select"
                >
                  <option value={0.5}>50/50 (Fair)</option>
                  <option value={0.6}>60/40 (Top Bias)</option>
                  <option value={0.7}>70/30 (Strong Top)</option>
                  <option value={0.8}>80/20 (Very Strong Top)</option>
                  <option value={0.4}>40/60 (Bottom Bias)</option>
                  <option value={0.3}>30/70 (Strong Bottom)</option>
                  <option value={0.2}>20/80 (Very Strong Bottom)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <button onClick={toggleAnimation} className="control-button">
                {isRunning ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <button onClick={resetSimulation} className="control-button">
                🔄 Reset
              </button>
              <button 
                onClick={performMeasurement} 
                className="control-button measurement"
                disabled={!isRunning}
              >
                📏 Measure Random Particle
              </button>
              <button 
                onClick={() => setMeasurementMode(!measurementMode)} 
                className={`control-button ${measurementMode ? 'active' : ''}`}
              >
                🎯 {measurementMode ? 'Exit Selection' : 'Select Particle'}
              </button>
            </>
          )}
        </div>
        
        {simulationMode === 'beamsplitter' && (detectorHits.top > 0 || detectorHits.bottom > 0) && (
          <div className="detector-stats">
            <div className="detector-stat top">
              <div className="count">{detectorHits.top}</div>
              <div className="label">Detector A (1)</div>
              <div className="percentage">
                {detectorHits.top + detectorHits.bottom > 0 ? 
                  ((detectorHits.top / (detectorHits.top + detectorHits.bottom)) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="detector-stat bottom">
              <div className="count">{detectorHits.bottom}</div>
              <div className="label">Detector B (0)</div>
              <div className="percentage">
                {detectorHits.top + detectorHits.bottom > 0 ? 
                  ((detectorHits.bottom / (detectorHits.top + detectorHits.bottom)) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        )}

        {lastMeasurement && simulationMode === 'particles' && (
          <div className="last-measurement">
            <h4>Latest Measurement:</h4>
            <div className="measurement-result">
              <span className="measurement-value">
                Bit Value: <strong>{lastMeasurement.value}</strong>
              </span>
              <span className="measurement-time">
                at {lastMeasurement.timestamp}
              </span>
              {lastMeasurement.manual && (
                <span className="measurement-type">(Manual Selection)</span>
              )}
            </div>
          </div>
        )}

        {lastMeasurement && simulationMode === 'beamsplitter' && (
          <div className="last-measurement beam-measurement">
            <h4>Latest Photon Detection:</h4>
            <div className="measurement-result">
              <span className="measurement-value">
                Detector: <strong>{lastMeasurement.value === 1 ? 'A (Red)' : 'B (Blue)'}</strong>
              </span>
              <span className="measurement-value">
                Bit: <strong>{lastMeasurement.value}</strong>
              </span>
              <span className="measurement-time">
                at {lastMeasurement.timestamp}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="measurement-history">
        <h4>Measurement History (Random Bits):</h4>
        <div className="bit-sequence">
          {measurements.map((measurement, index) => (
            <span 
              key={measurement.id} 
              className={`bit ${measurement.value === 1 ? 'one' : 'zero'}`}
              title={`Measured at ${measurement.timestamp}${measurement.manual ? ' (manual)' : ''}`}
            >
              {measurement.value}
            </span>
          ))}
          {measurements.length === 0 && (
            <span className="no-measurements">No measurements yet - click "Measure" to generate random bits!</span>
          )}
        </div>
        {measurements.length > 0 && (
          <div className="bit-stats">
            <span>Total bits: {measurements.length}</span>
            <span>Ones: {measurements.filter(m => m.value === 1).length}</span>
            <span>Zeros: {measurements.filter(m => m.value === 0).length}</span>
            <span>
              Ratio: {measurements.length > 0 ? 
                (measurements.filter(m => m.value === 1).length / measurements.length * 100).toFixed(1) : 0}% ones
            </span>
          </div>
        )}
      </div>

      <div className="simulation-explanation">
        {simulationMode === 'beamsplitter' ? (
          <>
            <h4>🔬 Beam Splitter: How Quantum Randomness Really Works</h4>
            <div className="explanation-items">
              <div className="explanation-point">
                <span className="point-icon">💡</span>
                <span className="point-text">
                  <strong>Single Photon:</strong> Each yellow dot is ONE photon (light particle) that starts at the source
                </span>
              </div>
              <div className="explanation-point">
                <span className="point-icon">🌈</span>
                <span className="point-text">
                  <strong>Superposition:</strong> Before hitting the beam splitter, the photon exists in BOTH paths simultaneously (pink and blue clouds)
                </span>
              </div>
              <div className="explanation-point">
                <span className="point-icon">⚛️</span>
                <span className="point-text">
                  <strong>Quantum Measurement:</strong> When the photon hits the beam splitter, it must "choose" - top or bottom path
                </span>
              </div>
              <div className="explanation-point">
                <span className="point-icon">🎲</span>
                <span className="point-text">
                  <strong>Tunable Randomness:</strong> Adjust the probability bias to see how quantum systems can be tuned while maintaining true randomness!
                </span>
              </div>
              <div className="explanation-point">
                <span className="point-icon">🔴</span>
                <span className="point-text">
                  <strong>Detection:</strong> Red detector = "1" bit, Blue detector = "0" bit. This creates your random number sequence!
                </span>
              </div>
              <div className="explanation-point">
                <span className="point-icon">📊</span>
                <span className="point-text">
                  <strong>Fair Distribution:</strong> Over many photons, you get ~50% red hits and ~50% blue hits - perfectly random!
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <h4>🌀 Particle View: Quantum Behavior Visualization</h4>
            <div className="explanation-items">
              <div className="explanation-point">
                <span className="point-icon">⚛️</span>
                <span className="point-text">
                  <strong>Quantum Particles:</strong> Each glowing dot represents a quantum particle in superposition - existing in multiple states simultaneously
                </span>
              </div>
              <div className="explanation-point">
                <span className="point-icon">🌊</span>
                <span className="point-text">
                  <strong>Wave Functions:</strong> The oscillating halos show probability waves. Particles don't have definite positions until measured
                </span>
              </div>
              <div className="explanation-point">
                <span className="point-icon">📏</span>
                <span className="point-text">
                  <strong>Quantum Measurement:</strong> Click "Measure" to collapse a particle's wave function into a definite state (0 or 1 bit)
                </span>
              </div>
              <div className="explanation-point">
                <span className="point-icon">🎯</span>
                <span className="point-text">
                  <strong>Manual Selection:</strong> Use "Select Particle" mode to click on specific particles and see their measurement collapse
                </span>
              </div>
              <div className="explanation-point">
                <span className="point-icon">🎲</span>
                <span className="point-text">
                  <strong>True Randomness:</strong> Each measurement is genuinely unpredictable - no algorithm can predict the outcome
                </span>
              </div>
              <div className="explanation-point">
                <span className="point-icon">📊</span>
                <span className="point-text">
                  <strong>Statistical Distribution:</strong> Over many measurements, you get roughly 50% ones and 50% zeros, proving quantum fairness
                </span>
              </div>
            </div>
          </>
        )}

        <div className="process-explanation">
          <h4>How Random Generation Works:</h4>
          <div className="process-steps">
            <div className="process-step">
              <span className="step-number">1</span>
              <span className="step-text">Particles exist in quantum superposition (multiple states)</span>
            </div>
            <div className="process-step">
              <span className="step-number">2</span>
              <span className="step-text">Measurement device "observes" a particle</span>
            </div>
            <div className="process-step">
              <span className="step-number">3</span>
              <span className="step-text">Wave function instantly collapses to 0 or 1 (50% probability each)</span>
            </div>
            <div className="process-step">
              <span className="step-number">4</span>
              <span className="step-text">The collapsed value becomes a random bit in your sequence</span>
            </div>
            <div className="process-step">
              <span className="step-number">5</span>
              <span className="step-text">Repeat millions of times per second for continuous random data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuantumSimulation