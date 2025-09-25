import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { PageType } from '../App';
import { ArrowLeft, Monitor, Cpu, HardDrive, Wifi, AlertCircle, CheckCircle, Play, Square } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip, Legend } from 'recharts';
import { RealSystemSimulator, RealSystemResult } from './simulation/RealSystemSimulator';

interface RealSystemAnalysisProps {
  onNavigate: (page: PageType) => void;
}

export function RealSystemAnalysis({ onNavigate }: RealSystemAnalysisProps) {
  const [simulator] = useState(() => new RealSystemSimulator());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<RealSystemResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentBenchmark, setCurrentBenchmark] = useState('');
  const [fileSystemSupported, setFileSystemSupported] = useState(false);
  const [fileSystemResults, setFileSystemResults] = useState<any>(null);

  useEffect(() => {
    loadSystemInfo();
    checkFileSystemSupport();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const info = await simulator.getDetailedSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  const checkFileSystemSupport = () => {
    setFileSystemSupported('showDirectoryPicker' in window);
  };

  const runSystemAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setCurrentBenchmark('Initializing system analysis...');

    try {
      // Phase 1: System Information (10%)
      setCurrentBenchmark('Gathering system information...');
      const systemData = await simulator.getDetailedSystemInfo();
      setSystemInfo(systemData);
      setProgress(10);

      // Phase 2: Performance Benchmarks (50%)
      setCurrentBenchmark('Running performance benchmarks...');
      const analysis = await simulator.runRealSystemAnalysis();
      setPerformanceMetrics(analysis.performanceMetrics);
      setProgress(60);

      // Phase 3: Data Structure Analysis (30%)
      setCurrentBenchmark('Analyzing data structure performance...');
      setAnalysisResults(analysis.structureResults);
      setProgress(90);

      // Phase 4: Complete (10%)
      setCurrentBenchmark('Analysis complete!');
      setProgress(100);

    } catch (error) {
      console.error('System analysis failed:', error);
      setCurrentBenchmark('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runFileSystemTest = async () => {
    if (!fileSystemSupported) return;

    try {
      const results = await simulator.testFileSystemPerformance();
      setFileSystemResults(results);
    } catch (error) {
      console.error('File system test failed:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceColor = (value: number, max: number): string => {
    const ratio = value / max;
    if (ratio > 0.8) return '#ef4444'; // red
    if (ratio > 0.5) return '#f97316'; // orange
    return '#22c55e'; // green
  };

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
              <h1 className="text-3xl text-gray-900">Real System Analysis</h1>
              <p className="text-gray-600">Analyze your actual system performance</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => onNavigate('simulation')}
              className="rounded-xl border-gray-300"
            >
              Back to Simulation
            </Button>
            <Button 
              onClick={runSystemAnalysis}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              {isAnalyzing ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Browser Capabilities Alert */}
        <Alert className="rounded-xl border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Browser-Based Analysis:</strong> This analysis measures your browser's JavaScript performance and available Web APIs. 
            For deeper system analysis, consider running native benchmarking tools.
          </AlertDescription>
        </Alert>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card className="p-6 rounded-2xl shadow-lg border-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">System Analysis in Progress</h3>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-gray-600">{currentBenchmark}</p>
            </div>
          </Card>
        )}

        {/* System Information */}
        {systemInfo && (
          <Card className="p-6 rounded-2xl shadow-lg border-0">
            <h2 className="text-2xl mb-6 flex items-center gap-2">
              <Monitor className="w-6 h-6" />
              System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Browser & OS
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Browser:</span>
                    <Badge variant="outline">{systemInfo.browser}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating System:</span>
                    <Badge variant="outline">{systemInfo.os}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  CPU
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cores:</span>
                    <Badge variant="outline">{systemInfo.cpu.cores}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Architecture:</span>
                    <Badge variant="outline">{systemInfo.cpu.architecture}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Memory & Storage
                </h4>
                <div className="space-y-2 text-sm">
                  {systemInfo.memory.total && (
                    <div className="flex justify-between">
                      <span>Memory:</span>
                      <Badge variant="outline">{formatBytes(systemInfo.memory.total)}</Badge>
                    </div>
                  )}
                  {systemInfo.storage.quota && (
                    <div className="flex justify-between">
                      <span>Storage Quota:</span>
                      <Badge variant="outline">{formatBytes(systemInfo.storage.quota)}</Badge>
                    </div>
                  )}
                  {systemInfo.storage.usage && (
                    <div className="flex justify-between">
                      <span>Storage Used:</span>
                      <Badge variant="outline">{formatBytes(systemInfo.storage.usage)}</Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Network
                </h4>
                <div className="space-y-2 text-sm">
                  {systemInfo.network.type && (
                    <div className="flex justify-between">
                      <span>Connection:</span>
                      <Badge variant="outline">{systemInfo.network.type}</Badge>
                    </div>
                  )}
                  {systemInfo.network.speed && (
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <Badge variant="outline">{systemInfo.network.speed} Mbps</Badge>
                    </div>
                  )}
                  {systemInfo.network.latency && (
                    <div className="flex justify-between">
                      <span>Latency:</span>
                      <Badge variant="outline">{systemInfo.network.latency}ms</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Performance Benchmarks */}
        {performanceMetrics && (
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 rounded-xl bg-white shadow-md">
              <TabsTrigger value="performance" className="rounded-lg">Performance Tests</TabsTrigger>
              <TabsTrigger value="structures" className="rounded-lg">Data Structures</TabsTrigger>
              <TabsTrigger value="comparison" className="rounded-lg">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Memory Performance */}
                <Card className="p-6 rounded-2xl shadow-lg border-0">
                  <h3 className="text-lg mb-4">Memory Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm">Allocation Speed</span>
                      <Badge style={{ color: getPerformanceColor(performanceMetrics.memoryPerformance.allocation, 100) }}>
                        {formatTime(performanceMetrics.memoryPerformance.allocation)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm">Access Speed</span>
                      <Badge style={{ color: getPerformanceColor(performanceMetrics.memoryPerformance.access, 100) }}>
                        {formatTime(performanceMetrics.memoryPerformance.access)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm">Garbage Collection</span>
                      <Badge style={{ color: getPerformanceColor(performanceMetrics.memoryPerformance.gc, 50) }}>
                        {formatTime(performanceMetrics.memoryPerformance.gc)}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Storage Performance */}
                <Card className="p-6 rounded-2xl shadow-lg border-0">
                  <h3 className="text-lg mb-4">Storage Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm">LocalStorage</span>
                      <Badge style={{ color: getPerformanceColor(performanceMetrics.storagePerformance.localStorage, 100) }}>
                        {formatTime(performanceMetrics.storagePerformance.localStorage)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm">IndexedDB</span>
                      <Badge style={{ color: getPerformanceColor(performanceMetrics.storagePerformance.indexedDB, 100) }}>
                        {formatTime(performanceMetrics.storagePerformance.indexedDB)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm">Cache API</span>
                      <Badge style={{ color: getPerformanceColor(performanceMetrics.storagePerformance.cacheAPI, 100) }}>
                        {formatTime(performanceMetrics.storagePerformance.cacheAPI)}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Computation Performance */}
                <Card className="p-6 rounded-2xl shadow-lg border-0">
                  <h3 className="text-lg mb-4">Computation Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm">Single Thread</span>
                      <Badge style={{ color: getPerformanceColor(performanceMetrics.computationPerformance.singleThread, 1000) }}>
                        {formatTime(performanceMetrics.computationPerformance.singleThread)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm">Multi Thread</span>
                      <Badge style={{ color: getPerformanceColor(performanceMetrics.computationPerformance.multiThread, 1000) }}>
                        {formatTime(performanceMetrics.computationPerformance.multiThread)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm">Cryptographic</span>
                      <Badge style={{ color: getPerformanceColor(performanceMetrics.computationPerformance.cryptographic, 1000) }}>
                        {formatTime(performanceMetrics.computationPerformance.cryptographic)}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Network Performance */}
                {performanceMetrics.networkPerformance && (
                  <Card className="p-6 rounded-2xl shadow-lg border-0">
                    <h3 className="text-lg mb-4">Network Performance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm">Latency</span>
                        <Badge style={{ color: getPerformanceColor(performanceMetrics.networkPerformance.latency, 100) }}>
                          {formatTime(performanceMetrics.networkPerformance.latency)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm">Bandwidth</span>
                        <Badge variant="outline">
                          {(performanceMetrics.networkPerformance.bandwidth / 1000000).toFixed(1)} Mbps
                        </Badge>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="structures">
              {analysisResults.length > 0 && (
                <div className="space-y-6">
                  {analysisResults.map((result) => (
                    <Card key={result.structure} className="p-6 rounded-2xl shadow-lg border-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ 
                            backgroundColor: result.structure === 'BST' ? '#22c55e' : 
                                           result.structure === 'Hash' ? '#3b82f6' : '#f97316' 
                          }}></div>
                          {result.structure === 'BST' ? 'Binary Search Tree' : 
                           result.structure === 'Hash' ? 'Hash Table' : 'Trie'}
                        </h3>
                        <Badge style={{ 
                          backgroundColor: `${result.structure === 'BST' ? '#22c55e' : 
                                           result.structure === 'Hash' ? '#3b82f6' : '#f97316'}20`,
                          color: result.structure === 'BST' ? '#22c55e' : 
                                result.structure === 'Hash' ? '#3b82f6' : '#f97316'
                        }}>
                          {result.cacheEfficiency.toFixed(1)}% Efficiency
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Latency</p>
                          <p className="text-lg">{formatTime(result.realLatency)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Throughput</p>
                          <p className="text-lg">{Math.round(result.realThroughput)} ops/s</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Memory Usage</p>
                          <p className="text-lg">{formatBytes(result.memoryUsage)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">CPU Usage</p>
                          <p className="text-lg">{result.cpuUsage.toFixed(1)}%</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="comparison">
              {analysisResults.length > 0 && (
                <Card className="p-8 rounded-2xl shadow-lg border-0">
                  <h2 className="text-2xl mb-6">Performance Comparison</h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analysisResults}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="structure" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="realLatency" fill="#8884d8" name="Latency (ms)" />
                      <Bar dataKey="realThroughput" fill="#82ca9d" name="Throughput (ops/s)" />
                      <Bar dataKey="cacheEfficiency" fill="#ffc658" name="Cache Efficiency %" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* File System Access Test */}
        <Card className="p-6 rounded-2xl shadow-lg border-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg">File System Access Test</h3>
            {fileSystemSupported ? (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Supported
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Not Supported
              </Badge>
            )}
          </div>
          
          {fileSystemSupported ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Test real file system read/write performance using the File System Access API.
                This requires user permission to access a directory.
              </p>
              <Button 
                onClick={runFileSystemTest}
                variant="outline"
                className="rounded-xl"
              >
                Test File System Performance
              </Button>
              
              {fileSystemResults && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium mb-2">File System Test Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Write Performance:</span>
                      <span className="ml-2">{formatTime(fileSystemResults.write)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Read Performance:</span>
                      <span className="ml-2">{formatTime(fileSystemResults.read)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                File System Access API is not supported in your browser. 
                This feature requires Chrome 86+ or other Chromium-based browsers.
              </p>
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To enable file system testing, use Chrome/Edge and enable the "Experimental Web Platform features" flag.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}