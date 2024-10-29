# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all source files
COPY . .

EXPOSE 3000

# Start the frontend application
CMD ["npm", "run", "dev"]
