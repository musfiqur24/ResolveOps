FROM node:22-alpine

WORKDIR /app

# Install dependencies before copying the application source so Docker can
# reuse this layer while the source code changes during development.
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
