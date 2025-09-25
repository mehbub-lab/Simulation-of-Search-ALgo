#!/bin/bash

# Quick GitHub deployment script
echo "🚀 Deploying OS File Access Cache Simulation to GitHub..."

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    git init
fi

# Add all files
git add .

# Create commit
git commit -m "Initial commit: OS File Access and CPU Cache Performance Dashboard

- Complete simulation dashboard with 6 main screens
- Real system analysis with hardware benchmarking
- Interactive performance visualization with Recharts
- BST, Hash Table, and Trie performance comparison
- Modern React + TypeScript + Tailwind CSS implementation"

# Add remote (replace YOUR_USERNAME with your GitHub username)
read -p "Enter your GitHub username: " username
git remote add origin https://github.com/$username/os-file-access-cache-simulation.git

# Push to GitHub
git branch -M main
git push -u origin main

echo "✅ Successfully deployed to: https://github.com/$username/os-file-access-cache-simulation"