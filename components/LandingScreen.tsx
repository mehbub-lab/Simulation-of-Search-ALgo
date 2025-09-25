import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PageType } from '../App';
import { ChevronRight, Database, Cpu, Monitor } from 'lucide-react';

interface LandingScreenProps {
  onNavigate: (page: PageType) => void;
}

export function LandingScreen({ onNavigate }: LandingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <Card className="max-w-2xl mx-auto p-12 shadow-2xl border-0 rounded-3xl">
        <div className="text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Cpu className="w-10 h-10 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl text-gray-900">File Access and Cache Simulation</h1>
            <p className="text-xl text-gray-600">Comparing BST, Hash Tables, and Tries</p>
          </div>

          {/* Description */}
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            Interactive simulation dashboard for analyzing OS file access patterns and CPU cache performance 
            across different search data structures.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              onClick={() => onNavigate('simulation')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              Start Simulation
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              onClick={() => onNavigate('real-analysis')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Analyze Real System
            </Button>
            <Button 
              variant="outline"
              onClick={() => onNavigate('architecture')}
              className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 px-8 py-3 rounded-xl transition-all duration-200"
            >
              View Architecture
            </Button>
          </div>

          {/* Quick navigation */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Quick Navigation</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('dataflow')}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Dataflow
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('performance')}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Performance
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('real-analysis')}
                className="text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
              >
                Real System
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}