# ---- Build stage ----
FROM node:18-alpine AS builder
WORKDIR /app
COPY app/package*.json ./
RUN npm ci --only=production

# ---- Final stage ----
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app
# Copy built node_modules and application code
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs app/ ./

# Switch to non-root user
USER nodejs

EXPOSE 3000
CMD ["node", "app.js"]
