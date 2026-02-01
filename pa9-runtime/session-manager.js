#!/usr/bin/env node

const express = require('express');
const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.SESSION_MANAGER_PORT || 6090;
const WORKSPACE_BASE = process.env.WORKSPACE_DIR || '/workspace';
const IDLE_TIMEOUT = (process.env.SESSION_IDLE_MINUTES || 30) * 60 * 1000;

// Session storage
const sessions = new Map();
let displayCounter = 100;
let portCounter = 0;

// Allocate ports
function allocatePorts() {
  const index = portCounter++;
  return {
    display: displayCounter + index,
    vncPort: 5900 + index,
    wsPort: 6900 + index,
  };
}

// Create session
app.post('/internal/sessions', async (req, res) => {
  try {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const { display, vncPort, wsPort } = allocatePorts();
    const workspaceDir = path.join(WORKSPACE_BASE, 'sessions', sessionId);

    // Create workspace
    if (!fs.existsSync(workspaceDir)) {
      fs.mkdirSync(workspaceDir, { recursive: true });
    }

    const displayStr = `:${display}`;
    const processes = {};

    // Start Xvfb
    const xvfb = spawn('Xvfb', [displayStr, '-screen', '0', '1920x1080x24'], {
      stdio: 'ignore',
      detached: false,
    });
    processes.xvfb = xvfb;

    // Wait for X to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start window manager
    const wm = spawn('fluxbox', [], {
      env: { ...process.env, DISPLAY: displayStr },
      stdio: 'ignore',
      detached: false,
    });
    processes.wm = wm;

    await new Promise(resolve => setTimeout(resolve, 500));

    // Start PA9
    const pa9 = spawn('java', ['-jar', '/app/PA9.jar'], {
      cwd: workspaceDir,
      env: { ...process.env, DISPLAY: displayStr },
      stdio: 'ignore',
      detached: false,
    });
    processes.pa9 = pa9;

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start x11vnc
    const vnc = spawn('x11vnc', [
      '-display', displayStr,
      '-rfbport', vncPort.toString(),
      '-forever',
      '-shared',
      '-nopw',
    ], {
      stdio: 'ignore',
      detached: false,
    });
    processes.vnc = vnc;

    await new Promise(resolve => setTimeout(resolve, 500));

    // Start websockify
    const ws = spawn('websockify', [
      '--web=/usr/share/novnc',
      wsPort.toString(),
      `localhost:${vncPort}`,
    ], {
      stdio: 'ignore',
      detached: false,
    });
    processes.ws = ws;

    // Store session
    const session = {
      sessionId,
      display,
      vncPort,
      wsPort,
      workspaceDir,
      processes,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
    sessions.set(sessionId, session);

    console.log(`[Session] Created ${sessionId} on display ${displayStr}, ws ${wsPort}`);

    res.json({
      sessionId,
      display,
      vncPort,
      wsPort,
      workspaceDir,
    });
  } catch (error) {
    console.error('[Session] Create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session
app.get('/internal/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json({
    sessionId: session.sessionId,
    display: session.display,
    vncPort: session.vncPort,
    wsPort: session.wsPort,
    workspaceDir: session.workspaceDir,
    createdAt: session.createdAt,
    lastActivity: session.lastActivity,
  });
});

// Delete session
app.delete('/internal/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Kill processes
  Object.values(session.processes).forEach(proc => {
    try {
      proc.kill('SIGTERM');
    } catch (e) {
      console.error(`[Session] Kill error:`, e);
    }
  });

  // Remove workspace
  if (fs.existsSync(session.workspaceDir)) {
    fs.rmSync(session.workspaceDir, { recursive: true, force: true });
  }

  sessions.delete(req.params.id);
  console.log(`[Session] Deleted ${req.params.id}`);

  res.json({ message: 'Session deleted' });
});

// Update activity
app.post('/internal/sessions/:id/activity', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  session.lastActivity = Date.now();
  res.json({ ok: true });
});

// Idle cleanup
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > IDLE_TIMEOUT) {
      console.log(`[Session] Cleaning up idle session ${id}`);
      try {
        Object.values(session.processes).forEach(proc => proc.kill('SIGTERM'));
        if (fs.existsSync(session.workspaceDir)) {
          fs.rmSync(session.workspaceDir, { recursive: true, force: true });
        }
        sessions.delete(id);
      } catch (e) {
        console.error(`[Session] Cleanup error:`, e);
      }
    }
  }
}, 60000); // Check every minute

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SessionManager] Listening on ${PORT}`);
  console.log(`[SessionManager] Idle timeout: ${IDLE_TIMEOUT / 60000} minutes`);
});
