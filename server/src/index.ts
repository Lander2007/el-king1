import path from 'path';
import fs from 'fs';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { connectDB } from './lib/mongodb';
import { Admin } from './models/Admin';

// Load routers
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import settingsRouter from './routes/settings';
import contactRouter from './routes/contact';
import seoRouter from './routes/seo';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Enable CORS
const CORS_ORIGINS = [
  'https://king-store.vercel.app',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Socket.IO Setup
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    credentials: true,
  },
  path: '/ws', // Custom namespace path
});

app.set('io', io);

// Create namespace /ws
const wsNamespace = io.of('/ws');
app.set('wsNamespace', wsNamespace);

wsNamespace.on('connection', (socket) => {
  console.log(`Client connected to /ws namespace: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected from /ws namespace: ${socket.id}`);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Mount Routes
app.use('/', seoRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter); // Mounts /api/orders and /api/admin/orders
app.use('/api', ordersRouter);        // Make sure it mounts /api/admin/orders and /api/orders correctly
app.use('/api', settingsRouter);      // Mounts /api/settings and /api/admin/settings
app.use('/api', contactRouter);       // Mounts /api/contact and /api/admin/messages

import { initChangeStreams } from './lib/changeStreams';

// Connect to Database and start server
// Parse port from environment with validation
const PORT = parsePort(process.env.PORT || '7860');

/**
 * Parse and validate port number
 * @param portValue - Port from environment variable or default
 * @returns Parsed port number (1-65535)
 */
function parsePort(portValue: string | number): number {
  const parsed = typeof portValue === 'number' ? portValue : parseInt(portValue, 10);
  
  if (isNaN(parsed) || parsed < 1 || parsed > 65535) {
    console.warn(`Invalid PORT: ${portValue}, defaulting to 7860`);
    return 7860;
  }
  
  return parsed;
}

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Seed default admin user if not exists
    try {
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        const hashedPassword = await bcrypt.hash('Admin@2025', 10);
        await Admin.create({
          username: 'admin',
          passwordHash: hashedPassword,
        });
        console.log('✓ Seeded default admin credentials (admin / Admin@2025)');
      }
    } catch (err) {
      console.error('⚠ Failed to seed default admin user:', err);
    }

    // Start Change Streams with WS namespace
    initChangeStreams(wsNamespace);

    // Serve static frontend files
    const clientDistPath = path.resolve(__dirname, '../../dist');
    if (fs.existsSync(clientDistPath)) {
      app.use(express.static(clientDistPath));
    }

    // Global 404 handler to return JSON for API/WS, otherwise serve index.html for SPA
    app.use((req, res) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/ws')) {
        res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
      } else {
        res.sendFile(path.join(clientDistPath, 'index.html'));
      }
    });

    // Start HTTP server on 0.0.0.0 (listen on all network interfaces)
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Backend server running at http://0.0.0.0:${PORT}`);
      console.log(`✅ Health check available at http://localhost:${PORT}/health`);
      console.log(`✅ Socket.IO namespace available at ws://localhost:${PORT}/ws`);
    });

    // Graceful shutdown handler
    process.on('SIGTERM', () => {
      console.log('⚠ SIGTERM received, closing server gracefully...');
      httpServer.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
      });
      
      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('⚠ Forced exit after graceful shutdown timeout');
        process.exit(1);
      }, 10000);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
