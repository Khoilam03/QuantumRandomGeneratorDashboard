import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import TechniqueSimulations from './components/TechniqueSimulations'
import GeneratorControl from './components/GeneratorControl'

const API_BASE_URL = 'http://localhost:5000/api'

function App() {
  const [systemStatus, setSystemStatus] = useState({
    status: 'disconnected',
    throughput: 0,
    lastUpdate: null
  })
  
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Check backend connection on startup
    checkBackendConnection()
    
    // Set up periodic status updates
    const interval = setInterval(() => {
      updateSystemStatus()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/health')
      if (response.ok) {
        setSystemStatus(prev => ({ ...prev, status: 'connected' }))
      }
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, status: 'disconnected' }))
    }
  }

  const updateSystemStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/throughput`)
      if (response.ok) {
        const data = await response.json()
        setSystemStatus({
          status: 'operational',
          throughput: data.current_throughput_mbps,
          lastUpdate: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Failed to update system status:', error)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TechniqueSimulations apiUrl={API_BASE_URL} />
      case 'generator':
        return <GeneratorControl apiUrl={API_BASE_URL} />
      default:
        return <TechniqueSimulations apiUrl={API_BASE_URL} />
    }
  }

  return (
    <div className="app">
      <Header 
        systemStatus={systemStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="main-content">
        {renderTabContent()}
      </main>
    </div>
  )
}

export default App
