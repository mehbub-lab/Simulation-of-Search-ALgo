// Binary Search Tree Implementation
export class BSTNode {
  constructor(
    public key: string,
    public value: any,
    public left: BSTNode | null = null,
    public right: BSTNode | null = null
  ) {}
}

export class BinarySearchTree {
  private root: BSTNode | null = null;
  public accessCount = 0;
  public comparisons = 0;

  insert(key: string, value: any): void {
    this.root = this.insertNode(this.root, key, value);
  }

  private insertNode(node: BSTNode | null, key: string, value: any): BSTNode {
    if (node === null) {
      return new BSTNode(key, value);
    }

    if (key < node.key) {
      node.left = this.insertNode(node.left, key, value);
    } else if (key > node.key) {
      node.right = this.insertNode(node.right, key, value);
    } else {
      node.value = value; // Update existing key
    }

    return node;
  }

  search(key: string): any | null {
    const startTime = performance.now();
    this.accessCount++;
    this.comparisons = 0;
    
    const result = this.searchNode(this.root, key);
    const endTime = performance.now();
    
    return {
      value: result,
      found: result !== null,
      comparisons: this.comparisons,
      latency: endTime - startTime
    };
  }

  private searchNode(node: BSTNode | null, key: string): any | null {
    if (node === null) {
      return null;
    }

    this.comparisons++;

    if (key === node.key) {
      return node.value;
    } else if (key < node.key) {
      return this.searchNode(node.left, key);
    } else {
      return this.searchNode(node.right, key);
    }
  }

  getStats() {
    return {
      accessCount: this.accessCount,
      avgComparisons: this.comparisons / Math.max(this.accessCount, 1)
    };
  }
}

// Hash Table Implementation
export class HashTable {
  private buckets: Array<Array<{ key: string; value: any }>> = [];
  private size: number;
  public accessCount = 0;
  public collisions = 0;

  constructor(size: number = 1000) {
    this.size = size;
    this.buckets = new Array(size).fill(null).map(() => []);
  }

  private hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % this.size;
  }

  insert(key: string, value: any): void {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    
    // Check for existing key
    const existingItem = bucket.find(item => item.key === key);
    if (existingItem) {
      existingItem.value = value;
    } else {
      if (bucket.length > 0) {
        this.collisions++;
      }
      bucket.push({ key, value });
    }
  }

  search(key: string): any {
    const startTime = performance.now();
    this.accessCount++;
    
    const index = this.hash(key);
    const bucket = this.buckets[index];
    
    const item = bucket.find(item => item.key === key);
    const endTime = performance.now();
    
    return {
      value: item ? item.value : null,
      found: !!item,
      bucketSize: bucket.length,
      latency: endTime - startTime
    };
  }

  getStats() {
    const totalItems = this.buckets.reduce((sum, bucket) => sum + bucket.length, 0);
    const nonEmptyBuckets = this.buckets.filter(bucket => bucket.length > 0).length;
    
    return {
      accessCount: this.accessCount,
      collisions: this.collisions,
      loadFactor: totalItems / this.size,
      bucketUtilization: nonEmptyBuckets / this.size
    };
  }
}

// Trie Implementation
export class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
  value: any = null;
}

export class Trie {
  private root: TrieNode = new TrieNode();
  public accessCount = 0;
  public nodeTraversals = 0;

  insert(key: string, value: any): void {
    let current = this.root;
    
    for (const char of key) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    
    current.isEndOfWord = true;
    current.value = value;
  }

  search(key: string): any {
    const startTime = performance.now();
    this.accessCount++;
    this.nodeTraversals = 0;
    
    let current = this.root;
    
    for (const char of key) {
      this.nodeTraversals++;
      if (!current.children.has(char)) {
        const endTime = performance.now();
        return {
          value: null,
          found: false,
          nodeTraversals: this.nodeTraversals,
          latency: endTime - startTime
        };
      }
      current = current.children.get(char)!;
    }
    
    const endTime = performance.now();
    return {
      value: current.isEndOfWord ? current.value : null,
      found: current.isEndOfWord,
      nodeTraversals: this.nodeTraversals,
      latency: endTime - startTime
    };
  }

  getStats() {
    return {
      accessCount: this.accessCount,
      avgNodeTraversals: this.nodeTraversals / Math.max(this.accessCount, 1)
    };
  }

  // Helper method to count total nodes
  countNodes(): number {
    return this.countNodesRecursive(this.root);
  }

  private countNodesRecursive(node: TrieNode): number {
    let count = 1;
    for (const child of node.children.values()) {
      count += this.countNodesRecursive(child);
    }
    return count;
  }
}