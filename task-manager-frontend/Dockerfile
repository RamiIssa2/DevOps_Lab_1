# Use an official Node image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose React dev server port
EXPOSE 3000

# Start the React dev server
CMD ["npm", "start"]
