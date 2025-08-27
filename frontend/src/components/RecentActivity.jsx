const RecentActivity = ({ activity, sourceStats }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const getSourceIcon = (source) => {
    switch (source) {
      case 'fpga': return '⚡'
      case 'anu': return '🌐'
      default: return '❓'
    }
  }

  const getSourceColor = (source) => {
    switch (source) {
      case 'fpga': return '#00ff88'
      case 'anu': return '#0088ff'
      default: return '#888888'
    }
  }

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <div className="recent-activity">
      <h2>Recent Activity</h2>
      
      {/* Source Statistics Summary */}
      <div className="source-stats">
        <h3>Generation Sources</h3>
        <div className="source-grid">
          {Object.entries(sourceStats).map(([source, stats]) => (
            <div key={source} className="source-card">
              <div className="source-header">
                <span className="source-icon" style={{ color: getSourceColor(source) }}>
                  {getSourceIcon(source)}
                </span>
                <span className="source-name">{source.toUpperCase()}</span>
              </div>
              <div className="source-metrics">
                <div className="source-metric">
                  <span className="metric-label">Requests:</span>
                  <span className="metric-value">{stats.requests}</span>
                </div>
                <div className="source-metric">
                  <span className="metric-label">Data:</span>
                  <span className="metric-value">{formatBytes(stats.bytes_generated)}</span>
                </div>
                <div className="source-metric">
                  <span className="metric-label">Avg Speed:</span>
                  <span className="metric-value">{stats.average_throughput_mbps?.toFixed(1)} Mbps</span>
                </div>
                {stats.error_count > 0 && (
                  <div className="source-metric error">
                    <span className="metric-label">Errors:</span>
                    <span className="metric-value">{stats.error_count}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="activity-log">
        <h3>Activity Log</h3>
        {!activity || activity.length === 0 ? (
          <div className="no-activity">
            <span className="no-activity-icon">📊</span>
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="activity-list">
            <div className="activity-header">
              <span className="col-time">Time</span>
              <span className="col-source">Source</span>
              <span className="col-size">Size</span>
              <span className="col-speed">Speed</span>
              <span className="col-latency">Latency</span>
            </div>
            {activity.map((item, index) => (
              <div key={index} className="activity-item">
                <span className="col-time">{formatTime(item.timestamp)}</span>
                <span className="col-source">
                  <span 
                    className="source-badge"
                    style={{ 
                      color: getSourceColor(item.source),
                      borderColor: getSourceColor(item.source)
                    }}
                  >
                    {getSourceIcon(item.source)} {item.source.toUpperCase()}
                  </span>
                </span>
                <span className="col-size">{formatBytes(item.size_bytes)}</span>
                <span className="col-speed">
                  <span className="speed-value">{item.throughput_mbps} Mbps</span>
                </span>
                <span className="col-latency">
                  <span className={`latency-value ${item.latency_ms > 100 ? 'high' : item.latency_ms > 50 ? 'medium' : 'low'}`}>
                    {item.latency_ms} ms
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentActivity