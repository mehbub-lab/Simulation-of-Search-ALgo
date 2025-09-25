import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { PageType } from '../App';
import { ArrowLeft, ArrowRight, HardDrive, Database, Cpu, Layers } from 'lucide-react';

interface SystemArchitectureProps {
  onNavigate: (page: PageType) => void;
}

type SearchStructure = 'BST' | 'Hash' | 'Trie';

export function SystemArchitecture({ onNavigate }: SystemArchitectureProps) {
  const [activeStructure, setActiveStructure] = useState<SearchStructure>('BST');

  const structures = [
    { name: 'BST' as const, color: 'bg-green-100 border-green-300 text-green-700', icon: Database },
    { name: 'Hash' as const, color: 'bg-blue-100 border-blue-300 text-blue-700', icon: Database },
    { name: 'Trie' as const, color: 'bg-orange-100 border-orange-300 text-orange-700', icon: Database }
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
              <h1 className="text-3xl text-gray-900">System Architecture</h1>
              <p className="text-gray-600">OS File Access and Cache Performance Pipeline</p>
            </div>
          </div>
          <Button 
            onClick={() => onNavigate('simulation')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          >
            Go to Simulation
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Structure Toggle */}
        <Card className="p-6 rounded-2xl shadow-lg border-0">
          <h3 className="text-lg mb-4">Active Search Structure</h3>
          <div className="flex gap-4">
            {structures.map((structure) => (
              <div key={structure.name} className="flex items-center space-x-2">
                <Switch
                  id={structure.name}
                  checked={activeStructure === structure.name}
                  onCheckedChange={() => setActiveStructure(structure.name)}
                />
                <Label htmlFor={structure.name} className="cursor-pointer">
                  {structure.name}
                </Label>
              </div>
            ))}
          </div>
        </Card>

        {/* Architecture Diagram */}
        <Card className="p-8 rounded-2xl shadow-lg border-0">
          <div className="flex items-center justify-between">
            {/* File System */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center shadow-md">
                <HardDrive className="w-12 h-12 text-gray-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg">File System</h3>
                <p className="text-sm text-gray-500">OS Layer</p>
              </div>
            </div>

            {/* Arrow 1 */}
            <ArrowRight className="w-8 h-8 text-gray-400" />

            {/* Search Structures */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex flex-col space-y-2">
                {structures.map((structure) => {
                  const Icon = structure.icon;
                  const isActive = activeStructure === structure.name;
                  return (
                    <div
                      key={structure.name}
                      className={`w-20 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? `${structure.color} shadow-lg scale-110 border-2` 
                          : 'bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? '' : 'text-gray-400'}`} />
                    </div>
                  );
                })}
              </div>
              <div className="text-center">
                <h3 className="text-lg">Search Structures</h3>
                <Badge className={structures.find(s => s.name === activeStructure)?.color}>
                  {activeStructure} Active
                </Badge>
              </div>
            </div>

            {/* Arrow 2 */}
            <ArrowRight className="w-8 h-8 text-gray-400" />

            {/* CPU Cache */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center shadow-md">
                  <Layers className="w-12 h-12 text-blue-600" />
                </div>
                <div className="absolute -top-2 -right-2 flex flex-col space-y-1">
                  <div className="w-6 h-2 bg-green-400 rounded-full"></div>
                  <div className="w-6 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-6 h-2 bg-red-400 rounded-full"></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg">CPU Cache</h3>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">L1, L2, L3</p>
                  <p className="text-xs text-gray-500">Multi-level</p>
                </div>
              </div>
            </div>

            {/* Arrow 3 */}
            <ArrowRight className="w-8 h-8 text-gray-400" />

            {/* Processor */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-purple-100 rounded-2xl flex items-center justify-center shadow-md">
                <Cpu className="w-12 h-12 text-purple-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg">Processor</h3>
                <p className="text-sm text-gray-500">CPU Core</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 rounded-2xl shadow-lg border-0">
            <h3 className="text-lg mb-4">Cache Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Hit Rate</span>
                  <span className="text-green-600">
                    {activeStructure === 'BST' && '72%'}
                    {activeStructure === 'Hash' && '88%'}
                    {activeStructure === 'Trie' && '81%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: activeStructure === 'BST' ? '72%' : 
                             activeStructure === 'Hash' ? '88%' : '81%' 
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Latency</span>
                  <span className="text-blue-600">
                    {activeStructure === 'BST' && '12ms'}
                    {activeStructure === 'Hash' && '8ms'}
                    {activeStructure === 'Trie' && '10ms'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl shadow-lg border-0">
            <h3 className="text-lg mb-4">Cache Levels</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">L1 Cache</span>
                <span className="text-sm text-green-600">95%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">L2 Cache</span>
                <span className="text-sm text-yellow-600">70%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">L3 Cache</span>
                <span className="text-sm text-red-600">45%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl shadow-lg border-0">
            <h3 className="text-lg mb-4">Structure Info</h3>
            <div className="space-y-2">
              {activeStructure === 'BST' && (
                <>
                  <p className="text-sm text-gray-600">Binary Search Tree</p>
                  <p className="text-xs text-gray-500">O(log n) average case</p>
                  <p className="text-xs text-gray-500">Good cache locality</p>
                </>
              )}
              {activeStructure === 'Hash' && (
                <>
                  <p className="text-sm text-gray-600">Hash Table</p>
                  <p className="text-xs text-gray-500">O(1) average case</p>
                  <p className="text-xs text-gray-500">Excellent performance</p>
                </>
              )}
              {activeStructure === 'Trie' && (
                <>
                  <p className="text-sm text-gray-600">Trie (Prefix Tree)</p>
                  <p className="text-xs text-gray-500">O(m) where m = key length</p>
                  <p className="text-xs text-gray-500">Good for string matching</p>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}