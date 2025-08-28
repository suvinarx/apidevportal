# Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /app

# Install only the lockfile and package.json
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies (prefer pnpm, yarn, or npm)
RUN \
  if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm ci; \
  fi

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept args from docker-compose
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_REQUIRE_ADMIN_CODE

# Export them so Next.js
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_REQUIRE_ADMIN_CODE=$NEXT_PUBLIC_REQUIRE_ADMIN_CODE

# Build Next.js app
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# If you use next.config.js with custom server, copy it as well
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Set env if needed
ENV PORT=3000

CMD ["npm", "start"]
