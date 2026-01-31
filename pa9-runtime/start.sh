#!/bin/bash

set -e

echo "=== PA9 Runtime Startup Script ==="

# Configuration
DISPLAY_NUM=99
VNC_PORT=5900
NOVNC_PORT=6080
VNC_PASSWORD=${VNC_PASSWORD:-pa9}
WORKSPACE_DIR=/workspace

# Create workspace if it doesn't exist
mkdir -p "$WORKSPACE_DIR"

# Cleanup stale Xvfb locks (in case container restarted)
rm -f /tmp/.X${DISPLAY_NUM}-lock
rm -f /tmp/.X11-unix/X${DISPLAY_NUM}
pkill -f "Xvfb :${DISPLAY_NUM}" 2>/dev/null || true

# Start Xvfb
echo "Starting Xvfb on display :$DISPLAY_NUM..."
Xvfb :$DISPLAY_NUM -screen 0 1920x1080x24 -ac +extension GLX +render -noreset &
XVFB_PID=$!
sleep 2

# Check if Xvfb started successfully
if ! ps -p $XVFB_PID > /dev/null; then
    echo "ERROR: Xvfb failed to start"
    exit 1
fi

# Start fluxbox window manager
echo "Starting fluxbox..."
DISPLAY=:$DISPLAY_NUM fluxbox &
FLUXBOX_PID=$!
sleep 2

# Start x11vnc
echo "Starting x11vnc..."
DISPLAY=:$DISPLAY_NUM x11vnc -display :$DISPLAY_NUM -nopw -xkb -forever -shared -rfbport $VNC_PORT -bg -o /var/log/x11vnc.log
sleep 2

# Check if x11vnc is running
if ! pgrep -x x11vnc > /dev/null; then
    echo "ERROR: x11vnc failed to start"
    exit 1
fi

# Start websockify for noVNC
echo "Starting websockify for noVNC..."
websockify --web=/usr/share/novnc/ $NOVNC_PORT localhost:$VNC_PORT &
WEBSOCKIFY_PID=$!
sleep 2

# Wait a bit for services to stabilize
sleep 3

# Check if PA9.jar exists
if [ ! -f "/pa9/PA9.jar" ]; then
    echo "WARNING: PA9.jar not found in /pa9 directory"
    echo "Please ensure PA9.jar and required .jar files are copied to the container"
    echo "Waiting for files to be available..."

    # Wait up to 60 seconds for files
    for i in {1..60}; do
        if [ -f "/pa9/PA9.jar" ]; then
            echo "PA9.jar found!"
            break
        fi
        sleep 1
    done

    if [ ! -f "/pa9/PA9.jar" ]; then
        echo "ERROR: PA9.jar still not found after waiting"
        echo "Container will continue running but PA9 will not start"
        echo "Please mount PA9.jar and required .jar files to /pa9 directory"
    fi
fi

# Start PA9 if jar exists
if [ -f "/pa9/PA9.jar" ]; then
    echo "Starting PA9 (fixed)..."
    export DISPLAY=:$DISPLAY_NUM
    cd /pa9

    java -cp PA9.jar PA9 > /var/log/pa9.log 2>&1 &

echo "PA9 log: /var/log/pa9.log"
fi

# Keep container alive
tail -f /dev/null

