# OS File Access and CPU Cache Performance Simulation Dashboard

An interactive web-based simulation dashboard that analyzes and compares the performance of different search structures (Binary Search Trees, Hash Tables, and Tries) in the context of operating system file access patterns and CPU cache performance.

## 🚀 Features

### Multi-Screen Dashboard
- **Landing Screen**: Project overview and navigation
- **System Architecture Page**: Visual representation of OS and cache architecture
- **Simulation Dashboard**: Interactive performance simulations with real-time metrics
- **Dataflow Diagram Page**: Visual data flow representation across different search structures
- **Performance Comparison Page**: Side-by-side performance analysis
- **Real System Analysis**: Live hardware benchmarking and performance measurement

### Real System Analysis
- **Hardware Detection**: Automatic detection of CPU, memory, and browser specifications
- **Performance Benchmarking**: Real-time measurement of JavaScript execution performance
- **Memory Analysis**: Cache performance simulation based on actual system capabilities
- **Data Structure Testing**: Live performance comparison of BST, Hash Tables, and Tries

### Interactive Visualizations
- Real-time performance charts using Recharts
- Cache hit/miss rate visualization
- Latency and throughput metrics
- Interactive controls for simulation parameters

## 🛠 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts for data visualization
- **UI Components**: Custom components with shadcn/ui
- **Performance APIs**: Browser Performance API, Navigator API, Web Workers
- **Build Tool**: Modern ES modules with Vite/similar

## 📊 Data Structures Analyzed

### Binary Search Tree (BST)
- **Color Theme**: Green (#10B981)
- **Use Case**: Ordered data access patterns
- **Metrics**: Search time, insertion/deletion performance, cache locality

### Hash Tables
- **Color Theme**: Blue (#3B82F6)
- **Use Case**: Fast key-value lookups
- **Metrics**: Hash collision rates, memory usage, access patterns

### Tries (Prefix Trees)
- **Color Theme**: Orange (#F59E0B)
- **Use Case**: String-based searches and autocomplete
- **Metrics**: Memory overhead, prefix matching performance, cache behavior

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- Modern web browser with Performance API support

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/os-file-access-cache-simulation.git

# Navigate to project directory
cd os-file-access-cache-simulation

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Launch the Application**: Open your browser and navigate to the development server URL
2. **Explore Pages**: Use the navigation to move between different analysis screens
3. **Run Simulations**: Access the Simulation Dashboard to run performance tests
4. **Real System Analysis**: Visit the Real System Analysis page to benchmark your actual hardware
5. **Compare Results**: Use the Performance Comparison page to analyze different data structures

## 📈 Performance Metrics

The dashboard measures and visualizes:

- **Cache Hit/Miss Rates**: Percentage of successful cache accesses
- **Access Latency**: Time taken for data structure operations
- **Memory Usage**: RAM consumption patterns
- **Throughput**: Operations per second
- **System Load**: CPU and memory utilization during tests

## 🎨 Design System

The dashboard follows a clean, modern design with:
- **Base Colors**: Blue/Gray palette for neutrals
- **Accent Colors**: Structure-specific colors (Green, Blue, Orange)
- **Typography**: Consistent font sizing and weights via CSS custom properties
- **Components**: Rounded corners, soft shadows, responsive layouts
- **Dark Mode**: Full dark theme support

## 🧪 Simulation Features

### Cache Simulation
- L1, L2, L3 cache level simulation
- Cache replacement policies (LRU, FIFO, Random)
- Hit/miss pattern analysis

### File Access Patterns
- Sequential access simulation
- Random access patterns
- Locality of reference testing

### Real-Time Benchmarking
- JavaScript performance measurement
- Memory allocation tracking
- Hardware capability detection

## 📁 Project Structure

```
├── App.tsx                 # Main application component
├── components/
│   ├── LandingScreen.tsx   # Welcome and navigation screen
│   ├── SystemArchitecture.tsx # System architecture visualization
│   ├── SimulationDashboard.tsx # Interactive simulation interface  
│   ├── DataflowDiagram.tsx # Data flow visualization
│   ├── PerformanceComparison.tsx # Performance analysis
│   ├── RealSystemAnalysis.tsx # Live system benchmarking
│   ├── simulation/         # Core simulation logic
│   │   ├── CacheSimulator.ts
│   │   ├── DataStructures.ts
│   │   ├── FileAccessSimulator.ts
│   │   ├── RealSystemSimulator.ts
│   │   └── SystemAnalyzer.ts
│   └── ui/                # Reusable UI components
├── styles/
│   └── globals.css        # Global styles and design tokens
└── guidelines/
    └── Guidelines.md      # Development guidelines
```

## 🔧 Development

### Key Components

- **App.tsx**: Main router and page state management
- **Simulation Components**: Core logic for data structure testing
- **UI Components**: Reusable interface elements using shadcn/ui
- **Real System Integration**: Browser API integration for live analysis

### Performance Optimization

- Web Workers for heavy computations
- Efficient React rendering with proper key props
- Optimized chart rendering with Recharts
- Memory-conscious data structure implementations

## 🎯 Educational Objectives

This project demonstrates:

1. **Operating Systems Concepts**: File system access patterns, cache hierarchies
2. **Data Structures**: Practical performance comparison of BST, Hash Tables, and Tries
3. **Performance Analysis**: Real-world benchmarking and measurement techniques
4. **Web Development**: Modern React development with TypeScript and Tailwind CSS
5. **Computer Architecture**: CPU cache behavior and memory access patterns

## 🤝 Contributing

This is an educational project developed for Computer Science coursework. Feel free to fork and experiment with the code for learning purposes.

## 📝 License

This project is developed for educational purposes. Please refer to your institution's academic integrity policies when using this code.

## 🙏 Acknowledgments

- Built with modern web technologies and browser performance APIs
- UI components inspired by shadcn/ui design system
- Performance visualization powered by Recharts
- Real system integration using Web APIs

---

**Note**: This dashboard is designed for educational demonstration of OS and data structure concepts. For production systems, additional considerations for security, scalability, and browser compatibility would be necessary.