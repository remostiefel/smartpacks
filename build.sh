#!/bin/bash
# Custom build script that ensures devDependencies are installed

echo "Installing all dependencies (including devDependencies)..."
npm install

echo "Running build..."
npm run build

echo "Build complete!"
