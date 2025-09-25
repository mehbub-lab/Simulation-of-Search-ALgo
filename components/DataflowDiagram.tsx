import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { PageType } from '../App';
import { ArrowLeft, ArrowRight, User, FileText, Database, BarChart3, Eye, ChevronDown } from 'lucide-react';

interface DataflowDiagramProps {
  onNavigate: (page: PageType) => void;
}

export function DataflowDiagram({ onNavigate }: DataflowDiagramProps) {
  const flowSteps = [
    {
      id: 1,
      title: "User Request",
      description: "File access request initiated",
      icon: User,
      color: "bg-blue-100 border-blue-300 text-blue-700",
      details: ["File path resolution", "Permission validation", "Request queuing"]
    },
    {
      id: 2,
      title: "File Indexing Module",
      description: "Search structure selection and indexing",
      icon: FileText,
      color: "bg-green-100 border-green-300 text-green-700",
      details: ["BST/Hash/Trie selection", "Index lookup", "Path optimization"]
    },
    {
      id: 3,
      title: "Cache Simulation",
      description: "Multi-level cache interaction",
      icon: Database,
      color: "bg-purple-100 border-purple-300 text-purple-700",
      details: ["L1/L2/L3 cache check", "Hit/miss calculation", "Cache replacement"]
    },
    {
      id: 4,
      title: "Profiling & Benchmarking",
      description: "Performance metrics collection",
      icon: BarChart3,
      color: "bg-orange-100 border-orange-300 text-orange-700",
      details: ["Latency measurement", "Hit rate calculation", "Performance logging"]
    },
    {
      id: 5,
      title: "Visualization Module",
      description: "Results display and analysis",
      icon: Eye,
      color: "bg-pink-100 border-pink-300 text-pink-700",
      details: ["Chart generation", "Real-time updates", "Report creation"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => onNavigate('landing')}
              className="hover:bg-white/50 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl text-gray-900">System Dataflow</h1>
              <p className="text-gray-600">End-to-end process flow and data pipeline</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => onNavigate('architecture')}
              className="rounded-xl border-gray-300"
            >
              Architecture
            </Button>
            <Button 
              onClick={() => onNavigate('simulation')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              Run Simulation
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Process Overview */}
        <Card className="p-8 rounded-2xl shadow-lg border-0">
          <h2 className="text-2xl mb-6 text-center">File Access and Cache Performance Pipeline</h2>
          
          {/* Flow Diagram */}
          <div className="relative">
            {/* Desktop Flow - Horizontal */}
            <div className="hidden lg:flex items-center justify-between">
              {flowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center">
                    {/* Step Node */}
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`w-20 h-20 rounded-2xl border-2 ${step.color} flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105`}>
                        <Icon className="w-10 h-10" />
                      </div>
                      <div className="text-center max-w-32">
                        <h3 className="text-sm font-medium">{step.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Step {step.id}
                      </Badge>
                    </div>
                    
                    {/* Arrow */}
                    {index < flowSteps.length - 1 && (
                      <ArrowRight className="w-8 h-8 text-gray-400 mx-8" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Flow - Vertical */}
            <div className="lg:hidden space-y-6">
              {flowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className="flex items-center space-x-4 w-full">
                      <div className={`w-16 h-16 rounded-xl border-2 ${step.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium">{step.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            Step {step.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    
                    {index < flowSteps.length - 1 && (
                      <ChevronDown className="w-6 h-6 text-gray-400 my-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Detailed Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.id} className="p-6 rounded-2xl shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{step.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      Step {step.id}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{step.description}</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Key Operations:</h4>
                  <ul className="space-y-1">
                    {step.details.map((detail, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Performance Metrics Flow */}
        <Card className="p-8 rounded-2xl shadow-lg border-0">
          <h2 className="text-xl mb-6">Data Flow Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Input Rate</h3>
              <p className="text-2xl text-blue-600 mb-1">1,000</p>
              <p className="text-sm text-gray-500">requests/sec</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <Database className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Cache Hits</h3>
              <p className="text-2xl text-green-600 mb-1">72-88%</p>
              <p className="text-sm text-gray-500">hit rate</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Avg Latency</h3>
              <p className="text-2xl text-orange-600 mb-1">8-12</p>
              <p className="text-sm text-gray-500">milliseconds</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Throughput</h3>
              <p className="text-2xl text-purple-600 mb-1">950</p>
              <p className="text-sm text-gray-500">processed/sec</p>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => onNavigate('architecture')}
              className="rounded-xl"
            >
              View Architecture
            </Button>
            <Button 
              onClick={() => onNavigate('simulation')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              Start Simulation
            </Button>
            <Button 
              variant="outline"
              onClick={() => onNavigate('performance')}
              className="rounded-xl"
            >
              Performance Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}