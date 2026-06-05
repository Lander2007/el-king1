FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace configuration and package.json files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY server/package.json ./server/

# Install ALL dependencies (including devDependencies needed for build)
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the application
COPY . .

# Set Vite environment variables for the build
# This makes the frontend point to the same host for API and WebSocket
ENV VITE_API_URL=/api
ENV VITE_SOCKET_URL=/

# Build the frontend
RUN pnpm run build

# Build the backend
WORKDIR /app/server
RUN pnpm install --no-frozen-lockfile
RUN pnpm run build

# ==========================================
# Production Image
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

# Set up non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy frontend build
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# Copy backend build and package.json
COPY --from=builder --chown=appuser:appgroup /app/server/dist ./server/dist
COPY --from=builder --chown=appuser:appgroup /app/server/package.json ./server/

# Install only production dependencies for the backend
WORKDIR /app/server
# Without the workspace file, this installs as a standard package
RUN pnpm install --prod

# Revert to app root
WORKDIR /app
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 7860

ENV NODE_ENV=production \
    PORT=7860

# Start the Node server
CMD ["node", "server/dist/index.js"]