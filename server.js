#!/usr/bin/env node

/**
 * DEPRECATED: This bridge file is no longer needed with Option A (pnpm filtering).
 * 
 * However, if you need this for backwards compatibility or debugging:
 * - Keep this file if using: CMD ["node", "server.js"]
 * - Switch to Option A for production: CMD ["pnpm", "--filter", "server", "prod"]
 * 
 * ============================================================================
 * 
 * ES Module Bridge for pnpm Monorepo TypeScript Server
 * 
 * This bridges the gap between Node.js entry point and pnpm workspace context.
 * Spawns the server with proper NODE_PATH and PATH configuration for module resolution.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve pnpm module paths for workspace dependency resolution
 */
function resolvePnpmPaths() {
  const rootDir = __dirname;
  const serverDir = path.join(rootDir, 'server');
  const rootNodeModules = path.join(rootDir, 'node_modules');
  const serverNodeModules = path.join(serverDir, 'node_modules');
  
  const nodePaths = [
    serverNodeModules,
    rootNodeModules,
    path.join(rootNodeModules, '.pnpm'),
  ].filter(dir => fs.existsSync(dir));
  
  return { nodePaths, serverNodeModules, serverDir };
}

/**
 * Configure environment for pnpm workspace context
 */
function buildEnvironment(nodePaths, serverNodeModules) {
  const env = { ...process.env };
  
  env.NODE_PATH = nodePaths.join(path.delimiter);
  env.PATH = `${path.join(serverNodeModules, '.bin')}${path.delimiter}${process.env.PATH || ''}`;
  env.NODE_ENV = env.NODE_ENV || 'production';
  
  return env;
}

/**
 * Spawn the TypeScript server with pnpm workspace context
 */
function startServer() {
  const { nodePaths, serverNodeModules, serverDir } = resolvePnpmPaths();
  const env = buildEnvironment(nodePaths, serverNodeModules);
  
  console.log('🔧 Bridge: Configuring pnpm workspace environment...');
  console.log(`   Directory: ${serverDir}`);
  
  const child = spawn('npx', ['tsx', 'index.ts'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: false,
    env,
  });

  console.log(`✅ Bridge: Server spawned (PID: ${child.pid})`);

  // Handle exit
  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`⚠️  Bridge: Terminated by signal: ${signal}`);
      process.exit(0);
    } else if (code !== 0) {
      console.error(`❌ Bridge: Server exited with code: ${code}`);
      process.exit(code);
    }
  });

  // Handle errors
  child.on('error', (error) => {
    console.error(`❌ Bridge: Failed to spawn: ${error.message}`);
    process.exit(1);
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    console.log(`\n⚠️  Bridge: Received ${signal}`);
    if (child && !child.killed) {
      child.kill(signal);
      
      const timeout = setTimeout(() => {
        if (child && !child.killed) child.kill('SIGKILL');
      }, 12000);
      
      child.on('exit', () => clearTimeout(timeout));
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('❌ Bridge: Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ Bridge: Uncaught Exception:', error);
    process.exit(1);
  });
}

console.log('🚀 Bridge: Starting TypeScript Server...');
startServer();
