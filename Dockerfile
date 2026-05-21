# Step 1: The Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# Next.js will naturally detect the .env file GitHub creates for us
RUN npm run build

# Step 2: The Production Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Ensure the runner stage keeps the service account JSON for backend verification
COPY --from=builder /app/serviceAccountKey.json ./serviceAccountKey.json

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
