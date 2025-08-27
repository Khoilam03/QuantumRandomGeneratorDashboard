import { useState } from 'react'
import { Zap, Info, Settings } from 'lucide-react'
import GeneratorControl from './GeneratorControl'

const RandomGeneratorTab = ({ apiUrl }) => {
  const [activeSubTab, setActiveSubTab] = useState('overview')

  const subTabs = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Info,
      description: 'Introduction to Quantum Random Generation'
    },
    {
      id: 'generator',
      title: 'Generator',
      icon: Settings,
      description: 'Interactive random value generation'
    }
  ]

  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <RandomGeneratorOverview />
      case 'generator':
        return <GeneratorControl apiUrl={apiUrl} />
      default:
        return <RandomGeneratorOverview />
    }
  }

  return (
    <div className="random-generator-tab">
      <div className="tab-header">
        <div className="header-content">
          <Zap className="header-icon" size={28} />
          <div className="header-text">
            <h1>Quantum Random Generator</h1>
            <p>High-throughput quantum entropy generation with FPGA simulation and ANU validation</p>
          </div>
        </div>

        <nav className="sub-nav">
          {subTabs.map(tab => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                className={`sub-tab ${activeSubTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveSubTab(tab.id)}
              >
                <IconComponent className="sub-tab-icon" size={18} />
                <div className="sub-tab-content">
                  <span className="sub-tab-title">{tab.title}</span>
                  <span className="sub-tab-description">{tab.description}</span>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  )
}

const RandomGeneratorOverview = () => {
  return (
    <div className="qsmpc-overview-content">
      <div className="overview-section hero-section">
        <div className="hero-content">
          <h2>Quantum Random Number Generation</h2>
          <p className="hero-description">
            High-throughput quantum entropy generation delivering true randomness through FPGA simulation 
            and Australian National University API validation, achieving greater than 50 Mbps throughput for 
            cryptographic applications.
          </p>
        </div>
      </div>
      
      <div className="overview-section">
        <h3>Core Technologies</h3>
        <p>FPGA-based quantum simulation with ANU API validation provides high-quality entropy generation.</p>
      </div>

      <div className="overview-section">
        <h3>Applications</h3>
        <p>Cryptographic key generation, protocol seeding, blockchain applications, and scientific simulations.</p>
      </div>
    </div>
  )
}

export default RandomGeneratorTab