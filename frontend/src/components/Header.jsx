import { useState } from 'react'
import { Atom, Zap, BarChart3 } from 'lucide-react'

const Header = ({ systemStatus, activeTab, onTabChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return '#00ff88'
      case 'connected': return '#ffaa00'
      case 'disconnected': return '#ff4444'
      default: return '#666666'
    }
  }

  const formatThroughput = (mbps) => {
    if (mbps === 0) return '0 Mbps'
    if (mbps < 1) return `${(mbps * 1000).toFixed(0)} Kbps`
    return `${mbps.toFixed(1)} Mbps`
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'generator', label: 'Generator', icon: Zap }
  ]

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <Atom className="quantum-icon" size={32} />
          <h1>Quantum Random Generator Dashboard</h1>
        </div>
        
        <div className="system-status">
          <div className="status-indicator">
            <div 
              className="status-dot"
              style={{ backgroundColor: getStatusColor(systemStatus.status) }}
            />
            <span className="status-text">
              {systemStatus.status.toUpperCase()}
            </span>
          </div>
          
          <div className="throughput-display">
            <span className="throughput-label">Throughput:</span>
            <span className="throughput-value">
              {formatThroughput(systemStatus.throughput)}
            </span>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        {tabs.map(tab => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <IconComponent className="tab-icon" size={20} />
              <span className="tab-label">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </header>
  )
}

export default Header