import { useState, useEffect, useRef } from 'react'

const HybridSimulation = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [isRunning, setIsRunning] = useState(false)
  const [validationStep, setValidationStep] = useState('generating')
  const [stats, setStats] = useState({
    generated: 0,
    validated: 0,
    validationScore: 0,
    speedMbps: 0
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
    let dataBlocks = []
    let validationPackets = []
    
    const animate = () => {
      frameCount++
      
      // Clear canvas
      ctx.fillStyle = '#0f0f1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw FPGA Generator
      ctx.strokeStyle = '#9333ea'
      ctx.fillStyle = 'rgba(0, 255, 136, 0.1)'
      ctx.lineWidth = 2
      ctx.fillRect(20, 40, 120, 80)
      ctx.strokeRect(20, 40, 120, 80)
      
      ctx.fillStyle = '#9333ea'
      ctx.font = '12px Arial'
      ctx.fillText('FPGA Generator', 30, 60)
      ctx.font = '10px Arial'
      ctx.fillText('High Speed', 30, 75)
      ctx.fillText('50+ Mbps', 30, 90)

      // Draw ANU Validator
      ctx.strokeStyle = '#4a9eff'
      ctx.fillStyle = 'rgba(74, 158, 255, 0.1)'
      ctx.fillRect(350, 40, 120, 80)
      ctx.strokeRect(350, 40, 120, 80)
      
      ctx.fillStyle = '#4a9eff'
      ctx.font = '12px Arial'
      ctx.fillText('ANU Validator', 360, 60)
      ctx.font = '10px Arial'
      ctx.fillText('Quantum Reference', 360, 75)
      ctx.fillText('Gold Standard', 360, 90)

      // Generate data blocks
      if (frameCount % 30 === 0) {
        dataBlocks.push({
          x: 140,
          y: 70,
          targetX: 200,
          speed: 2,
          validated: false,
          id: Date.now()
        })
        setStats(prev => ({ ...prev, generated: prev.generated + 1 }))
      }

      // Draw data flow
      dataBlocks = dataBlocks.filter(block => {
        block.x += block.speed
        
        // Draw data block
        const color = block.validated ? '#9333ea' : '#ffaa00'
        ctx.fillStyle = color
        ctx.fillRect(block.x, block.y, 12, 12)
        
        ctx.fillStyle = '#000'
        ctx.font = '8px Arial'
        ctx.fillText('D', block.x + 3, block.y + 8)
        
        // When reaching validation point
        if (block.x >= 200 && !block.validated) {
          // Send validation packet to ANU
          validationPackets.push({
            x: 200,
            y: block.y,
            targetX: 350,
            speed: 1,
            blockId: block.id
          })
          block.validated = true
          setValidationStep('validating')
        }
        
        return block.x < 500
      })

      // Draw validation packets
      validationPackets = validationPackets.filter(packet => {
        packet.x += packet.speed
        
        // Draw validation packet
        ctx.fillStyle = '#4a9eff'
        ctx.fillRect(packet.x, packet.y, 8, 8)
        ctx.fillStyle = '#fff'
        ctx.font = '6px Arial'
        ctx.fillText('V', packet.x + 2, packet.y + 6)
        
        // When reaching ANU
        if (packet.x >= 350) {
          setStats(prev => ({ 
            ...prev, 
            validated: prev.validated + 1,
            validationScore: 0.85 + Math.random() * 0.1
          }))
          setValidationStep('validated')
        }
        
        return packet.x < 350
      })

      // Draw process flow arrows
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      // FPGA to buffer
      ctx.beginPath()
      ctx.moveTo(140, 80)
      ctx.lineTo(180, 80)
      ctx.stroke()
      
      // Buffer to validation
      ctx.beginPath()
      ctx.moveTo(220, 80)
      ctx.lineTo(350, 80)
      ctx.stroke()
      
      ctx.setLineDash([])

      // Draw validation buffer
      ctx.strokeStyle = '#ff9500'
      ctx.fillStyle = 'rgba(255, 149, 0, 0.1)'
      ctx.fillRect(200, 40, 80, 80)
      ctx.strokeRect(200, 40, 80, 80)
      
      ctx.fillStyle = '#ff9500'
      ctx.font = '12px Arial'
      ctx.fillText('Hybrid', 215, 60)
      ctx.fillText('Buffer', 215, 75)
      ctx.font = '10px Arial'
      ctx.fillText('Validation', 215, 90)

      // Draw process indicators
      const stepY = 140
      const steps = [
        { x: 80, label: 'Generate', color: '#9333ea' },
        { x: 200, label: 'Buffer', color: '#ff9500' },
        { x: 350, label: 'Validate', color: '#4a9eff' },
        { x: 450, label: 'Output', color: '#ff6b6b' }
      ]

      steps.forEach((step, index) => {
        const isActive = index <= Math.floor(frameCount / 60) % 4
        ctx.fillStyle = isActive ? step.color : '#333'
        ctx.beginPath()
        ctx.arc(step.x, stepY, 8, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#fff'
        ctx.font = '10px Arial'
        ctx.fillText(step.label, step.x - 15, stepY + 20)
      })

      // Connect step indicators
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      for (let i = 0; i < steps.length - 1; i++) {
        ctx.beginPath()
        ctx.moveTo(steps[i].x + 8, stepY)
        ctx.lineTo(steps[i + 1].x - 8, stepY)
        ctx.stroke()
      }

      // Status indicators
      ctx.fillStyle = '#fff'
      ctx.font = '10px Arial'
      ctx.fillText(`Step: ${validationStep}`, 20, 20)
      
      // Update speed calculation
      if (frameCount % 60 === 0) {
        setStats(prev => ({
          ...prev,
          speedMbps: 45 + Math.random() * 10
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
        <h3>🔀 Hybrid Generation + Validation</h3>
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
        height={180}
        className="simulation-canvas"
        style={{ border: '2px solid #c084fc', borderRadius: '4px' }}
      />
      
      <div className="simulation-info">
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Generated:</span>
            <span className="value">{stats.generated} blocks</span>
          </div>
          <div className="info-item">
            <span className="label">Validated:</span>
            <span className="value">{stats.validated} blocks</span>
          </div>
          <div className="info-item">
            <span className="label">Validation Score:</span>
            <span className="value">{(stats.validationScore * 100).toFixed(1)}%</span>
          </div>
          <div className="info-item">
            <span className="label">Speed:</span>
            <span className="value">{stats.speedMbps.toFixed(1)} Mbps</span>
          </div>
        </div>
        
        <div className="technique-explanation">
          <h4>How Hybrid Mode Works:</h4>
          <ul>
            <li><strong>Primary Generation:</strong> FPGA creates random data at high speed</li>
            <li><strong>Statistical Sampling:</strong> Small samples sent to ANU for validation</li>
            <li><strong>Quality Comparison:</strong> Local vs. quantum reference statistical analysis</li>
            <li><strong>Best of Both:</strong> Speed of FPGA + quantum validation confidence</li>
            <li><strong>Continuous Monitoring:</strong> Real-time quality assurance</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HybridSimulation