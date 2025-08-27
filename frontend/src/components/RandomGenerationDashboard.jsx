import { useState } from 'react'
import { Zap, BarChart3, Settings, Wrench } from 'lucide-react'
import Dashboard from './Dashboard'
import GeneratorControl from './GeneratorControl'
import TechniqueSimulations from './TechniqueSimulations'

const RandomGenerationDashboard = ({ apiUrl }) => {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: BarChart3,
      description: 'Real-time quantum random generation metrics and system health'
    },
    {
      id: 'generator',
      title: 'Generator Control',
      icon: Zap,
      description: 'Interactive quantum random value generation interface'
    },
    {
      id: 'simulations',
      title: 'Technique Simulations',
      icon: Wrench,
      description: 'Visual simulations of different quantum generation techniques'
    }
  ]

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return <Dashboard apiUrl={apiUrl} />
      case 'generator':
        return <GeneratorControl apiUrl={apiUrl} />
      case 'simulations':
        return <TechniqueSimulations />
      default:
        return <Dashboard apiUrl={apiUrl} />
    }
  }

  return (
    <div className="random-generation-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <Zap className="header-icon" size={32} />
          <div className="header-text">
            <h1>Quantum Random Generation</h1>
            <p>High-throughput quantum entropy generation with FPGA simulation and ANU validation</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <nav className="section-nav">
          {sections.map(section => {
            const IconComponent = section.icon
            return (
              <button
                key={section.id}
                className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="tab-content">
                  <IconComponent className="tab-icon" size={20} />
                  <div className="tab-text">
                    <span className="tab-title">{section.title}</span>
                    <span className="tab-description">{section.description}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </nav>

        <main className="section-content">
          {renderSectionContent()}
        </main>
      </div>
    </div>
  )
}

export default RandomGenerationDashboard