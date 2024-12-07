# Step 1: Set the base image
FROM node:18

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to the container
COPY package*.json ./

# Step 4: Install all dependencies, including dev dependencies for development
RUN npm install

# Step 5: Copy the rest of your application code
COPY . .

# Step 6: Expose the port your app will run on
EXPOSE 5050

# Step 7: Run the app in development mode (with nodemon)
CMD ["npm", "run", "dev"]
