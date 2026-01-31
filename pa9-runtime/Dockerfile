FROM eclipse-temurin:8-jre-jammy

# Install required packages
RUN apt-get update && apt-get install -y \
    xvfb \
    fluxbox \
    x11vnc \
    novnc \
    websockify \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
RUN mkdir -p /workspace

# Create directory for PA9 files
RUN mkdir -p /pa9

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Note: PA9.jar and *.jar files should be copied here before building
# Or mounted as volume. For now, we expect them to be in the build context.
# Copy any .jar files from build context (if they exist)
COPY *.jar /pa9/
COPY PA9.cfg /pa9/PA9.cfg

# Set working directory
WORKDIR /pa9

# Set display
ENV DISPLAY=:99

# Expose noVNC port
EXPOSE 6080

# Start script
CMD ["/start.sh"]
