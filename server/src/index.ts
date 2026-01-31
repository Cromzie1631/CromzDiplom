import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();

// IMPORTANT: process.env.PORT is a string, so we must convert to number for app.listen
const PORT: number = Number(process.env.PORT) || 3001;

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';

// Ensure workspace directory exists
if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, WORKSPACE_DIR);
  },
  filename: (req, file, cb) => {
    // Sanitize filename - only allow alphanumeric, dots, dashes, underscores
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, sanitized);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow .pa9 files (and optionally .png, .csv for future exports)
    const allowedExtensions = ['.pa9', '.png', '.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Неподдерживаемый тип файла. Разрешены: ${allowedExtensions.join(', ')}`));
    }
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List files endpoint
app.get('/api/files', (req, res) => {
  try {
    const files = fs
      .readdirSync(WORKSPACE_DIR)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ['.pa9', '.txt', '.png', '.csv'].includes(ext);
      })
      .map((file) => {
        const filePath = path.join(WORKSPACE_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      });

    res.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Ошибка при чтении списка файлов' });
  }
});

// Upload file endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не был загружен' });
  }

  res.json({
    message: 'Файл успешно загружен',
    filename: req.file.filename,
    size: req.file.size,
  });
});

// Delete file endpoint
app.delete('/api/files/:name', (req, res) => {
  const fileName = req.params.name;
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = path.join(WORKSPACE_DIR, sanitized);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Файл не найден' });
  }

  const ext = path.extname(sanitized).toLowerCase();
  const allowedExtensions = ['.pa9', '.txt', '.png', '.csv'];
  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({ error: 'Неподдерживаемый тип файла' });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ message: 'Файл удалён' });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ error: 'Ошибка при удалении файла' });
  }
});

// Download file endpoint
app.get('/api/download/:name', (req, res) => {
  const fileName = req.params.name;
  // Sanitize filename to prevent directory traversal
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = path.join(WORKSPACE_DIR, sanitized);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Файл не найден' });
  }

  // Check if it's a safe file type
  const ext = path.extname(sanitized).toLowerCase();
  const allowedExtensions = ['.pa9', '.txt', '.png', '.csv'];
  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({ error: 'Неподдерживаемый тип файла' });
  }

  res.download(filePath, sanitized, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).json({ error: 'Ошибка при скачивании файла' });
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой (максимум 20MB)' });
    }
  }
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Внутренняя ошибка сервера' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API сервер запущен на порту ${PORT}`);
  console.log(`Рабочая директория: ${WORKSPACE_DIR}`);
});

