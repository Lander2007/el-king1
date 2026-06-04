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
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Socket.IO Setup
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
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
const PORT = process.env.PORT || 5000;

async function startServer() {
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
      console.log('Seeded default admin credentials (admin / Admin@2025)');
    }
  } catch (err) {
    console.error('Failed to seed default admin user:', err);
  }

  // Start Change Streams with WS namespace
  initChangeStreams(wsNamespace);

  // Global 404 handler to return JSON instead of HTML
  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  httpServer.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

startServer();
