FROM node:20-alpine AS builder

WORKDIR /build
COPY package*.json .
RUN npm install
COPY . .

FROM node:20-alpine AS production

WORKDIR /app
COPY --from=builder /build/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
