#!/bin/bash
echo "🚀 Deploying OS File Access Cache Simulation to GitHub..."

if [ ! -d ".git" ]; then
    git init
fi

git add .

git commit -m "Update: deploy script run" || echo "No changes to commit"

read -p "Enter your GitHub username: " username
git remote set-url origin https://github.com/$username/os-file-access-cache-simulation.git 2>/dev/null || \
git remote add origin https://github.com/$username/os-file-access-cache-simulation.git

git branch -M main

# Try to rebase first
git pull origin main --rebase || echo "No remote changes to rebase"

# Push to GitHub
git push -u origin main

echo "✅ Successfully deployed to: https://github.com/$username/os-file-access-cache-simulation"

