require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const connectDB = require('./config/db');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const verifyAdmin = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);

const certificatesDirectory = path.join(__dirname, '..', 'client', 'public', 'certificates');
const photosDirectory = path.join(__dirname, '..', 'client', 'public', 'photos');
fs.mkdirSync(certificatesDirectory, { recursive: true });
fs.mkdirSync(photosDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: certificatesDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'certificate';
    callback(null, `${Date.now()}-${safeBaseName}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = new Set([
      'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'
    ]);
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error('Only PDF, JPEG, PNG, WebP, and GIF files are allowed.'));
    }
    return callback(null, true);
  }
});

const photoStorage = multer.diskStorage({
  destination: photosDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'profile-photo';
    callback(null, `${Date.now()}-${safeBaseName}${extension}`);
  }
});
const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, WebP, and GIF images are allowed for profile photos.'));
    }
    return callback(null, true);
  }
});

app.post('/api/upload', verifyAdmin, upload.single('certificate'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose a certificate file to upload.' });
  return res.status(201).json({ url: `/certificates/${req.file.filename}` });
});
app.post('/api/upload/photo', verifyAdmin, photoUpload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose a profile photo to upload.' });
  return res.status(201).json({ url: `/photos/${req.file.filename}` });
});
app.use('/certificates', express.static(certificatesDirectory));
app.use('/photos', express.static(photosDirectory));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'File must be 5 MB or smaller.' : err.message });
  }
  if (err && err.message && err.message.startsWith('Only ')) {
    return res.status(400).json({ message: err.message });
  }
  return next(err);
});

// In production, serve the built React app
const dist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(dist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(dist, 'index.html'), (err) => err && next());
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
