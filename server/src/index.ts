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
import { Settings } from './models/Settings';

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

/**
 * CORS Configuration
 * 
 * Supports multiple environment variables for flexible origin management:
 * - VITE_APP_URL: Primary frontend URL (production Vercel domain)
 * - CORS_ORIGIN: Comma-separated list of allowed origins
 * 
 * Examples of environment variables:
 * Development:
 *   VITE_APP_URL=http://localhost:3000
 *   CORS_ORIGIN=http://localhost:3000,http://localhost:5173
 * 
 * Production (Hugging Face Spaces + Vercel):
 *   VITE_APP_URL=https://yourapp.vercel.app
 *   CORS_ORIGIN=https://yourapp.vercel.app,https://*.vercel.app
 * 
 * Note: 
 * - Always allows requests WITHOUT an origin header (UptimeRobot, monitoring pings, curl, Postman)
 * - Supports wildcard patterns (*.vercel.app)
 * - Enables credentials for session/cookie-based auth
 */

const buildAllowedOrigins = (): string[] => {
  const origins: Set<string> = new Set();

  // Add VITE_APP_URL if provided
  if (process.env.VITE_APP_URL) {
    origins.add(process.env.VITE_APP_URL);
  }

  // Add CORS_ORIGIN entries if provided
  if (process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN.split(',').forEach(o => origins.add(o.trim()));
  }

  // Development defaults if no env variables set
  if (origins.size === 0) {
    origins.add('http://localhost:3000');
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:3000');
    origins.add('http://127.0.0.1:5173');
  }

  return Array.from(origins);
};

const ALLOWED_ORIGINS = buildAllowedOrigins();

// Helper function to check if origin matches allowed patterns
const isOriginAllowed = (origin: string): boolean => {
  return ALLOWED_ORIGINS.some(allowedOrigin => {
    // Exact match
    if (allowedOrigin === origin) return true;

    // Wildcard pattern matching (e.g., https://*.vercel.app matches https://app.vercel.app)
    if (allowedOrigin.includes('*')) {
      const pattern = allowedOrigin
        .replace(/\./g, '\\.')
        .replace(/\*/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(origin);
    }

    return false;
  });
};

const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // CRITICAL: Always allow requests without origin
    // These are legitimate requests from:
    // - UptimeRobot and other monitoring services
    // - curl and other CLI tools
    // - same-origin requests (browser doesn't send Origin header)
    // - mobile apps
    // - server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    // Origin not allowed - reject with CORS error
    // This is logged but doesn't throw - the request is simply blocked
    console.warn(`CORS: Rejected request from origin "${origin}"`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
};

if (process.env.NODE_ENV === 'development') {
  console.log('✅ CORS Configuration:');
  console.log('   Allowed Origins:', ALLOWED_ORIGINS);
  console.log('   Credentials:', corsOptions.credentials);
}

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Socket.IO Setup
const io = new Server(httpServer, {
  cors: {
    // For Socket.IO, we need to handle origins similarly
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`Socket.IO CORS: Rejected connection from origin "${origin}"`);
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

    // Seed default settings if not exists
    try {
      const settingsCount = await Settings.countDocuments();
      if (settingsCount === 0) {
        await Settings.create({
          siteName: { en: 'King Store', ar: 'كينج ستور' },
          logo: '/logo.png',
          contactEmail: 'contact@kingstore.com',
          contactPhone: '+201000000000',
          address: { en: 'Cairo, Egypt', ar: 'القاهرة، مصر' },
          socialLinks: {
            facebook: 'https://facebook.com',
            instagram: 'https://instagram.com',
            whatsapp: 'https://wa.me/201000000000'
          },
          paymentMethods: {
            cod: true,
            instapay: true,
            vodafoneCash: true,
            orangeCash: true,
            etisalatCash: true
          },
          shippingRates: new Map([
            ['Cairo', 50],
            ['Giza', 50],
            ['Alexandria', 60]
          ]),
          maintenanceMode: false
        });
        console.log('✓ Seeded default settings');
      }
    } catch (err) {
      console.error('⚠ Failed to seed default settings:', err);
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
