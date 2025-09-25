import { SystemAnalyzer, SystemInfo, RealPerformanceMetrics } from './SystemAnalyzer';
import { BinarySearchTree, HashTable, Trie } from './DataStructures';

export interface RealSystemResult {
  structure: 'BST' | 'Hash' | 'Trie';
  systemInfo: SystemInfo;
  performanceMetrics: RealPerformanceMetrics;
  realLatency: number;
  realThroughput: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheEfficiency: number;
  storagePerformance: number;
  networkLatency?: number;
}

export class RealSystemSimulator {
  private systemAnalyzer: SystemAnalyzer;
  private bst: BinarySearchTree;
  private hashTable: HashTable;
  private trie: Trie;
  private testData: string[] = [];

  constructor() {
    this.systemAnalyzer = new SystemAnalyzer();
    this.bst = new BinarySearchTree();
    this.hashTable = new HashTable();
    this.trie = new Trie();
    this.generateTestData();
  }

  private generateTestData(): void {
    // Generate realistic file paths and keys
    const directories = ['Documents', 'Pictures', 'Videos', 'Downloads', 'System32', 'ProgramFiles'];
    const extensions = ['.txt', '.pdf', '.doc', '.jpg', '.png', '.mp4', '.exe', '.dll'];
    const baseNames = ['report', 'image', 'video', 'config', 'data', 'cache', 'temp', 'backup'];

    for (let i = 0; i < 10000; i++) {
      const dir = directories[Math.floor(Math.random() * directories.length)];
      const base = baseNames[Math.floor(Math.random() * baseNames.length)];
      const ext = extensions[Math.floor(Math.random() * extensions.length)];
      this.testData.push(`/${dir}/${base}_${i}${ext}`);
    }

    // Populate data structures
    this.testData.forEach((path, index) => {
      const data = { path, size: Math.random() * 1000000, index };
      this.bst.insert(path, data);
      this.hashTable.insert(path, data);
      this.trie.insert(path, data);
    });
  }

  async runRealSystemAnalysis(): Promise<{
    systemInfo: SystemInfo;
    performanceMetrics: RealPerformanceMetrics;
    structureResults: RealSystemResult[];
  }> {
    // Get system information
    const systemInfo = await this.systemAnalyzer.getSystemInfo();
    
    // Run performance benchmarks
    const performanceMetrics = await this.systemAnalyzer.runPerformanceBenchmarks();
    
    // Test each data structure with real system constraints
    const structureResults: RealSystemResult[] = [];
    
    for (const structure of ['BST', 'Hash', 'Trie'] as const) {
      const result = await this.analyzeStructurePerformance(structure, systemInfo, performanceMetrics);
      structureResults.push(result);
    }

    return {
      systemInfo,
      performanceMetrics,
      structureResults
    };
  }

  private async analyzeStructurePerformance(
    structure: 'BST' | 'Hash' | 'Trie',
    systemInfo: SystemInfo,
    performanceMetrics: RealPerformanceMetrics
  ): Promise<RealSystemResult> {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();
    
    // Perform actual operations on the data structure
    const operations = this.generateRealisticOperations(1000);
    let successfulOperations = 0;
    const latencies: number[] = [];

    for (const operation of operations) {
      const opStart = performance.now();
      
      try {
        const result = this.performOperation(structure, operation);
        if (result.found) {
          successfulOperations++;
        }
        
        const opEnd = performance.now();
        latencies.push(opEnd - opStart);
      } catch (error) {
        console.warn(`Operation failed for ${structure}:`, error);
      }
    }

    const endTime = performance.now();
    const endMemory = this.getCurrentMemoryUsage();
    
    const totalTime = endTime - startTime;
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const throughput = operations.length / (totalTime / 1000); // operations per second
    const memoryUsed = endMemory - startMemory;

    // Calculate cache efficiency based on system performance
    const cacheEfficiency = this.calculateCacheEfficiency(structure, performanceMetrics);
    
    // Calculate storage performance impact
    const storagePerformance = this.calculateStoragePerformance(structure, performanceMetrics);
    
    // Estimate CPU usage based on computation performance
    const cpuUsage = this.estimateCPUUsage(structure, performanceMetrics, avgLatency);

    return {
      structure,
      systemInfo,
      performanceMetrics,
      realLatency: avgLatency,
      realThroughput: throughput,
      memoryUsage: memoryUsed,
      cpuUsage,
      cacheEfficiency,
      storagePerformance,
      networkLatency: performanceMetrics.networkPerformance?.latency
    };
  }

  private generateRealisticOperations(count: number): string[] {
    const operations: string[] = [];
    
    // 80/20 rule: 80% of operations on 20% of data (hot data)
    const hotData = this.testData.slice(0, Math.floor(this.testData.length * 0.2));
    const coldData = this.testData.slice(Math.floor(this.testData.length * 0.2));

    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.8) {
        // Hot data access
        operations.push(hotData[Math.floor(Math.random() * hotData.length)]);
      } else {
        // Cold data access
        operations.push(coldData[Math.floor(Math.random() * coldData.length)]);
      }
    }

    return operations;
  }

  private performOperation(structure: 'BST' | 'Hash' | 'Trie', key: string): { found: boolean; value: any } {
    switch (structure) {
      case 'BST':
        const bstResult = this.bst.search(key);
        return { found: bstResult.found, value: bstResult.value };
      case 'Hash':
        const hashResult = this.hashTable.search(key);
        return { found: hashResult.found, value: hashResult.value };
      case 'Trie':
        const trieResult = this.trie.search(key);
        return { found: trieResult.found, value: trieResult.value };
      default:
        throw new Error(`Unknown structure: ${structure}`);
    }
  }

  private getCurrentMemoryUsage(): number {
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private calculateCacheEfficiency(structure: 'BST' | 'Hash' | 'Trie', metrics: RealPerformanceMetrics): number {
    // Base cache efficiency on memory access patterns and structure characteristics
    const memoryAccessTime = metrics.memoryPerformance.access;
    
    let baseEfficiency: number;
    switch (structure) {
      case 'Hash':
        // Hash tables have good cache locality for direct access
        baseEfficiency = 85;
        break;
      case 'BST':
        // BSTs have moderate cache locality due to tree traversal
        baseEfficiency = 72;
        break;
      case 'Trie':
        // Tries have good cache locality for prefix-based access
        baseEfficiency = 78;
        break;
    }

    // Adjust based on actual memory performance
    const memoryFactor = Math.max(0.5, Math.min(1.5, 100 / memoryAccessTime));
    return Math.min(95, baseEfficiency * memoryFactor);
  }

  private calculateStoragePerformance(structure: 'BST' | 'Hash' | 'Trie', metrics: RealPerformanceMetrics): number {
    // Factor in storage performance from actual tests
    const storageScore = (
      100 / Math.max(1, metrics.storagePerformance.localStorage) +
      100 / Math.max(1, metrics.storagePerformance.indexedDB) +
      100 / Math.max(1, metrics.storagePerformance.cacheAPI)
    ) / 3;

    // Adjust based on structure characteristics
    let structureFactor: number;
    switch (structure) {
      case 'Hash':
        structureFactor = 1.2; // Hash tables work well with storage
        break;
      case 'Trie':
        structureFactor = 1.0; // Tries are neutral
        break;
      case 'BST':
        structureFactor = 0.9; // BSTs have some storage overhead
        break;
    }

    return Math.min(100, storageScore * structureFactor);
  }

  private estimateCPUUsage(structure: 'BST' | 'Hash' | 'Trie', metrics: RealPerformanceMetrics, latency: number): number {
    // Base CPU usage estimation on computation performance and actual latency
    const computationTime = metrics.computationPerformance.singleThread;
    
    // Calculate relative CPU usage
    let baseCPU: number;
    switch (structure) {
      case 'Hash':
        baseCPU = 15; // Low CPU usage
        break;
      case 'BST':
        baseCPU = 25; // Moderate CPU usage
        break;
      case 'Trie':
        baseCPU = 20; // Moderate CPU usage
        break;
    }

    // Adjust based on actual performance
    const latencyFactor = Math.min(2, latency / 10); // Normalize latency
    const computationFactor = Math.min(2, computationTime / 1000); // Normalize computation time
    
    return Math.min(100, baseCPU * latencyFactor * computationFactor);
  }

  // Real-time monitoring
  async startRealTimeMonitoring(
    structure: 'BST' | 'Hash' | 'Trie',
    onUpdate: (metrics: Partial<RealSystemResult>) => void,
    intervalMs: number = 1000
  ): Promise<() => void> {
    let isRunning = true;
    
    const monitor = async () => {
      while (isRunning) {
        const currentMetrics = this.systemAnalyzer.getPerformanceMetrics();
        const memoryUsage = this.getCurrentMemoryUsage();
        
        // Perform a small test operation
        const testKey = this.testData[Math.floor(Math.random() * this.testData.length)];
        const opStart = performance.now();
        this.performOperation(structure, testKey);
        const opLatency = performance.now() - opStart;
        
        onUpdate({
          realLatency: opLatency,
          memoryUsage,
          networkLatency: currentMetrics.connection?.rtt,
        });
        
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    };

    monitor();
    
    return () => {
      isRunning = false;
    };
  }

  // Test file system performance (requires user permission)
  async testFileSystemPerformance(): Promise<{ read: number; write: number; supported: boolean }> {
    return await this.systemAnalyzer.testFileSystemPerformance();
  }

  // Get detailed system information
  async getDetailedSystemInfo(): Promise<{
    browser: string;
    os: string;
    cpu: {
      cores: number;
      architecture: string;
    };
    memory: {
      total?: number;
      available?: number;
    };
    storage: {
      quota?: number;
      usage?: number;
    };
    network: {
      type?: string;
      speed?: number;
      latency?: number;
    };
  }> {
    const systemInfo = await this.systemAnalyzer.getSystemInfo();
    
    // Parse user agent for browser and OS info
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Get storage quota if available
    let storageQuota, storageUsage;
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        storageQuota = estimate.quota;
        storageUsage = estimate.usage;
      } catch (error) {
        console.warn('Storage estimate failed:', error);
      }
    }

    return {
      browser,
      os,
      cpu: {
        cores: systemInfo.hardwareConcurrency,
        architecture: systemInfo.platform
      },
      memory: {
        total: systemInfo.memory?.total,
        available: systemInfo.memory?.available
      },
      storage: {
        quota: storageQuota,
        usage: storageUsage
      },
      network: {
        type: systemInfo.connection?.effectiveType,
        speed: systemInfo.connection?.downlink,
        latency: systemInfo.connection?.rtt
      }
    };
  }
}