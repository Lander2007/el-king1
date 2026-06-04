"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("./lib/mongodb");
// Load routers
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const settings_1 = __importDefault(require("./routes/settings"));
const contact_1 = __importDefault(require("./routes/contact"));
const seo_1 = __importDefault(require("./routes/seo"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Enable CORS
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express_1.default.json());
// Socket.IO Setup
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        credentials: true,
    },
    path: '/ws', // Custom namespace path
});
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
app.use('/', seo_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/orders', orders_1.default); // Mounts /api/orders and /api/admin/orders
app.use('/api', orders_1.default); // Make sure it mounts /api/admin/orders and /api/orders correctly
app.use('/api', settings_1.default); // Mounts /api/settings and /api/admin/settings
app.use('/api', contact_1.default); // Mounts /api/contact and /api/admin/messages
const changeStreams_1 = require("./lib/changeStreams");
// Connect to Database and start server
const PORT = process.env.PORT || 5000;
async function startServer() {
    await (0, mongodb_1.connectDB)();
    // Start Change Streams with WS namespace
    (0, changeStreams_1.initChangeStreams)(wsNamespace);
    httpServer.listen(PORT, () => {
        console.log(`Backend server running on port ${PORT}`);
    });
}
startServer();
