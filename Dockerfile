# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# We copy them separately to leverage Docker's caching
COPY package*.json ./

# Install application dependencies
# `npm ci` is used for clean installs, ideal for CI/CD and production
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Generate the build output using tsup
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Run the application
# Use 'npm start' which executes 'node dist/server.js' as defined in package.json
CMD ["npm", "start"]
