#!/usr/bin/env bun
/**
 * Self-contained build script for ElizaOS projects
 */

import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { $ } from 'bun';

async function cleanBuild(outdir = 'dist') {
  if (existsSync(outdir)) {
    await rm(outdir, { recursive: true, force: true });
    console.log(`✓ Cleaned ${outdir} directory`);
  }
}

async function build() {
  const start = performance.now();
  console.log('🚀 Building project...');

  try {
    // Clean previous build
    await cleanBuild('dist');

    // Step 1: Build frontend with Vite FIRST (it needs clean dist)
    console.log('🎨 Building frontend with Vite...');
    try {
      await $`vite build`.quiet();
      console.log('✓ Frontend built successfully');
    } catch (error) {
      console.warn('⚠ Frontend build failed');
      console.warn('  Continuing with API build...');
    }

    // Step 2: Copy API files to dist (don't overwrite frontend files)
    console.log('📦 Building API endpoints...');
    try {
      await $`mkdir -p dist/api`.quiet();
      await $`cp -r api/* dist/api 2>/dev/null || true`.quiet();
      console.log('✓ API endpoints copied');
    } catch (error) {
      console.warn('⚠ API copy warning (non-critical)');
    }

    // Step 3: Copy vercel config
    try {
      await $`cp vercel.json dist/vercel.json 2>/dev/null || true`.quiet();
    } catch (error) {
      // ignore
    }

    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    console.log(`✅ Build complete! (${elapsed}s)`);
    return true;
  } catch (error) {
    console.error('Build error:', error);
    return false;
  }
}

// Execute the build
build()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Build script error:', error);
    process.exit(1);
  });
