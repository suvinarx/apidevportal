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
EXPOSE 5000
ENV MONGO_URI=mongodb+srv://meetlakhani98787:QmjuMuyZJMW4uVAG@cluster0.ofmfway.mongodb.net/
ENV PORT=5000
# Start your app
CMD ["node", "index.js"]
