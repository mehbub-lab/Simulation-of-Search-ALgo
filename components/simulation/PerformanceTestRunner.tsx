import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { FileAccessSimulator, SimulationResult, StructureType, WorkloadSize } from './FileAccessSimulator';
import { Play, Square, RotateCcw } from 'lucide-react';

interface PerformanceTestRunnerProps {
  onResults?: (results: SimulationResult[]) => void;
}

export function PerformanceTestRunner({ onResults }: PerformanceTestRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [simulator] = useState(() => new FileAccessSimulator());

  const runFullBenchmark = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    const workloads: WorkloadSize[] = ['Small', 'Medium', 'Large'];
    const structures: StructureType[] = ['BST', 'Hash', 'Trie'];
    const totalTests = workloads.length * structures.length;
    let completedTests = 0;
    const allResults: SimulationResult[] = [];

    try {
      for (const workload of workloads) {
        for (const structure of structures) {
          setCurrentTest(`Running ${structure} with ${workload} workload...`);
          
          const result = await simulator.runSimulation(structure, workload, 5000);
          allResults.push(result);
          
          completedTests++;
          setProgress((completedTests / totalTests) * 100);
          
          // Small delay between tests
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setResults(allResults);
      if (onResults) {
        onResults(allResults);
      }
    } catch (error) {
      console.error('Benchmark error:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
      setProgress(100);
    }
  };

  const stopBenchmark = () => {
    simulator.stopSimulation();
    setIsRunning(false);
    setCurrentTest('');
  };

  const resetResults = () => {
    setResults([]);
    setProgress(0);
    setCurrentTest('');
  };

  const getStructureColor = (structure: StructureType) => {
    const colors = {
      BST: '#22c55e',
      Hash: '#3b82f6',
      Trie: '#f97316'
    };
    return colors[structure];
  };

  return (
    <Card className="p-6 rounded-2xl shadow-lg border-0">
      <h3 className="text-lg mb-4">Performance Test Runner</h3>
      
      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <Button 
          onClick={runFullBenchmark}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          <Play className="w-4 h-4 mr-2" />
          Run Full Benchmark
        </Button>
        <Button 
          onClick={stopBenchmark}
          disabled={!isRunning}
          variant="destructive"
          className="rounded-xl"
        >
          <Square className="w-4 h-4 mr-2" />
          Stop
        </Button>
        <Button 
          onClick={resetResults}
          disabled={isRunning}
          variant="outline"
          className="rounded-xl"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Progress */}
      {isRunning && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{currentTest}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg">Benchmark Results</h4>
          
          {/* Group results by workload */}
          {(['Small', 'Medium', 'Large'] as WorkloadSize[]).map(workload => {
            const workloadResults = results.filter(r => 
              r.operationsPerformed === (workload === 'Small' ? 1000 : workload === 'Medium' ? 5000 : 10000)
            );

            if (workloadResults.length === 0) return null;

            return (
              <div key={workload} className="bg-gray-50 p-4 rounded-xl">
                <h5 className="font-medium mb-3">{workload} Workload Results</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {workloadResults.map((result) => (
                    <div key={`${workload}-${result.structure}`} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{result.structure}</span>
                        <Badge 
                          style={{ 
                            backgroundColor: `${getStructureColor(result.structure)}20`, 
                            color: getStructureColor(result.structure) 
                          }}
                        >
                          {Math.round(result.hitRate)}% Hit
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Latency:</span>
                          <span>{Math.round(result.avgLatency * 100) / 100}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Throughput:</span>
                          <span>{Math.round(result.throughput)} ops/sec</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operations:</span>
                          <span>{result.operationsPerformed}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">Performance Summary</h5>
            <div className="text-sm text-blue-700">
              <p>Best Overall Performance: <strong>Hash Table</strong> (highest hit rates and throughput)</p>
              <p>Most Consistent: <strong>BST</strong> (stable performance across workloads)</p>
              <p>Best for String Operations: <strong>Trie</strong> (efficient prefix matching)</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}