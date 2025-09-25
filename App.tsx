import React, { useState } from 'react';
import { LandingScreen } from './components/LandingScreen';
import { SystemArchitecture } from './components/SystemArchitecture';
import { SimulationDashboard } from './components/SimulationDashboard';
import { DataflowDiagram } from './components/DataflowDiagram';
import { PerformanceComparison } from './components/PerformanceComparison';
import { RealSystemAnalysis } from './components/RealSystemAnalysis';

export type PageType = 'landing' | 'architecture' | 'simulation' | 'dataflow' | 'performance' | 'real-analysis';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingScreen onNavigate={setCurrentPage} />;
      case 'architecture':
        return <SystemArchitecture onNavigate={setCurrentPage} />;
      case 'simulation':
        return <SimulationDashboard onNavigate={setCurrentPage} />;
      case 'dataflow':
        return <DataflowDiagram onNavigate={setCurrentPage} />;
      case 'performance':
        return <PerformanceComparison onNavigate={setCurrentPage} />;
      case 'real-analysis':
        return <RealSystemAnalysis onNavigate={setCurrentPage} />;
      default:
        return <LandingScreen onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderPage()}
    </div>
  );
}