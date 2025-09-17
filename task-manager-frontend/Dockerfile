# Use an official Node image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-timeout 60000
RUN npm ci --legacy-peer-deps

# Copy the rest of the frontend code
COPY . .

# Expose React dev server port
EXPOSE 3000

# Start the React dev server
CMD ["npm", "start"]
