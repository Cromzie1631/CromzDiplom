FROM node:18-bullseye

# Install Java and X11 dependencies
RUN apt-get update && apt-get install -y \
    openjdk-11-jre \
    xvfb \
    fluxbox \
    x11vnc \
    novnc \
    websockify \
    && rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p /workspace /app

# Copy PA9 files
COPY *.jar /app/
COPY PA9.cfg /app/

# Copy session manager
COPY session-manager.js /app/session-manager.js
COPY package.json /app/package.json

WORKDIR /app

# Install Node dependencies
RUN npm install --production

# Expose session manager port
EXPOSE 6090

# Start session manager
CMD ["node", "/app/session-manager.js"]
