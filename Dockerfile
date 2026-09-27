FROM node:20-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/* && npm ci --omit=dev
COPY . .
RUN mkdir -p /app/data
ENV NODE_ENV=production PORT=8080 DB_PATH=/app/data/web-monitor.db
EXPOSE 8080
CMD ["node", "server.js"]
