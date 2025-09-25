import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Progress } from './ui/progress';
import { PageType } from '../App';
import { ArrowLeft, BarChart3, TrendingUp, Cpu, Database, Clock, Play, Square, RotateCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip as RechartsTooltip } from 'recharts';
import { FileAccessSimulator, StructureType as SimStructureType, WorkloadSize, SimulationResult } from './simulation/FileAccessSimulator';
import { RealSystemSimulator, RealSystemResult } from './simulation/RealSystemSimulator';

interface SimulationDashboardProps {
  onNavigate: (page: PageType) => void;
}

type StructureType = SimStructureType;

export function SimulationDashboard({ onNavigate }: SimulationDashboardProps) {
  const [selectedStructure, setSelectedStructure] = useState<StructureType>('BST');
  const [workloadSize, setWorkloadSize] = useState<WorkloadSize>('Medium');
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState<Record<StructureType, SimulationResult | null>>({
    BST: null,
    Hash: null,
    Trie: null
  });
  const [currentStats, setCurrentStats] = useState<Partial<SimulationResult> | null>(null);
  const [progress, setProgress] = useState(0);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [systemAnalysisMode, setSystemAnalysisMode] = useState<'simulated' | 'real'>('simulated');
  const [realSystemResults, setRealSystemResults] = useState<RealSystemResult[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  
  const simulatorRef = useRef<FileAccessSimulator | null>(null);
  const realSimulatorRef = useRef<RealSystemSimulator | null>(null);

  // Initialize simulators
  useEffect(() => {
    simulatorRef.current = new FileAccessSimulator();
    realSimulatorRef.current = new RealSystemSimulator();
    
    // Get system information on load
    if (realSimulatorRef.current) {
      realSimulatorRef.current.getDetailedSystemInfo().then(info => {
        setSystemInfo(info);
      });
    }
  }, []);

  // Default/fallback data for when no simulation has been run
  const defaultPerformanceData = {
    BST: { hitRate: 0, missRate: 0, latency: 0, color: '#22c55e' },
    Hash: { hitRate: 0, missRate: 0, latency: 0, color: '#3b82f6' },
    Trie: { hitRate: 0, missRate: 0, latency: 0, color: '#f97316' }
  };

  // Get current data from simulation results or defaults
  const getCurrentData = () => {
    const result = simulationResults[selectedStructure];
    if (result) {
      return {
        hitRate: Math.round(result.hitRate * 10) / 10,
        missRate: Math.round(result.missRate * 10) / 10,
        latency: Math.round(result.avgLatency * 100) / 100,
        color: defaultPerformanceData[selectedStructure].color
      };
    }
    return currentStats ? {
      hitRate: Math.round((currentStats.hitRate || 0) * 10) / 10,
      missRate: Math.round((currentStats.missRate || 0) * 10) / 10,
      latency: Math.round((currentStats.avgLatency || 0) * 100) / 100,
      color: defaultPerformanceData[selectedStructure].color
    } : defaultPerformanceData[selectedStructure];
  };

  const currentData = getCurrentData();

  // Prepare chart data
  const cacheHitData = [
    { name: 'BST', hitRate: simulationResults.BST?.hitRate || 0, missRate: simulationResults.BST?.missRate || 0 },
    { name: 'Hash', hitRate: simulationResults.Hash?.hitRate || 0, missRate: simulationResults.Hash?.missRate || 0 },
    { name: 'Trie', hitRate: simulationResults.Trie?.hitRate || 0, missRate: simulationResults.Trie?.missRate || 0 }
  ];

  const latencyData = [
    { name: 'BST', latency: simulationResults.BST?.avgLatency || 0 },
    { name: 'Hash', latency: simulationResults.Hash?.avgLatency || 0 },
    { name: 'Trie', latency: simulationResults.Trie?.avgLatency || 0 }
  ];

  const pieData = [
    { name: 'Hit', value: currentData.hitRate, fill: currentData.color },
    { name: 'Miss', value: currentData.missRate, fill: '#e5e7eb' }
  ];

  const workloadData = [
    { workload: 'Small', BST: 0, Hash: 0, Trie: 0 },
    { workload: 'Medium', BST: 0, Hash: 0, Trie: 0 },
    { workload: 'Large', BST: 0, Hash: 0, Trie: 0 }
  ];

  // Run simulation for selected structure
  const runSimulation = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setProgress(0);
    setCurrentStats(null);

    try {
      if (systemAnalysisMode === 'real' && realSimulatorRef.current) {
        // Run real system analysis
        const analysis = await realSimulatorRef.current.runRealSystemAnalysis();
        setRealSystemResults(analysis.structureResults);
        setSystemInfo(analysis.systemInfo);
        
        // Convert real system result to simulation result format for compatibility
        const realResult = analysis.structureResults.find(r => r.structure === selectedStructure);
        if (realResult) {
          const simulationResult: SimulationResult = {
            structure: selectedStructure,
            hitRate: realResult.cacheEfficiency,
            missRate: 100 - realResult.cacheEfficiency,
            avgLatency: realResult.realLatency,
            maxLatency: realResult.realLatency * 1.5,
            minLatency: realResult.realLatency * 0.5,
            throughput: realResult.realThroughput,
            cacheStats: null,
            operationsPerformed: 1000,
            totalTime: 1000 / realResult.realThroughput * 1000
          };
          
          setSimulationResults(prev => ({
            ...prev,
            [selectedStructure]: simulationResult
          }));
        }
      } else if (simulatorRef.current) {
        // Run simulated analysis
        const result = await simulatorRef.current.runRealtimeSimulation(
          selectedStructure,
          workloadSize,
          (progressValue, stats) => {
            setProgress(progressValue);
            setCurrentStats(stats);
          },
          50 // Update every 50 operations
        );

        setSimulationResults(prev => ({
          ...prev,
          [selectedStructure]: result
        }));

        // Get cache stats
        const cacheStatsData = simulatorRef.current.getCacheStats();
        setCacheStats(cacheStatsData);
      }
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  // Run comparative simulation for all structures
  const runComparativeSimulation = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setProgress(0);

    try {
      if (systemAnalysisMode === 'real' && realSimulatorRef.current) {
        // Run real system analysis for all structures
        const analysis = await realSimulatorRef.current.runRealSystemAnalysis();
        setRealSystemResults(analysis.structureResults);
        setSystemInfo(analysis.systemInfo);
        
        // Convert real system results to simulation results format
        const resultMap: Record<StructureType, SimulationResult | null> = {
          BST: null,
          Hash: null,
          Trie: null
        };

        analysis.structureResults.forEach(realResult => {
          const simulationResult: SimulationResult = {
            structure: realResult.structure,
            hitRate: realResult.cacheEfficiency,
            missRate: 100 - realResult.cacheEfficiency,
            avgLatency: realResult.realLatency,
            maxLatency: realResult.realLatency * 1.5,
            minLatency: realResult.realLatency * 0.5,
            throughput: realResult.realThroughput,
            cacheStats: null,
            operationsPerformed: 1000,
            totalTime: 1000 / realResult.realThroughput * 1000
          };
          
          resultMap[realResult.structure] = simulationResult;
        });

        setSimulationResults(resultMap);
      } else if (simulatorRef.current) {
        // Run simulated analysis
        const results = await simulatorRef.current.runComparativeSimulation(workloadSize);
        
        const resultMap: Record<StructureType, SimulationResult | null> = {
          BST: null,
          Hash: null,
          Trie: null
        };

        results.forEach(result => {
          resultMap[result.structure] = result;
        });

        setSimulationResults(resultMap);

        // Get cache stats for current structure
        const cacheStatsData = simulatorRef.current.getCacheStats();
        setCacheStats(cacheStatsData);
      }
    } catch (error) {
      console.error('Comparative simulation error:', error);
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  // Stop simulation
  const stopSimulation = () => {
    if (simulatorRef.current) {
      simulatorRef.current.stopSimulation();
    }
    setIsRunning(false);
  };

  // Reset all data
  const resetSimulation = () => {
    setSimulationResults({
      BST: null,
      Hash: null,
      Trie: null
    });
    setCurrentStats(null);
    setProgress(0);
    setCacheStats(null);
  };

  return (
    <TooltipProvider>
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
                <h1 className="text-3xl text-gray-900">Simulation Dashboard</h1>
                <p className="text-gray-600">Real-time Cache Performance Analysis</p>
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
                onClick={() => onNavigate('performance')}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                Performance
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Controls */}
          <Card className="p-6 rounded-2xl shadow-lg border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-gray-600" />
                  <label className="text-sm">Search Structure:</label>
                </div>
                <Select value={selectedStructure} onValueChange={(value) => setSelectedStructure(value as StructureType)}>
                  <SelectTrigger className="w-[180px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BST">Binary Search Tree</SelectItem>
                    <SelectItem value="Hash">Hash Table</SelectItem>
                    <SelectItem value="Trie">Trie (Prefix Tree)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <label className="text-sm">Mode:</label>
                </div>
                <Select value={systemAnalysisMode} onValueChange={(value) => setSystemAnalysisMode(value as 'simulated' | 'real')}>
                  <SelectTrigger className="w-[140px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simulated">Simulated</SelectItem>
                    <SelectItem value="real">Real System</SelectItem>
                  </SelectContent>
                </Select>

                {systemAnalysisMode === 'simulated' && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Workload:</label>
                    </div>
                    <Select value={workloadSize} onValueChange={(value) => setWorkloadSize(value as WorkloadSize)}>
                      <SelectTrigger className="w-[120px] rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small">Small (1K)</SelectItem>
                        <SelectItem value="Medium">Medium (5K)</SelectItem>
                        <SelectItem value="Large">Large (10K)</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                <Badge 
                  style={{ 
                    backgroundColor: `${currentData.color}20`, 
                    color: currentData.color,
                    border: `1px solid ${currentData.color}40`
                  }}
                >
                  {selectedStructure} Active
                </Badge>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Latency: {currentData.latency}ms
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    Hit Rate: {currentData.hitRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={runSimulation}
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {systemAnalysisMode === 'real' ? 'Analyze System' : 'Run Simulation'}
                </Button>
                <Button 
                  onClick={runComparativeSimulation}
                  disabled={isRunning}
                  variant="outline"
                  className="rounded-xl"
                >
                  Compare All
                </Button>
                <Button 
                  onClick={stopSimulation}
                  disabled={!isRunning}
                  variant="destructive"
                  className="rounded-xl"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
                <Button 
                  onClick={resetSimulation}
                  disabled={isRunning}
                  variant="outline"
                  className="rounded-xl"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              {isRunning && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Progress:</span>
                  <div className="w-32">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                </div>
              )}
            </div>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Charts Section */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="cache-performance" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 rounded-xl bg-white shadow-md">
                  <TabsTrigger value="cache-performance" className="rounded-lg">Cache Performance</TabsTrigger>
                  <TabsTrigger value="latency" className="rounded-lg">Latency Analysis</TabsTrigger>
                  <TabsTrigger value="workload" className="rounded-lg">Workload Impact</TabsTrigger>
                </TabsList>

                <TabsContent value="cache-performance" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hit/Miss Bar Chart */}
                    <Card className="p-6 rounded-2xl shadow-lg border-0">
                      <h3 className="text-lg mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Cache Hit/Miss Rates
                      </h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={cacheHitData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip formatter={(value, name) => [`${Math.round(value * 10) / 10}%`, name]} />
                          <Bar dataKey="hitRate" fill="#22c55e" name="Hit Rate" />
                          <Bar dataKey="missRate" fill="#ef4444" name="Miss Rate" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* Pie Chart */}
                    <Card className="p-6 rounded-2xl shadow-lg border-0">
                      <h3 className="text-lg mb-4">{selectedStructure} Performance</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentData.color }}></div>
                          <span className="text-sm">Hit ({currentData.hitRate}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                          <span className="text-sm">Miss ({currentData.missRate}%)</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="latency">
                  <Card className="p-6 rounded-2xl shadow-lg border-0">
                    <h3 className="text-lg mb-4">Latency Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={latencyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip formatter={(value) => [`${Math.round(value * 100) / 100}ms`, 'Latency']} />
                        <Bar dataKey="latency" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </TabsContent>

                <TabsContent value="workload">
                  <Card className="p-6 rounded-2xl shadow-lg border-0">
                    <h3 className="text-lg mb-4">Latency vs Workload Size</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={workloadData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="workload" />
                        <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                        <Line type="monotone" dataKey="BST" stroke="#22c55e" strokeWidth={2} />
                        <Line type="monotone" dataKey="Hash" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="Trie" stroke="#f97316" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">BST</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Hash Table</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm">Trie</span>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel */}
            <div className="space-y-6">
              {/* Cache Levels */}
              <Card className="p-6 rounded-2xl shadow-lg border-0">
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Cache Levels
                </h3>
                <div className="space-y-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-2 cursor-help">
                        <div className="flex justify-between text-sm">
                          <span>L1 Cache</span>
                          <span className="text-green-600">
                            {cacheStats ? `${Math.round(cacheStats.l1.utilization)}%` : '0%'}
                          </span>
                        </div>
                        <Progress value={cacheStats ? cacheStats.l1.utilization : 0} className="h-2" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>L1 Cache: {cacheStats ? `${Math.round(cacheStats.l1.utilization)}%` : '0%'} utilization, 1-2 cycles</p>
                      {cacheStats && <p>Hits: {cacheStats.l1.hits}, Misses: {cacheStats.l1.misses}</p>}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-2 cursor-help">
                        <div className="flex justify-between text-sm">
                          <span>L2 Cache</span>
                          <span className="text-yellow-600">
                            {cacheStats ? `${Math.round(cacheStats.l2.utilization)}%` : '0%'}
                          </span>
                        </div>
                        <Progress value={cacheStats ? cacheStats.l2.utilization : 0} className="h-2" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>L2 Cache: {cacheStats ? `${Math.round(cacheStats.l2.utilization)}%` : '0%'} utilization, 10-20 cycles</p>
                      {cacheStats && <p>Hits: {cacheStats.l2.hits}, Misses: {cacheStats.l2.misses}</p>}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-2 cursor-help">
                        <div className="flex justify-between text-sm">
                          <span>L3 Cache</span>
                          <span className="text-red-600">
                            {cacheStats ? `${Math.round(cacheStats.l3.utilization)}%` : '0%'}
                          </span>
                        </div>
                        <Progress value={cacheStats ? cacheStats.l3.utilization : 0} className="h-2" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>L3 Cache: {cacheStats ? `${Math.round(cacheStats.l3.utilization)}%` : '0%'} utilization, 40-75 cycles</p>
                      {cacheStats && <p>Hits: {cacheStats.l3.hits}, Misses: {cacheStats.l3.misses}</p>}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </Card>

              {/* Performance Metrics */}
              <Card className="p-6 rounded-2xl shadow-lg border-0">
                <h3 className="text-lg mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm">File Access Latency</span>
                    <Badge variant="secondary">{currentData.latency}ms</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm">Cache Hit Rate</span>
                    <Badge 
                      style={{ 
                        backgroundColor: `${currentData.color}20`, 
                        color: currentData.color 
                      }}
                    >
                      {currentData.hitRate}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm">Miss Penalty</span>
                    <Badge variant="destructive">{currentData.missRate}%</Badge>
                  </div>
                  {simulationResults[selectedStructure] && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm">Throughput</span>
                        <Badge variant="outline">
                          {Math.round(simulationResults[selectedStructure]!.throughput)} ops/sec
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm">Operations</span>
                        <Badge variant="outline">
                          {simulationResults[selectedStructure]!.operationsPerformed}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* System Information */}
              <Card className="p-6 rounded-2xl shadow-lg border-0">
                <h3 className="text-lg mb-4">System Information</h3>
                <div className="space-y-3 text-sm">
                  {systemAnalysisMode === 'real' && systemInfo ? (
                    <>
                      <div className="flex justify-between">
                        <span>Browser:</span>
                        <span>{systemInfo.browser}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OS:</span>
                        <span>{systemInfo.os}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPU Cores:</span>
                        <span>{systemInfo.cpu.cores}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Architecture:</span>
                        <span>{systemInfo.cpu.architecture}</span>
                      </div>
                      {systemInfo.memory.total && (
                        <div className="flex justify-between">
                          <span>Memory:</span>
                          <span>{Math.round(systemInfo.memory.total / (1024 * 1024 * 1024))}GB</span>
                        </div>
                      )}
                      {systemInfo.network.type && (
                        <div className="flex justify-between">
                          <span>Connection:</span>
                          <span>{systemInfo.network.type}</span>
                        </div>
                      )}
                      {systemInfo.network.speed && (
                        <div className="flex justify-between">
                          <span>Bandwidth:</span>
                          <span>{systemInfo.network.speed} Mbps</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>File Records:</span>
                        <span>{simulatorRef.current?.getFileCount() || 10000}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cache Levels:</span>
                        <span>L1/L2/L3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Workload Size:</span>
                        <span>{workloadSize}</span>
                      </div>
                      {simulationResults[selectedStructure] && (
                        <div className="flex justify-between">
                          <span>Total Time:</span>
                          <span>{Math.round(simulationResults[selectedStructure]!.totalTime)}ms</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 rounded-2xl shadow-lg border-0">
                <h3 className="text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl"
                    onClick={() => onNavigate('dataflow')}
                  >
                    View Dataflow
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl"
                    onClick={() => onNavigate('performance')}
                  >
                    Compare Performance
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl"
                    disabled
                  >
                    Export Report
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}