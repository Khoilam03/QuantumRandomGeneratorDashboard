import { useState, useEffect, useRef } from 'react'

const FPGASimulation = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState({
    thermal_noise: 0.1,
    shot_noise: 0.05,
    interference: 0.02,
    throughput: 0
  })

  useEffect(() => {
    if (isRunning) {
      startSimulation()
    } else {
      stopSimulation()
    }
    return () => stopSimulation()
  }, [isRunning])

  const startSimulation = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let frameCount = 0
    let noiseData = new Array(200).fill(0).map(() => Math.random())
    
    const animate = () => {
      frameCount++
      
      // Clear canvas
      ctx.fillStyle = '#0f0f1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw FPGA chip
      ctx.strokeStyle = '#9333ea'
      ctx.fillStyle = 'rgba(147, 51, 234, 0.1)'
      ctx.lineWidth = 2
      ctx.fillRect(50, 50, 150, 100)
      ctx.strokeRect(50, 50, 150, 100)
      
      // FPGA label
      ctx.fillStyle = '#9333ea'
      ctx.font = '14px Arial'
      ctx.fillText('FPGA Chip', 60, 70)
      ctx.font = '10px Arial'
      ctx.fillText('Quantum Noise', 60, 85)
      ctx.fillText('Simulator', 60, 95)

      // Draw noise sources
      const time = frameCount * 0.1
      
      // Thermal noise visualization
      for (let i = 0; i < 50; i++) {
        const x = 250 + i * 4
        const thermal = Math.sin(time + i * 0.3) * stats.thermal_noise * 30
        const y = 80 + thermal
        
        ctx.fillStyle = `rgba(255, 100, 100, ${0.3 + Math.abs(thermal) / 30})`
        ctx.fillRect(x, y, 2, 2)
      }
      
      // Shot noise visualization
      for (let i = 0; i < 50; i++) {
        if (Math.random() < stats.shot_noise) {
          const x = 250 + Math.random() * 200
          const y = 120 + Math.random() * 40
          
          ctx.fillStyle = 'rgba(255, 255, 100, 0.8)'
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      
      // Interference pattern
      for (let i = 0; i < 200; i++) {
        const x = 250 + i * 2
        const interference = Math.sin(time * 2 + i * 0.1) * stats.interference * 50
        const y = 200 + interference
        
        ctx.fillStyle = `rgba(100, 100, 255, 0.4)`
        ctx.fillRect(x, y, 1, 1)
      }

      // Draw data flow
      const flowY = 250
      for (let i = 0; i < 10; i++) {
        const x = 50 + ((frameCount * 3 + i * 30) % 400)
        const bit = Math.random() > 0.5 ? 1 : 0
        
        ctx.fillStyle = bit ? '#9333ea' : '#ff6b6b'
        ctx.fillRect(x, flowY, 8, 8)
        
        ctx.fillStyle = '#fff'
        ctx.font = '8px Arial'
        ctx.fillText(bit.toString(), x + 2, flowY + 6)
      }

      // Labels
      ctx.fillStyle = '#fff'
      ctx.font = '12px Arial'
      ctx.fillText('Thermal Noise', 250, 70)
      ctx.fillText('Shot Noise', 250, 115)
      ctx.fillText('Interference', 250, 190)
      ctx.fillText('Random Bit Stream', 50, 240)

      // Update throughput
      if (frameCount % 30 === 0) {
        setStats(prev => ({
          ...prev,
          throughput: 45 + Math.random() * 10 // 45-55 Mbps
        }))
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
  }

  const stopSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  return (
    <div className="technique-simulation">
      <div className="simulation-header">
        <h3>🔧 FPGA Quantum Noise Simulation</h3>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className={`control-button ${isRunning ? 'stop' : 'start'}`}
        >
          {isRunning ? '⏹️ Stop' : '▶️ Start'} Simulation
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="simulation-canvas"
        style={{ border: '2px solid #9333ea', borderRadius: '4px' }}
      />
      
      <div className="simulation-info">
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Thermal Noise:</span>
            <span className="value">{stats.thermal_noise}</span>
          </div>
          <div className="info-item">
            <span className="label">Shot Noise:</span>
            <span className="value">{stats.shot_noise}</span>
          </div>
          <div className="info-item">
            <span className="label">Interference:</span>
            <span className="value">{stats.interference}</span>
          </div>
          <div className="info-item">
            <span className="label">Throughput:</span>
            <span className="value">{stats.throughput.toFixed(1)} Mbps</span>
          </div>
        </div>
        
        <div className="technique-explanation">
          <h4>How FPGA Simulation Works:</h4>
          <ul>
            <li><strong>Thermal Noise:</strong> Random fluctuations from heat (red waves)</li>
            <li><strong>Shot Noise:</strong> Discrete photon detection events (yellow dots)</li>
            <li><strong>Interference:</strong> Quantum wave interference patterns (blue waves)</li>
            <li><strong>Processing:</strong> FPGA combines all noise sources into random bits</li>
            <li><strong>von Neumann Debiasing:</strong> Removes statistical bias for uniform output</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FPGASimulation