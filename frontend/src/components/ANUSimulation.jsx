import { useState, useEffect, useRef } from 'react'

const ANUSimulation = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [isRunning, setIsRunning] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [stats, setStats] = useState({
    requests: 0,
    latency: 0,
    dataReceived: 0,
    queueSize: 0
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
    let packets = []
    let beamSplitterAngle = 0
    
    const animate = () => {
      frameCount++
      beamSplitterAngle += 0.05
      
      // Clear canvas
      ctx.fillStyle = '#0f0f1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw ANU facility
      ctx.strokeStyle = '#4a9eff'
      ctx.fillStyle = 'rgba(74, 158, 255, 0.1)'
      ctx.lineWidth = 2
      ctx.fillRect(20, 20, 120, 80)
      ctx.strokeRect(20, 20, 120, 80)
      
      ctx.fillStyle = '#4a9eff'
      ctx.font = '12px Arial'
      ctx.fillText('ANU Quantum Lab', 25, 40)
      ctx.font = '10px Arial'
      ctx.fillText('Canberra, Australia', 25, 55)
      ctx.fillText('Live Quantum Source', 25, 70)

      // Draw laser and beam splitter
      ctx.fillStyle = '#d946ef'
      ctx.beginPath()
      ctx.arc(30, 130, 8, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#fff'
      ctx.font = '8px Arial'
      ctx.fillText('Laser', 15, 150)

      // Animated beam splitter
      ctx.save()
      ctx.translate(100, 130)
      ctx.rotate(beamSplitterAngle)
      ctx.strokeStyle = '#9333ea'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(-10, -10)
      ctx.lineTo(10, 10)
      ctx.stroke()
      ctx.restore()

      // Draw detectors
      ctx.fillStyle = '#ff4444'
      ctx.fillRect(150, 110, 20, 15)
      ctx.fillStyle = '#4444ff'
      ctx.fillRect(150, 145, 20, 15)

      // Draw photon paths with quantum superposition
      const photonX = 45 + Math.sin(frameCount * 0.1) * 5
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(photonX, 130)
      ctx.lineTo(95, 130)
      ctx.stroke()
      
      // Superposition paths
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)'
      ctx.beginPath()
      ctx.moveTo(105, 130)
      ctx.lineTo(150, 118)
      ctx.moveTo(105, 130)
      ctx.lineTo(150, 152)
      ctx.stroke()
      ctx.setLineDash([])

      // Internet connection visualization
      const serverX = 250
      ctx.strokeStyle = '#4a9eff'
      ctx.fillStyle = 'rgba(74, 158, 255, 0.1)'
      ctx.fillRect(serverX, 40, 100, 60)
      ctx.strokeRect(serverX, 40, 100, 60)
      
      ctx.fillStyle = '#4a9eff'
      ctx.font = '12px Arial'
      ctx.fillText('API Server', serverX + 10, 60)
      ctx.font = '10px Arial'
      ctx.fillText('qrng.anu.edu.au', serverX + 5, 75)

      // Your computer
      ctx.strokeStyle = '#9333ea'
      ctx.fillStyle = 'rgba(0, 255, 136, 0.1)'
      ctx.fillRect(400, 40, 80, 60)
      ctx.strokeRect(400, 40, 80, 60)
      
      ctx.fillStyle = '#00ff88'
      ctx.font = '12px Arial'
      ctx.fillText('Your App', 410, 60)
      ctx.font = '10px Arial'
      ctx.fillText('Dashboard', 410, 75)

      // Draw data packets
      if (frameCount % 60 === 0) {
        packets.push({
          x: serverX + 100,
          y: 70,
          targetX: 400,
          speed: 3,
          data: Math.floor(Math.random() * 256)
        })
        setStats(prev => ({ ...prev, requests: prev.requests + 1 }))
      }

      packets = packets.filter(packet => {
        packet.x += packet.speed
        
        // Draw packet
        ctx.fillStyle = '#ffaa00'
        ctx.fillRect(packet.x, packet.y, 8, 8)
        ctx.fillStyle = '#000'
        ctx.font = '6px Arial'
        ctx.fillText(packet.data.toString(16), packet.x + 1, packet.y + 6)
        
        return packet.x < packet.targetX
      })

      // Connection status indicator
      const statusColors = {
        'connected': '#00ff88',
        'connecting': '#ffaa00',
        'disconnected': '#ff6b6b'
      }
      
      ctx.fillStyle = statusColors[connectionStatus]
      ctx.beginPath()
      ctx.arc(480, 30, 8, 0, Math.PI * 2)
      ctx.fill()

      // Labels
      ctx.fillStyle = '#fff'
      ctx.font = '10px Arial'
      ctx.fillText('Internet', 320, 130)
      ctx.fillText('HTTPS Request', 280, 85)
      ctx.fillText('JSON Response', 280, 95)

      // Update stats periodically
      if (frameCount % 120 === 0) {
        setStats(prev => ({
          ...prev,
          latency: 150 + Math.random() * 100,
          dataReceived: prev.dataReceived + 1024,
          queueSize: Math.floor(Math.random() * 5)
        }))
        
        // Simulate connection changes
        const statuses = ['connected', 'connecting', 'connected', 'connected']
        setConnectionStatus(statuses[Math.floor(Math.random() * statuses.length)])
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
        <h3>🌐 ANU Quantum API Connection</h3>
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
        style={{ border: '2px solid #a855f7', borderRadius: '4px' }}
      />
      
      <div className="simulation-info">
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Requests:</span>
            <span className="value">{stats.requests}</span>
          </div>
          <div className="info-item">
            <span className="label">Latency:</span>
            <span className="value">{stats.latency.toFixed(0)} ms</span>
          </div>
          <div className="info-item">
            <span className="label">Data Received:</span>
            <span className="value">{(stats.dataReceived / 1024).toFixed(1)} KB</span>
          </div>
          <div className="info-item">
            <span className="label">Status:</span>
            <span className={`value status-${connectionStatus}`}>
              {connectionStatus.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="technique-explanation">
          <h4>How ANU Quantum API Works:</h4>
          <div style={{ background: '#ff6b6b', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <strong>⚠️ LIMITATION:</strong> Only 1 request per minute allowed. Not suitable for real applications.
          </div>
          <ul>
            <li><strong>Real Quantum Source:</strong> Actual quantum lab in Canberra, Australia</li>
            <li><strong>Beam Splitter:</strong> Physical quantum device creating true randomness</li>
            <li><strong>Internet Connection:</strong> HTTPS requests to qrng.anu.edu.au</li>
            <li><strong>Severe Rate Limit:</strong> 1 request/minute, requires special permission for more</li>
            <li><strong>Research Use:</strong> Designed for academic research, not production apps</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ANUSimulation