import { useState, useEffect, useRef } from 'react'

const ThroughputChart = ({ data, target }) => {
  const canvasRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 300 })

  useEffect(() => {
    drawChart()
  }, [data, target, dimensions])

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current?.parentElement) {
        const parent = canvasRef.current.parentElement
        setDimensions({
          width: parent.clientWidth - 40,
          height: 300
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height } = dimensions
    
    // Set canvas size
    canvas.width = width
    canvas.height = height
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)

    if (!data || data.length === 0) {
      // Draw "No Data" message
      ctx.fillStyle = '#666'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('No throughput data available', width / 2, height / 2)
      return
    }

    // Chart margins
    const margin = { top: 20, right: 60, bottom: 40, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Process data
    const maxThroughput = Math.max(target * 1.2, ...data.map(d => d.throughput_mbps), 1)
    const timeRange = 60000 // 60 seconds in milliseconds
    const now = Date.now()

    // Draw grid
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1

    // Horizontal grid lines
    const ySteps = 5
    for (let i = 0; i <= ySteps; i++) {
      const y = margin.top + (chartHeight / ySteps) * i
      ctx.beginPath()
      ctx.moveTo(margin.left, y)
      ctx.lineTo(width - margin.right, y)
      ctx.stroke()

      // Y-axis labels
      ctx.fillStyle = '#888'
      ctx.font = '12px Arial'
      ctx.textAlign = 'right'
      const value = maxThroughput * (1 - i / ySteps)
      ctx.fillText(value.toFixed(1), margin.left - 10, y + 4)
    }

    // Vertical grid lines
    const xSteps = 6
    for (let i = 0; i <= xSteps; i++) {
      const x = margin.left + (chartWidth / xSteps) * i
      ctx.beginPath()
      ctx.moveTo(x, margin.top)
      ctx.lineTo(x, height - margin.bottom)
      ctx.stroke()

      // X-axis labels (time)
      ctx.fillStyle = '#888'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      const secondsAgo = (timeRange / 1000) * (1 - i / xSteps)
      ctx.fillText(`-${secondsAgo.toFixed(0)}s`, x, height - margin.bottom + 20)
    }

    // Draw target line
    if (target > 0) {
      const targetY = margin.top + chartHeight * (1 - target / maxThroughput)
      ctx.strokeStyle = '#ffaa00'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(margin.left, targetY)
      ctx.lineTo(width - margin.right, targetY)
      ctx.stroke()
      ctx.setLineDash([])

      // Target label
      ctx.fillStyle = '#ffaa00'
      ctx.font = '12px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`Target: ${target} Mbps`, width - margin.right + 5, targetY + 4)
    }

    // Draw throughput line
    if (data.length > 1) {
      ctx.strokeStyle = '#00ff88'
      ctx.lineWidth = 3
      ctx.beginPath()

      let isFirstPoint = true
      data.forEach((point, index) => {
        const timestamp = new Date(point.timestamp).getTime()
        const x = margin.left + chartWidth * (1 - (now - timestamp) / timeRange)
        const y = margin.top + chartHeight * (1 - point.throughput_mbps / maxThroughput)

        if (x >= margin.left && x <= width - margin.right) {
          if (isFirstPoint) {
            ctx.moveTo(x, y)
            isFirstPoint = false
          } else {
            ctx.lineTo(x, y)
          }
        }
      })

      ctx.stroke()

      // Draw data points
      ctx.fillStyle = '#00ff88'
      data.forEach((point) => {
        const timestamp = new Date(point.timestamp).getTime()
        const x = margin.left + chartWidth * (1 - (now - timestamp) / timeRange)
        const y = margin.top + chartHeight * (1 - point.throughput_mbps / maxThroughput)

        if (x >= margin.left && x <= width - margin.right) {
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, 2 * Math.PI)
          ctx.fill()
        }
      })
    }

    // Draw axes
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, height - margin.bottom)
    ctx.lineTo(width - margin.right, height - margin.bottom)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = '#ccc'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Time (seconds ago)', width / 2, height - 5)

    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Throughput (Mbps)', 0, 0)
    ctx.restore()
  }

  return (
    <div className="throughput-chart">
      <canvas ref={canvasRef} />
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#00ff88' }}></div>
          <span>Current Throughput</span>
        </div>
        <div className="legend-item">
          <div className="legend-color target" style={{ backgroundColor: '#ffaa00' }}></div>
          <span>Target Throughput</span>
        </div>
      </div>
    </div>
  )
}

export default ThroughputChart