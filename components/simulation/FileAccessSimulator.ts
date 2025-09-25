import { BinarySearchTree, HashTable, Trie } from './DataStructures';
import { MultiLevelCache } from './CacheSimulator';

export type StructureType = 'BST' | 'Hash' | 'Trie';
export type WorkloadSize = 'Small' | 'Medium' | 'Large';

export interface FileRecord {
  filename: string;
  path: string;
  size: number;
  extension: string;
  lastModified: Date;
}

export interface SimulationResult {
  structure: StructureType;
  hitRate: number;
  missRate: number;
  avgLatency: number;
  maxLatency: number;
  minLatency: number;
  throughput: number;
  cacheStats: any;
  operationsPerformed: number;
  totalTime: number;
}

export class FileAccessSimulator {
  private bst: BinarySearchTree;
  private hashTable: HashTable;
  private trie: Trie;
  private cache: MultiLevelCache;
  private fileRecords: FileRecord[] = [];
  private isRunning: boolean = false;

  constructor() {
    this.bst = new BinarySearchTree();
    this.hashTable = new HashTable(1000);
    this.trie = new Trie();
    this.cache = new MultiLevelCache();
    
    this.generateFileRecords();
    this.populateDataStructures();
  }

  private generateFileRecords(): void {
    const extensions = ['.txt', '.pdf', '.doc', '.jpg', '.png', '.mp4', '.exe', '.zip'];
    const directories = ['Documents', 'Pictures', 'Videos', 'Downloads', 'System', 'Program Files'];
    const baseNames = [
      'report', 'presentation', 'image', 'video', 'backup', 'config', 'data', 'log',
      'temp', 'cache', 'index', 'main', 'test', 'demo', 'sample', 'archive'
    ];

    // Generate 10000 file records
    for (let i = 0; i < 10000; i++) {
      const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
      const extension = extensions[Math.floor(Math.random() * extensions.length)];
      const directory = directories[Math.floor(Math.random() * directories.length)];
      const filename = `${baseName}_${i}${extension}`;
      
      this.fileRecords.push({
        filename,
        path: `/${directory}/${filename}`,
        size: Math.floor(Math.random() * 1000000) + 1024, // 1KB to 1MB
        extension,
        lastModified: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      });
    }
  }

  private populateDataStructures(): void {
    // Populate all data structures with file records
    for (const record of this.fileRecords) {
      this.bst.insert(record.path, record);
      this.hashTable.insert(record.path, record);
      this.trie.insert(record.path, record);
    }
  }

  async runSimulation(
    structure: StructureType, 
    workloadSize: WorkloadSize,
    duration: number = 10000 // milliseconds
  ): Promise<SimulationResult> {
    this.isRunning = true;
    this.cache.reset();

    const operationCount = this.getOperationCount(workloadSize);
    const operations: string[] = this.generateOperations(operationCount);
    const latencies: number[] = [];
    
    let hits = 0;
    let misses = 0;
    const startTime = performance.now();

    for (let i = 0; i < operations.length && this.isRunning; i++) {
      const operation = operations[i];
      
      // First check cache
      const cacheResult = this.cache.get(operation);
      
      if (cacheResult.hit) {
        hits++;
        latencies.push(cacheResult.totalLatency);
      } else {
        // Cache miss - search in data structure
        const structureResult = await this.searchInStructure(structure, operation);
        misses++;
        
        if (structureResult.found) {
          // Add to cache
          this.cache.put(operation, structureResult.value);
        }
        
        const totalLatency = cacheResult.totalLatency + structureResult.latency;
        latencies.push(totalLatency);
      }

      // Simulate some processing time
      if (i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const totalOperations = hits + misses;

    return {
      structure,
      hitRate: totalOperations > 0 ? (hits / totalOperations) * 100 : 0,
      missRate: totalOperations > 0 ? (misses / totalOperations) * 100 : 0,
      avgLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      maxLatency: latencies.length > 0 ? Math.max(...latencies) : 0,
      minLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
      throughput: totalTime > 0 ? (totalOperations / totalTime) * 1000 : 0, // operations per second
      cacheStats: this.cache.getOverallStats(),
      operationsPerformed: totalOperations,
      totalTime
    };
  }

  private getOperationCount(workloadSize: WorkloadSize): number {
    switch (workloadSize) {
      case 'Small': return 1000;
      case 'Medium': return 5000;
      case 'Large': return 10000;
      default: return 1000;
    }
  }

  private generateOperations(count: number): string[] {
    const operations: string[] = [];
    
    // Generate operations with some files being accessed more frequently (80/20 rule)
    const popularFiles = this.fileRecords.slice(0, Math.floor(this.fileRecords.length * 0.2));
    const regularFiles = this.fileRecords.slice(Math.floor(this.fileRecords.length * 0.2));

    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.8) {
        // 80% chance to access popular files
        const file = popularFiles[Math.floor(Math.random() * popularFiles.length)];
        operations.push(file.path);
      } else {
        // 20% chance to access other files
        const file = regularFiles[Math.floor(Math.random() * regularFiles.length)];
        operations.push(file.path);
      }
    }

    return operations;
  }

  private async searchInStructure(structure: StructureType, key: string): Promise<any> {
    switch (structure) {
      case 'BST':
        return this.bst.search(key);
      case 'Hash':
        return this.hashTable.search(key);
      case 'Trie':
        return this.trie.search(key);
      default:
        throw new Error(`Unknown structure: ${structure}`);
    }
  }

  stopSimulation(): void {
    this.isRunning = false;
  }

  getDataStructureStats() {
    return {
      BST: this.bst.getStats(),
      Hash: this.hashTable.getStats(),
      Trie: this.trie.getStats()
    };
  }

  getCacheStats() {
    return this.cache.getOverallStats();
  }

  getFileCount(): number {
    return this.fileRecords.length;
  }

  // Generate comparative data for multiple structures
  async runComparativeSimulation(workloadSize: WorkloadSize): Promise<SimulationResult[]> {
    const structures: StructureType[] = ['BST', 'Hash', 'Trie'];
    const results: SimulationResult[] = [];

    for (const structure of structures) {
      const result = await this.runSimulation(structure, workloadSize);
      results.push(result);
      
      // Small delay between simulations
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  // Real-time simulation with callbacks
  async runRealtimeSimulation(
    structure: StructureType,
    workloadSize: WorkloadSize,
    onUpdate: (progress: number, currentStats: Partial<SimulationResult>) => void,
    updateInterval: number = 100
  ): Promise<SimulationResult> {
    this.isRunning = true;
    this.cache.reset();

    const operationCount = this.getOperationCount(workloadSize);
    const operations: string[] = this.generateOperations(operationCount);
    const latencies: number[] = [];
    
    let hits = 0;
    let misses = 0;
    const startTime = performance.now();

    for (let i = 0; i < operations.length && this.isRunning; i++) {
      const operation = operations[i];
      
      // First check cache
      const cacheResult = this.cache.get(operation);
      
      if (cacheResult.hit) {
        hits++;
        latencies.push(cacheResult.totalLatency);
      } else {
        // Cache miss - search in data structure
        const structureResult = await this.searchInStructure(structure, operation);
        misses++;
        
        if (structureResult.found) {
          this.cache.put(operation, structureResult.value);
        }
        
        const totalLatency = cacheResult.totalLatency + structureResult.latency;
        latencies.push(totalLatency);
      }

      // Update progress periodically
      if (i % updateInterval === 0) {
        const progress = (i / operations.length) * 100;
        const totalOperations = hits + misses;
        const currentTime = performance.now();
        
        onUpdate(progress, {
          structure,
          hitRate: totalOperations > 0 ? (hits / totalOperations) * 100 : 0,
          missRate: totalOperations > 0 ? (misses / totalOperations) * 100 : 0,
          avgLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
          throughput: (currentTime - startTime) > 0 ? (totalOperations / (currentTime - startTime)) * 1000 : 0,
          operationsPerformed: totalOperations
        });
        
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const totalOperations = hits + misses;

    return {
      structure,
      hitRate: totalOperations > 0 ? (hits / totalOperations) * 100 : 0,
      missRate: totalOperations > 0 ? (misses / totalOperations) * 100 : 0,
      avgLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      maxLatency: latencies.length > 0 ? Math.max(...latencies) : 0,
      minLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
      throughput: totalTime > 0 ? (totalOperations / totalTime) * 1000 : 0,
      cacheStats: this.cache.getOverallStats(),
      operationsPerformed: totalOperations,
      totalTime
    };
  }
}