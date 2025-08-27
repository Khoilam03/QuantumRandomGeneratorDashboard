import { useState, useEffect } from 'react'

const PerformanceMonitor = ({ apiUrl }) => {
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPerformanceData()
    const interval = setInterval(loadPerformanceData, 2000)
    return () => clearInterval(interval)
  }, [apiUrl])

  const loadPerformanceData = async () => {
    try {
      const response = await fetch(`${apiUrl}/stats`)
      const data = await response.json()
      setPerformanceData(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load performance data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="performance-monitor loading">
        <div className="loading-spinner">📊</div>
        <p>Loading performance data...</p>
      </div>
    )
  }

  if (!performanceData) {
    return (
      <div className="performance-monitor error">
        <h2>Performance Monitor</h2>
        <p>Failed to load performance data</p>
      </div>
    )
  }

  const formatPercentile = (percentiles, p) => {
    return percentiles && percentiles[`p${p}`] ? percentiles[`p${p}`].toFixed(2) : 'N/A'
  }

  const formatUptime = (seconds) => {
    if (!seconds) return '0s'
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

  const throughputDist = performanceData.throughput_distribution || {}
  const latencyDist = performanceData.latency_distribution || {}
  const realTimeMetrics = performanceData.real_time_metrics || {}

  return (
    <div className="performance-monitor">
      <h2>Performance Monitor</h2>

      {/* Real-time Metrics */}
      <div className="performance-section">
        <h3>Real-time Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">⚡</div>
            <div className="metric-content">
              <div className="metric-label">Current Throughput</div>
              <div className="metric-value">
                {realTimeMetrics.instantaneous_throughput_mbps?.toFixed(2) || '0.00'} Mbps
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-label">Average Throughput</div>
              <div className="metric-value">
                {realTimeMetrics.average_throughput_mbps?.toFixed(2) || '0.00'} Mbps
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <div className="metric-label">Peak Throughput</div>
              <div className="metric-value">
                {realTimeMetrics.peak_throughput_mbps?.toFixed(2) || '0.00'} Mbps
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⏱️</div>
            <div className="metric-content">
              <div className="metric-label">Average Latency</div>
              <div className="metric-value">
                {realTimeMetrics.average_latency_ms?.toFixed(2) || '0.00'} ms
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🔄</div>
            <div className="metric-content">
              <div className="metric-label">Requests/Second</div>
              <div className="metric-value">
                {realTimeMetrics.requests_per_second?.toFixed(1) || '0.0'}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⏰</div>
            <div className="metric-content">
              <div className="metric-label">System Uptime</div>
              <div className="metric-value">
                {formatUptime(realTimeMetrics.uptime_seconds)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Throughput Distribution */}
      <div className="performance-section">
        <h3>Throughput Distribution</h3>
        <div className="distribution-stats">
          <div className="dist-stat">
            <span className="stat-label">Mean:</span>
            <span className="stat-value">{throughputDist.mean?.toFixed(2) || 'N/A'} Mbps</span>
          </div>
          <div className="dist-stat">
            <span className="stat-label">Median:</span>
            <span className="stat-value">{throughputDist.median?.toFixed(2) || 'N/A'} Mbps</span>
          </div>
          <div className="dist-stat">
            <span className="stat-label">Std Dev:</span>
            <span className="stat-value">{throughputDist.std?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="dist-stat">
            <span className="stat-label">Min:</span>
            <span className="stat-value">{throughputDist.min?.toFixed(2) || 'N/A'} Mbps</span>
          </div>
          <div className="dist-stat">
            <span className="stat-label">Max:</span>
            <span className="stat-value">{throughputDist.max?.toFixed(2) || 'N/A'} Mbps</span>
          </div>
        </div>

        <div className="percentiles">
          <h4>Percentiles</h4>
          <div className="percentile-grid">
            <div className="percentile-item">
              <span className="percentile-label">25th:</span>
              <span className="percentile-value">{formatPercentile(throughputDist.percentiles, 25)} Mbps</span>
            </div>
            <div className="percentile-item">
              <span className="percentile-label">50th:</span>
              <span className="percentile-value">{formatPercentile(throughputDist.percentiles, 50)} Mbps</span>
            </div>
            <div className="percentile-item">
              <span className="percentile-label">75th:</span>
              <span className="percentile-value">{formatPercentile(throughputDist.percentiles, 75)} Mbps</span>
            </div>
            <div className="percentile-item">
              <span className="percentile-label">90th:</span>
              <span className="percentile-value">{formatPercentile(throughputDist.percentiles, 90)} Mbps</span>
            </div>
            <div className="percentile-item">
              <span className="percentile-label">95th:</span>
              <span className="percentile-value">{formatPercentile(throughputDist.percentiles, 95)} Mbps</span>
            </div>
            <div className="percentile-item">
              <span className="percentile-label">99th:</span>
              <span className="percentile-value">{formatPercentile(throughputDist.percentiles, 99)} Mbps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latency Distribution */}
      <div className="performance-section">
        <h3>Latency Distribution</h3>
        <div className="distribution-stats">
          <div className="dist-stat">
            <span className="stat-label">Mean:</span>
            <span className="stat-value">{latencyDist.mean_ms?.toFixed(2) || 'N/A'} ms</span>
          </div>
          <div className="dist-stat">
            <span className="stat-label">Median:</span>
            <span className="stat-value">{latencyDist.median_ms?.toFixed(2) || 'N/A'} ms</span>
          </div>
          <div className="dist-stat">
            <span className="stat-label">Std Dev:</span>
            <span className="stat-value">{latencyDist.std_ms?.toFixed(2) || 'N/A'} ms</span>
          </div>
          <div className="dist-stat">
            <span className="stat-label">Min:</span>
            <span className="stat-value">{latencyDist.min_ms?.toFixed(2) || 'N/A'} ms</span>
          </div>
          <div className="dist-stat">
            <span className="stat-label">Max:</span>
            <span className="stat-value">{latencyDist.max_ms?.toFixed(2) || 'N/A'} ms</span>
          </div>
        </div>

        <div className="percentiles">
          <h4>Latency Percentiles</h4>
          <div className="percentile-grid">
            <div className="percentile-item">
              <span className="percentile-label">50th:</span>
              <span className="percentile-value">{formatPercentile(latencyDist.percentiles, 50)} ms</span>
            </div>
            <div className="percentile-item">
              <span className="percentile-label">90th:</span>
              <span className="percentile-value">{formatPercentile(latencyDist.percentiles, 90)} ms</span>
            </div>
            <div className="percentile-item">
              <span className="percentile-label">95th:</span>
              <span className="percentile-value">{formatPercentile(latencyDist.percentiles, 95)} ms</span>
            </div>
            <div className="percentile-item">
              <span className="percentile-label">99th:</span>
              <span className="percentile-value">{formatPercentile(latencyDist.percentiles, 99)} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Source Statistics */}
      <div className="performance-section">
        <h3>Generation Sources</h3>
        <div className="source-performance">
          {Object.entries(performanceData.source_statistics || {}).map(([source, stats]) => (
            <div key={source} className="source-perf-card">
              <h4>{source.toUpperCase()}</h4>
              <div className="source-perf-stats">
                <div className="source-stat">
                  <span className="stat-label">Requests:</span>
                  <span className="stat-value">{stats.requests}</span>
                </div>
                <div className="source-stat">
                  <span className="stat-label">Data Generated:</span>
                  <span className="stat-value">{formatBytes(stats.bytes_generated)}</span>
                </div>
                <div className="source-stat">
                  <span className="stat-label">Avg Throughput:</span>
                  <span className="stat-value">{stats.average_throughput_mbps?.toFixed(2)} Mbps</span>
                </div>
                <div className="source-stat">
                  <span className="stat-label">Total Time:</span>
                  <span className="stat-value">{stats.total_time?.toFixed(2)} s</span>
                </div>
                {stats.error_count > 0 && (
                  <div className="source-stat error">
                    <span className="stat-label">Errors:</span>
                    <span className="stat-value">{stats.error_count}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Metrics */}
      {performanceData.quality_metrics && (
        <div className="performance-section">
          <h3>Data Quality Metrics</h3>
          <div className="quality-metrics">
            {performanceData.quality_metrics.entropy && (
              <div className="quality-metric">
                <h4>Entropy</h4>
                <div className="quality-stats">
                  <div className="quality-stat">
                    <span className="stat-label">Current:</span>
                    <span className="stat-value">{performanceData.quality_metrics.entropy.current?.toFixed(3)}</span>
                  </div>
                  <div className="quality-stat">
                    <span className="stat-label">Average:</span>
                    <span className="stat-value">{performanceData.quality_metrics.entropy.average?.toFixed(3)}</span>
                  </div>
                  <div className="quality-stat">
                    <span className="stat-label">Min:</span>
                    <span className="stat-value">{performanceData.quality_metrics.entropy.min?.toFixed(3)}</span>
                  </div>
                  <div className="quality-stat">
                    <span className="stat-label">Max:</span>
                    <span className="stat-value">{performanceData.quality_metrics.entropy.max?.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default PerformanceMonitor