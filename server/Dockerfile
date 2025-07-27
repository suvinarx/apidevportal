# Use Node.js LTS (Alpine is small/fast)
FROM node:18-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy the rest of your code
COPY . .

# Expose the app port
EXPOSE 5005
ENV MONGO_URI=http://localhost:3001/
ENV PORT=5005
# Start your app
CMD ["node", "index.js"]