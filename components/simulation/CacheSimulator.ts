// Cache Level Implementation
export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  accessCount: number;
}

export class CacheLevel {
  private cache: Map<string, CacheEntry> = new Map();
  private capacity: number;
  private hits: number = 0;
  private misses: number = 0;
  private evictions: number = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: string): { hit: boolean; value: any; latency: number } {
    const startTime = performance.now();
    
    if (this.cache.has(key)) {
      this.hits++;
      const entry = this.cache.get(key)!;
      entry.accessCount++;
      entry.timestamp = Date.now();
      
      const endTime = performance.now();
      return {
        hit: true,
        value: entry.value,
        latency: endTime - startTime
      };
    } else {
      this.misses++;
      const endTime = performance.now();
      return {
        hit: false,
        value: null,
        latency: endTime - startTime
      };
    }
  }

  put(key: string, value: any): void {
    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      accessCount: 1
    };

    if (this.cache.size >= this.capacity && !this.cache.has(key)) {
      // LRU eviction
      let oldestKey = '';
      let oldestTime = Date.now();
      
      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.evictions++;
      }
    }

    this.cache.set(key, entry);
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      missRate: total > 0 ? (this.misses / total) * 100 : 0,
      utilization: (this.cache.size / this.capacity) * 100,
      evictions: this.evictions,
      size: this.cache.size,
      capacity: this.capacity
    };
  }

  reset() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }
}

// Multi-level Cache System
export class MultiLevelCache {
  private l1Cache: CacheLevel;
  private l2Cache: CacheLevel;
  private l3Cache: CacheLevel;
  private memoryAccesses: number = 0;

  constructor() {
    this.l1Cache = new CacheLevel(32);   // Small, fast L1
    this.l2Cache = new CacheLevel(256);  // Medium L2
    this.l3Cache = new CacheLevel(2048); // Large L3
  }

  get(key: string): { value: any; hit: boolean; level: string; totalLatency: number } {
    this.memoryAccesses++;
    let totalLatency = 0;

    // Try L1 Cache (1-2 cycles)
    const l1Result = this.l1Cache.get(key);
    totalLatency += l1Result.latency + this.simulateLatency(1, 2);
    
    if (l1Result.hit) {
      return {
        value: l1Result.value,
        hit: true,
        level: 'L1',
        totalLatency
      };
    }

    // Try L2 Cache (10-20 cycles)
    const l2Result = this.l2Cache.get(key);
    totalLatency += l2Result.latency + this.simulateLatency(10, 20);
    
    if (l2Result.hit) {
      // Promote to L1
      this.l1Cache.put(key, l2Result.value);
      return {
        value: l2Result.value,
        hit: true,
        level: 'L2',
        totalLatency
      };
    }

    // Try L3 Cache (40-75 cycles)
    const l3Result = this.l3Cache.get(key);
    totalLatency += l3Result.latency + this.simulateLatency(40, 75);
    
    if (l3Result.hit) {
      // Promote to L2 and L1
      this.l2Cache.put(key, l3Result.value);
      this.l1Cache.put(key, l3Result.value);
      return {
        value: l3Result.value,
        hit: true,
        level: 'L3',
        totalLatency
      };
    }

    // Cache miss - simulate memory access (200-300 cycles)
    totalLatency += this.simulateLatency(200, 300);
    
    return {
      value: null,
      hit: false,
      level: 'Memory',
      totalLatency
    };
  }

  put(key: string, value: any): void {
    // Store in all levels (write-through policy)
    this.l1Cache.put(key, value);
    this.l2Cache.put(key, value);
    this.l3Cache.put(key, value);
  }

  private simulateLatency(minCycles: number, maxCycles: number): number {
    // Simulate CPU cycles as microseconds
    const cycles = Math.random() * (maxCycles - minCycles) + minCycles;
    return cycles * 0.001; // Convert to milliseconds (assuming 1GHz CPU)
  }

  getOverallStats() {
    const l1Stats = this.l1Cache.getStats();
    const l2Stats = this.l2Cache.getStats();
    const l3Stats = this.l3Cache.getStats();

    const totalHits = l1Stats.hits + l2Stats.hits + l3Stats.hits;
    const totalMisses = l3Stats.misses; // Only L3 misses count as true misses
    const totalAccesses = totalHits + totalMisses;

    return {
      l1: l1Stats,
      l2: l2Stats,
      l3: l3Stats,
      overall: {
        hitRate: totalAccesses > 0 ? (totalHits / totalAccesses) * 100 : 0,
        missRate: totalAccesses > 0 ? (totalMisses / totalAccesses) * 100 : 0,
        memoryAccesses: this.memoryAccesses,
        totalAccesses
      }
    };
  }

  reset() {
    this.l1Cache.reset();
    this.l2Cache.reset();
    this.l3Cache.reset();
    this.memoryAccesses = 0;
  }
}