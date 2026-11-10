# Base image na may Node.js
FROM node:18-slim

# I-install ang FFmpeg sa loob ng Render
RUN apt-get update && apt-get install -y ffmpeg

# Set working directory
WORKDIR /usr/src/app

# Package files
COPY package*.json ./
RUN npm install

# Kopyahin ang buong project files
COPY . .

# Patakbuhin ang bot
CMD ["node", "index.js"]
