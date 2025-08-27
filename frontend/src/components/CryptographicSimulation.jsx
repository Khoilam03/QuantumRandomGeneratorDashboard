import { useState, useEffect, useRef } from 'react'

const CryptographicSimulation = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentSource, setCurrentSource] = useState('keyboard')
  const [stats, setStats] = useState({
    entropyPool: 256,
    entropy: 0,
    mixing: 0,
    output: 0
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
    let entropyBits = []
    let mixingData = []
    
    const entropySources = [
      { name: 'keyboard', color: '#ff6b6b', y: 50 },
      { name: 'mouse', color: '#4ecdc4', y: 80 },
      { name: 'disk', color: '#45b7d1', y: 110 },
      { name: 'network', color: '#96ceb4', y: 140 },
      { name: 'cpu', color: '#ffeaa7', y: 170 }
    ]
    
    const animate = () => {
      frameCount++
      
      // Clear canvas
      ctx.fillStyle = '#0f0f1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw OS Kernel
      ctx.strokeStyle = '#ff9500'
      ctx.fillStyle = 'rgba(255, 149, 0, 0.1)'
      ctx.lineWidth = 2
      ctx.fillRect(50, 30, 150, 160)
      ctx.strokeRect(50, 30, 150, 160)
      
      ctx.fillStyle = '#ff9500'
      ctx.font = '14px Arial'
      ctx.fillText('OS Kernel', 70, 50)
      ctx.font = '10px Arial'
      ctx.fillText('Entropy Pool', 70, 65)

      // Draw entropy sources
      entropySources.forEach((source, index) => {
        // Source icon
        ctx.fillStyle = source.color
        ctx.fillRect(20, source.y, 15, 15)
        
        ctx.fillStyle = '#fff'
        ctx.font = '8px Arial'
        ctx.fillText(source.name.substring(0, 3).toUpperCase(), 5, source.y + 25)

        // Generate entropy bits
        if (frameCount % (20 + index * 10) === 0) {
          entropyBits.push({
            x: 35,
            y: source.y + 7,
            targetX: 70 + Math.random() * 100,
            targetY: 80 + Math.random() * 80,
            color: source.color,
            speed: 1 + Math.random()
          })
        }
      })

      // Draw entropy bits flowing to pool
      entropyBits = entropyBits.filter(bit => {
        bit.x += bit.speed
        bit.y += (bit.targetY - bit.y) * 0.03
        
        ctx.fillStyle = bit.color
        ctx.beginPath()
        ctx.arc(bit.x, bit.y, 2, 0, Math.PI * 2)
        ctx.fill()
        
        return bit.x < bit.targetX
      })

      // Draw entropy pool visualization
      const poolX = 70, poolY = 80, poolW = 110, poolH = 80
      
      // Pool background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(poolX, poolY, poolW, poolH)
      
      // Entropy level
      const entropyLevel = Math.sin(frameCount * 0.05) * 0.3 + 0.7
      ctx.fillStyle = 'rgba(255, 149, 0, 0.3)'
      ctx.fillRect(poolX, poolY + poolH - (poolH * entropyLevel), poolW, poolH * entropyLevel)
      
      // Pool grid pattern
      ctx.strokeStyle = 'rgba(255, 149, 0, 0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath()
        ctx.moveTo(poolX + i * 11, poolY)
        ctx.lineTo(poolX + i * 11, poolY + poolH)
        ctx.stroke()
      }

      // Draw cryptographic hash function
      ctx.strokeStyle = '#e74c3c'
      ctx.fillStyle = 'rgba(231, 76, 60, 0.1)'
      ctx.fillRect(250, 80, 100, 60)
      ctx.strokeRect(250, 80, 100, 60)
      
      ctx.fillStyle = '#e74c3c'
      ctx.font = '12px Arial'
      ctx.fillText('SHA-256', 270, 100)
      ctx.font = '10px Arial'
      ctx.fillText('Hash Function', 260, 115)
      ctx.fillText('Mixing', 275, 130)

      // Generate mixing data
      if (frameCount % 40 === 0) {
        mixingData.push({
          x: 200,
          y: 110,
          targetX: 250,
          speed: 2,
          mixed: false
        })
      }

      // Draw data flowing to hash function
      mixingData = mixingData.filter(data => {
        data.x += data.speed
        
        if (!data.mixed && data.x >= 250) {
          data.mixed = true
          data.speed = 3
          data.targetX = 400
        }
        
        const color = data.mixed ? '#d946ef' : '#ff9500'
        ctx.fillStyle = color
        ctx.fillRect(data.x, data.y, 8, 8)
        
        return data.x < 450
      })

      // Draw output
      ctx.strokeStyle = '#d946ef'
      ctx.fillStyle = 'rgba(0, 255, 136, 0.1)'
      ctx.fillRect(400, 80, 80, 60)
      ctx.strokeRect(400, 80, 80, 60)
      
      ctx.fillStyle = '#d946ef'
      ctx.font = '12px Arial'
      ctx.fillText('Output', 420, 100)
      ctx.font = '10px Arial'
      ctx.fillText('Random', 420, 115)
      ctx.fillText('Bytes', 425, 130)

      // Draw process arrows
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 2
      ctx.setLineDash([3, 3])
      
      // Pool to hash
      ctx.beginPath()
      ctx.moveTo(180, 110)
      ctx.lineTo(250, 110)
      ctx.stroke()
      
      // Hash to output
      ctx.beginPath()
      ctx.moveTo(350, 110)
      ctx.lineTo(400, 110)
      ctx.stroke()
      
      ctx.setLineDash([])

      // Labels
      ctx.fillStyle = '#fff'
      ctx.font = '10px Arial'
      ctx.fillText('Entropy Sources', 10, 220)
      ctx.fillText('Kernel Pool', 90, 220)
      ctx.fillText('Cryptographic', 260, 160)
      ctx.fillText('Processing', 270, 170)
      ctx.fillText('Secure Output', 410, 160)

      // Cycle through current source
      if (frameCount % 120 === 0) {
        const sourceIndex = Math.floor(frameCount / 120) % entropySources.length
        setCurrentSource(entropySources[sourceIndex].name)
      }

      // Update stats
      if (frameCount % 30 === 0) {
        setStats(prev => ({
          entropyPool: Math.floor(200 + Math.random() * 100),
          entropy: entropyLevel * 100,
          mixing: frameCount % 60 < 30 ? Math.random() * 100 : 0,
          output: prev.output + Math.floor(Math.random() * 50)
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
        <h3>🔐 Cryptographic Random Generation</h3>
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
        height={240}
        className="simulation-canvas"
        style={{ border: '2px solid #d946ef', borderRadius: '4px' }}
      />
      
      <div className="simulation-info">
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Entropy Pool:</span>
            <span className="value">{stats.entropyPool} bits</span>
          </div>
          <div className="info-item">
            <span className="label">Current Source:</span>
            <span className="value">{currentSource}</span>
          </div>
          <div className="info-item">
            <span className="label">Entropy Level:</span>
            <span className="value">{stats.entropy.toFixed(0)}%</span>
          </div>
          <div className="info-item">
            <span className="label">Output:</span>
            <span className="value">{stats.output} bytes</span>
          </div>
        </div>
        
        <div className="technique-explanation">
          <h4>How OS Cryptographic Random Works:</h4>
          <ul>
            <li><strong>Entropy Sources:</strong> Keyboard, mouse, disk I/O, network timing, CPU jitter</li>
            <li><strong>Kernel Pool:</strong> OS maintains entropy pool from all system events</li>
            <li><strong>Cryptographic Mixing:</strong> SHA-256 or similar functions blend entropy</li>
            <li><strong>Rate Limiting:</strong> System monitors entropy quality and availability</li>
            <li><strong>Security Grade:</strong> Used for SSL/TLS, password generation, cryptographic keys</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CryptographicSimulation