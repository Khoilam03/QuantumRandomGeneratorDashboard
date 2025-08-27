const SystemHealth = ({ stats }) => {
  if (!stats) {
    return (
      <div className="system-health">
        <h2>System Health</h2>
        <div className="health-loading">Loading health data...</div>
      </div>
    )
  }

  const getHealthStatus = (score) => {
    if (score >= 0.8) return { status: 'Excellent', color: '#00ff88', icon: '✅' }
    if (score >= 0.6) return { status: 'Good', color: '#ffaa00', icon: '⚠️' }
    if (score >= 0.4) return { status: 'Fair', color: '#ff8800', icon: '⚠️' }
    return { status: 'Poor', color: '#ff4444', icon: '❌' }
  }

  const formatUptime = (seconds) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    return `${days}d ${hours}h`
  }

  // Calculate overall health score
  const metrics = stats.real_time_metrics || {}
  const targetThroughput = 50
  const throughputHealth = Math.min(metrics.average_throughput_mbps / targetThroughput, 1.0) || 0
  const latencyHealth = Math.max(1.0 - (metrics.average_latency_ms / 1000.0), 0.0) || 1.0
  const uptimeHealth = Math.min(metrics.uptime_seconds / 3600, 1.0) || 0 // Full health after 1 hour
  
  const overallHealth = (throughputHealth + latencyHealth + uptimeHealth) / 3
  const healthStatus = getHealthStatus(overallHealth)

  const qualityMetrics = stats.quality_metrics || {}
  const hasQualityData = qualityMetrics.sample_count > 0

  return (
    <div className="system-health">
      <h2>System Health</h2>
      
      <div className="health-overview">
        <div className="health-score">
          <div className="health-icon" style={{ color: healthStatus.color }}>
            {healthStatus.icon}
          </div>
          <div className="health-details">
            <div className="health-status" style={{ color: healthStatus.color }}>
              {healthStatus.status}
            </div>
            <div className="health-percentage">
              {(overallHealth * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="health-metrics">
        <div className="health-metric">
          <div className="metric-header">
            <span className="metric-label">Throughput Performance</span>
            <span className="metric-value" style={{ color: getHealthStatus(throughputHealth).color }}>
              {(throughputHealth * 100).toFixed(1)}%
            </span>
          </div>
          <div className="metric-bar">
            <div 
              className="metric-fill" 
              style={{ 
                width: `${throughputHealth * 100}%`,
                backgroundColor: getHealthStatus(throughputHealth).color
              }}
            />
          </div>
          <div className="metric-details">
            Current: {metrics.average_throughput_mbps?.toFixed(1) || '0.0'} Mbps / Target: {targetThroughput} Mbps
          </div>
        </div>

        <div className="health-metric">
          <div className="metric-header">
            <span className="metric-label">Latency Performance</span>
            <span className="metric-value" style={{ color: getHealthStatus(latencyHealth).color }}>
              {(latencyHealth * 100).toFixed(1)}%
            </span>
          </div>
          <div className="metric-bar">
            <div 
              className="metric-fill" 
              style={{ 
                width: `${latencyHealth * 100}%`,
                backgroundColor: getHealthStatus(latencyHealth).color
              }}
            />
          </div>
          <div className="metric-details">
            Average: {metrics.average_latency_ms?.toFixed(1) || '0.0'} ms
          </div>
        </div>

        <div className="health-metric">
          <div className="metric-header">
            <span className="metric-label">System Uptime</span>
            <span className="metric-value" style={{ color: getHealthStatus(uptimeHealth).color }}>
              {formatUptime(metrics.uptime_seconds || 0)}
            </span>
          </div>
          <div className="metric-bar">
            <div 
              className="metric-fill" 
              style={{ 
                width: `${uptimeHealth * 100}%`,
                backgroundColor: getHealthStatus(uptimeHealth).color
              }}
            />
          </div>
          <div className="metric-details">
            {metrics.total_requests || 0} total requests processed
          </div>
        </div>

        {hasQualityData && (
          <div className="health-metric">
            <div className="metric-header">
              <span className="metric-label">Data Quality</span>
              <span className="metric-value" style={{ color: '#00ff88' }}>
                {qualityMetrics.entropy?.current?.toFixed(2) || 'N/A'}
              </span>
            </div>
            <div className="metric-bar">
              <div 
                className="metric-fill" 
                style={{ 
                  width: `${(qualityMetrics.entropy?.current / 8.0 * 100) || 0}%`,
                  backgroundColor: '#00ff88'
                }}
              />
            </div>
            <div className="metric-details">
              Shannon Entropy (max: 8.0) - {qualityMetrics.sample_count} samples
            </div>
          </div>
        )}
      </div>

      <div className="health-summary">
        <div className="summary-stat">
          <span className="stat-label">RPS:</span>
          <span className="stat-value">{metrics.requests_per_second?.toFixed(1) || '0.0'}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Peak Throughput:</span>
          <span className="stat-value">{metrics.peak_throughput_mbps?.toFixed(1) || '0.0'} Mbps</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Total Data:</span>
          <span className="stat-value">{formatBytes(metrics.total_bytes_generated || 0)}</span>
        </div>
      </div>
    </div>
  )
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default SystemHealth