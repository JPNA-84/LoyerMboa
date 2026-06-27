FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install --production

# Copy source
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 5000

CMD ["node", "src/server.js"]
