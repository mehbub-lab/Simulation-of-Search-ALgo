// System analyzer that interfaces with actual browser/system APIs
export interface SystemInfo {
  platform: string;
  userAgent: string;
  hardwareConcurrency: number;
  memory?: {
    total: number;
    used: number;
    available: number;
  };
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  performance: {
    navigation: PerformanceNavigationTiming;
    memory?: any;
  };
}

export interface RealPerformanceMetrics {
  memoryPerformance: {
    allocation: number;
    gc: number;
    access: number;
  };
  storagePerformance: {
    localStorage: number;
    indexedDB: number;
    cacheAPI: number;
  };
  computationPerformance: {
    singleThread: number;
    multiThread: number;
    cryptographic: number;
  };
  networkPerformance?: {
    latency: number;
    bandwidth: number;
    packetLoss: number;
  };
}

export class SystemAnalyzer {
  private systemInfo: SystemInfo | null = null;
  private performanceMetrics: RealPerformanceMetrics | null = null;

  async getSystemInfo(): Promise<SystemInfo> {
    if (this.systemInfo) {
      return this.systemInfo;
    }

    const info: SystemInfo = {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      performance: {
        navigation: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
        memory: (performance as any).memory
      }
    };

    // Get memory information (Chrome only)
    if ((navigator as any).deviceMemory) {
      info.memory = {
        total: (navigator as any).deviceMemory * 1024 * 1024 * 1024, // Convert GB to bytes
        used: 0,
        available: (navigator as any).deviceMemory * 1024 * 1024 * 1024
      };
    }

    // Get connection information
    if ((navigator as any).connection) {
      const conn = (navigator as any).connection;
      info.connection = {
        effectiveType: conn.effectiveType || 'unknown',
        downlink: conn.downlink || 0,
        rtt: conn.rtt || 0
      };
    }

    this.systemInfo = info;
    return info;
  }

  async runPerformanceBenchmarks(): Promise<RealPerformanceMetrics> {
    const metrics: RealPerformanceMetrics = {
      memoryPerformance: await this.testMemoryPerformance(),
      storagePerformance: await this.testStoragePerformance(),
      computationPerformance: await this.testComputationPerformance(),
      networkPerformance: await this.testNetworkPerformance()
    };

    this.performanceMetrics = metrics;
    return metrics;
  }

  private async testMemoryPerformance(): Promise<{ allocation: number; gc: number; access: number }> {
    // Test memory allocation speed
    const allocationStart = performance.now();
    const arrays: number[][] = [];
    for (let i = 0; i < 1000; i++) {
      arrays.push(new Array(1000).fill(Math.random()));
    }
    const allocationEnd = performance.now();

    // Test memory access speed
    const accessStart = performance.now();
    let sum = 0;
    for (const array of arrays) {
      for (const value of array) {
        sum += value;
      }
    }
    const accessEnd = performance.now();

    // Force garbage collection if available
    const gcStart = performance.now();
    if ((window as any).gc) {
      (window as any).gc();
    } else {
      // Trigger GC through memory pressure
      const tempArrays = [];
      for (let i = 0; i < 100; i++) {
        tempArrays.push(new Array(10000).fill(Math.random()));
      }
      tempArrays.length = 0;
    }
    const gcEnd = performance.now();

    return {
      allocation: allocationEnd - allocationStart,
      gc: gcEnd - gcStart,
      access: accessEnd - accessStart
    };
  }

  private async testStoragePerformance(): Promise<{ localStorage: number; indexedDB: number; cacheAPI: number }> {
    // Test localStorage performance
    const localStorageTime = await this.testLocalStorage();
    
    // Test IndexedDB performance
    const indexedDBTime = await this.testIndexedDB();
    
    // Test Cache API performance
    const cacheTime = await this.testCacheAPI();

    return {
      localStorage: localStorageTime,
      indexedDB: indexedDBTime,
      cacheAPI: cacheTime
    };
  }

  private async testLocalStorage(): Promise<number> {
    const start = performance.now();
    const testData = 'x'.repeat(1000); // 1KB string
    
    try {
      for (let i = 0; i < 100; i++) {
        localStorage.setItem(`test_${i}`, testData);
        localStorage.getItem(`test_${i}`);
      }
      
      // Cleanup
      for (let i = 0; i < 100; i++) {
        localStorage.removeItem(`test_${i}`);
      }
    } catch (error) {
      console.warn('localStorage test failed:', error);
    }
    
    return performance.now() - start;
  }

  private async testIndexedDB(): Promise<number> {
    return new Promise((resolve) => {
      const start = performance.now();
      
      try {
        const request = indexedDB.open('performance_test', 1);
        
        request.onerror = () => {
          resolve(performance.now() - start);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const objectStore = db.createObjectStore('test', { keyPath: 'id' });
        };
        
        request.onsuccess = async (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['test'], 'readwrite');
          const objectStore = transaction.objectStore('test');
          
          // Write test
          for (let i = 0; i < 100; i++) {
            objectStore.add({ id: i, data: 'x'.repeat(1000) });
          }
          
          transaction.oncomplete = () => {
            // Read test
            const readTransaction = db.transaction(['test'], 'readonly');
            const readObjectStore = readTransaction.objectStore('test');
            
            for (let i = 0; i < 100; i++) {
              readObjectStore.get(i);
            }
            
            readTransaction.oncomplete = () => {
              db.close();
              indexedDB.deleteDatabase('performance_test');
              resolve(performance.now() - start);
            };
          };
        };
      } catch (error) {
        resolve(performance.now() - start);
      }
    });
  }

  private async testCacheAPI(): Promise<number> {
    if (!('caches' in window)) {
      return 0;
    }

    const start = performance.now();
    
    try {
      const cache = await caches.open('performance_test');
      const testData = new Response('x'.repeat(1000));
      
      // Write test
      for (let i = 0; i < 50; i++) {
        await cache.put(`/test/${i}`, testData.clone());
      }
      
      // Read test
      for (let i = 0; i < 50; i++) {
        await cache.match(`/test/${i}`);
      }
      
      // Cleanup
      await caches.delete('performance_test');
    } catch (error) {
      console.warn('Cache API test failed:', error);
    }
    
    return performance.now() - start;
  }

  private async testComputationPerformance(): Promise<{ singleThread: number; multiThread: number; cryptographic: number }> {
    // Single-threaded computation test
    const singleThreadTime = await this.testSingleThreadComputation();
    
    // Multi-threaded computation test (using Web Workers)
    const multiThreadTime = await this.testMultiThreadComputation();
    
    // Cryptographic computation test
    const cryptoTime = await this.testCryptographicComputation();

    return {
      singleThread: singleThreadTime,
      multiThread: multiThreadTime,
      cryptographic: cryptoTime
    };
  }

  private async testSingleThreadComputation(): Promise<number> {
    const start = performance.now();
    
    // CPU-intensive computation
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
    }
    
    return performance.now() - start;
  }

  private async testMultiThreadComputation(): Promise<number> {
    if (!window.Worker) {
      return this.testSingleThreadComputation(); // Fallback
    }

    return new Promise((resolve) => {
      const start = performance.now();
      const workerCount = navigator.hardwareConcurrency || 4;
      let completedWorkers = 0;

      const workerCode = `
        self.onmessage = function(e) {
          const iterations = e.data;
          let result = 0;
          for (let i = 0; i < iterations; i++) {
            result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
          }
          self.postMessage(result);
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);

      for (let i = 0; i < workerCount; i++) {
        const worker = new Worker(workerUrl);
        worker.postMessage(1000000 / workerCount);
        
        worker.onmessage = () => {
          completedWorkers++;
          if (completedWorkers === workerCount) {
            URL.revokeObjectURL(workerUrl);
            resolve(performance.now() - start);
          }
          worker.terminate();
        };
      }
    });
  }

  private async testCryptographicComputation(): Promise<number> {
    if (!window.crypto || !window.crypto.subtle) {
      return 0;
    }

    const start = performance.now();
    
    try {
      // Generate a key pair
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['sign', 'verify']
      );

      // Test data
      const data = new TextEncoder().encode('x'.repeat(1000));

      // Sign the data
      const signature = await window.crypto.subtle.sign(
        {
          name: 'RSA-PSS',
          saltLength: 32,
        },
        keyPair.privateKey,
        data
      );

      // Verify the signature
      await window.crypto.subtle.verify(
        {
          name: 'RSA-PSS',
          saltLength: 32,
        },
        keyPair.publicKey,
        signature,
        data
      );
    } catch (error) {
      console.warn('Crypto test failed:', error);
    }

    return performance.now() - start;
  }

  private async testNetworkPerformance(): Promise<{ latency: number; bandwidth: number; packetLoss: number }> {
    try {
      // Test latency with a small request
      const latencyStart = performance.now();
      await fetch('/favicon.ico', { cache: 'no-cache' });
      const latency = performance.now() - latencyStart;

      // Test bandwidth with a larger request (if available)
      let bandwidth = 0;
      try {
        const bandwidthStart = performance.now();
        const response = await fetch('https://httpbin.org/bytes/100000', { cache: 'no-cache' });
        await response.blob();
        const bandwidthTime = performance.now() - bandwidthStart;
        bandwidth = (100000 * 8) / (bandwidthTime / 1000); // bits per second
      } catch {
        // Fallback: use connection API if available
        if ((navigator as any).connection) {
          bandwidth = (navigator as any).connection.downlink * 1000000; // Convert Mbps to bps
        }
      }

      return {
        latency,
        bandwidth,
        packetLoss: 0 // Cannot measure packet loss directly in browser
      };
    } catch (error) {
      return {
        latency: 0,
        bandwidth: 0,
        packetLoss: 0
      };
    }
  }

  // File system performance testing (requires File System Access API)
  async testFileSystemPerformance(): Promise<{ read: number; write: number; supported: boolean }> {
    if (!('showDirectoryPicker' in window)) {
      return { read: 0, write: 0, supported: false };
    }

    try {
      // This requires user permission
      const dirHandle = await (window as any).showDirectoryPicker();
      
      const start = performance.now();
      
      // Create a test file
      const fileHandle = await dirHandle.getFileHandle('performance_test.txt', { create: true });
      const writable = await fileHandle.createWritable();
      
      const testData = 'x'.repeat(10000); // 10KB
      await writable.write(testData);
      await writable.close();
      
      const writeTime = performance.now() - start;
      
      // Read the file
      const readStart = performance.now();
      const file = await fileHandle.getFile();
      await file.text();
      const readTime = performance.now() - readStart;
      
      // Clean up
      await dirHandle.removeEntry('performance_test.txt');
      
      return {
        read: readTime,
        write: writeTime,
        supported: true
      };
    } catch (error) {
      return { read: 0, write: 0, supported: false };
    }
  }

  // Get real-time performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;
    
    return {
      timing: {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      },
      memory: memory ? {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      } : null,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null
    };
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
    return fpEntry ? fpEntry.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : 0;
  }
}

interface PerformanceMetrics {
  timing: {
    domContentLoaded: number;
    load: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  memory: {
    used: number;
    total: number;
    limit: number;
  } | null;
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null;
}