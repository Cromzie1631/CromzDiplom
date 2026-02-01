import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import http from 'http';
import httpProxy from 'http-proxy';
import * as sessionManager from './sessionManager';

const app = express();
const server = http.createServer(app);
const proxy = httpProxy.createProxyServer({ ws: true });

const PORT: number = Number(process.env.PORT) || 3001;
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const PA9_GUI_HOST = process.env.PA9_GUI_INTERNAL?.replace('http://', '') || 'pa9-gui:6090';

// Middleware
app.use(cors());
app.use(express.json());

// ========== SESSION ENDPOINTS ==========

// Create session
app.post('/api/session', async (req, res) => {
  try {
    const session = await sessionManager.createSession();
    res.json({
      sessionId: session.sessionId,
      wsPort: session.wsPort,
      createdAt: session.createdAt,
    });
  } catch (error: any) {
    console.error('[API] Create session error:', error);
    res.status(500).json({ error: 'Не удалось создать сессию. Попробуйте позже.' });
  }
});

// Get session
app.get('/api/session/:id', async (req, res) => {
  try {
    const session = await sessionManager.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }
    res.json(session);
  } catch (error: any) {
    console.error('[API] Get session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete session
app.delete('/api/session/:id', async (req, res) => {
  try {
    await sessionManager.deleteSession(req.params.id);
    res.json({ message: 'Сессия завершена' });
  } catch (error: any) {
    console.error('[API] Delete session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update activity
app.post('/api/session/:id/activity', async (req, res) => {
  try {
    await sessionManager.updateActivity(req.params.id);
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get session files
app.get('/api/session/:id/files', async (req, res) => {
  try {
    const session = await sessionManager.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }

    const workspaceDir = path.join(WORKSPACE_DIR, 'sessions', req.params.id);
    if (!fs.existsSync(workspaceDir)) {
      return res.json({ files: [] });
    }

    const files = fs
      .readdirSync(workspaceDir)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ['.pa9', '.txt', '.png', '.csv'].includes(ext);
      })
      .map((file) => {
        const filePath = path.join(workspaceDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    res.json({ files });
  } catch (error) {
    console.error('[API] List files error:', error);
    res.status(500).json({ error: 'Ошибка чтения файлов' });
  }
});

// Upload file
app.post('/api/session/:id/upload', async (req, res) => {
  try {
    const session = await sessionManager.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }

    const workspaceDir = path.join(WORKSPACE_DIR, 'sessions', req.params.id);
    if (!fs.existsSync(workspaceDir)) {
      fs.mkdirSync(workspaceDir, { recursive: true });
    }

    const upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, workspaceDir),
        filename: (req, file, cb) => {
          const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
          cb(null, sanitized);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.pa9', '.png', '.csv', '.txt'].includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('Неподдерживаемый тип файла'));
        }
      },
    }).single('file');

    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
      }
      res.json({
        message: 'Файл загружен',
        filename: req.file.filename,
        size: req.file.size,
      });
    });
  } catch (error: any) {
    console.error('[API] Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download file
app.get('/api/session/:id/download', async (req, res) => {
  try {
    const session = await sessionManager.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }

    const filename = req.query.name as string;
    if (!filename) {
      return res.status(400).json({ error: 'Не указано имя файла' });
    }

    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(WORKSPACE_DIR, 'sessions', req.params.id, sanitized);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл не найден' });
    }

    res.download(filePath, sanitized);
  } catch (error: any) {
    console.error('[API] Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download latest file
app.get('/api/session/:id/download-latest', async (req, res) => {
  try {
    const session = await sessionManager.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }

    const workspaceDir = path.join(WORKSPACE_DIR, 'sessions', req.params.id);
    if (!fs.existsSync(workspaceDir)) {
      return res.status(404).json({ error: 'Файлы не найдены' });
    }

    const files = fs
      .readdirSync(workspaceDir)
      .filter((file) => file.endsWith('.pa9'))
      .map((file) => ({
        name: file,
        path: path.join(workspaceDir, file),
        mtime: fs.statSync(path.join(workspaceDir, file)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (files.length === 0) {
      return res.status(404).json({ error: 'Файлы .pa9 не найдены' });
    }

    const latest = files[0];
    res.download(latest.path, latest.name);
  } catch (error: any) {
    console.error('[API] Download latest error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download ZIP
app.get('/api/session/:id/download-zip', async (req, res) => {
  try {
    const session = await sessionManager.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }

    const workspaceDir = path.join(WORKSPACE_DIR, 'sessions', req.params.id);
    if (!fs.existsSync(workspaceDir)) {
      return res.status(404).json({ error: 'Файлы не найдены' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    res.attachment(`pa9-session-${req.params.id}.zip`);
    archive.pipe(res);

    const files = fs.readdirSync(workspaceDir);
    files.forEach((file) => {
      const filePath = path.join(workspaceDir, file);
      if (fs.statSync(filePath).isFile()) {
        archive.file(filePath, { name: file });
      }
    });

    archive.finalize();
  } catch (error: any) {
    console.error('[API] Download ZIP error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete file
app.delete('/api/session/:id/files/:filename', async (req, res) => {
  try {
    const session = await sessionManager.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }

    const sanitized = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(WORKSPACE_DIR, 'sessions', req.params.id, sanitized);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл не найден' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'Файл удалён' });
  } catch (error: any) {
    console.error('[API] Delete file error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket proxy
server.on('upgrade', async (req, socket, head) => {
  const match = req.url?.match(/^\/api\/session\/([^/]+)\/ws/);
  if (!match) {
    socket.destroy();
    return;
  }

  const sessionId = match[1];
  try {
    const session = await sessionManager.getSession(sessionId);
    if (!session) {
      socket.destroy();
      return;
    }

    // Update activity
    sessionManager.updateActivity(sessionId).catch(() => {});

    // Proxy to pa9-gui websockify
    const target = `ws://${PA9_GUI_HOST.split(':')[0]}:${session.wsPort}`;
    proxy.ws(req, socket, head, { target }, (err) => {
      if (err) {
        console.error('[WS] Proxy error:', err);
        socket.destroy();
      }
    });
  } catch (error) {
    console.error('[WS] Session error:', error);
    socket.destroy();
  }
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API] Error:', err);
  res.status(500).json({ error: err.message || 'Внутренняя ошибка сервера' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[API] Listening on ${PORT}`);
  console.log(`[API] PA9 GUI: ${PA9_GUI_HOST}`);
});
