# Specify the base image
FROM node:16

# Set the working directory in the Docker container
WORKDIR /app

# Copy package.json and package-lock.json to the Docker container
COPY package*.json ./

# Install dependencies in the Docker container
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

ENV PORT=8080

# Expose the port your app runs on
EXPOSE 8080

# The command to run your application when the docker container starts
CMD [ "npm", "start" ]