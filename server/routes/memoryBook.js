import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/auth.js';

import MemoryPerson from '../models/MemoryPerson.js';

const router = express.Router();

// =========================================================
// FILE PATH SETUP
// =========================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store memory book photos inside:
// server/uploads/memory
const uploadDirectory = path.join(
  __dirname,
  '../uploads/memory'
);

// Create folder automatically if it does not exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// =========================================================
// MULTER STORAGE
// =========================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const safeName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_');

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${safeName}${extension}`;

    cb(null, uniqueName);
  },
});

// =========================================================
// FILE FILTER
// =========================================================

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(
      new Error('Only image files are allowed.'),
      false
    );
  }
};

// =========================================================
// MULTER UPLOAD
// =========================================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// =========================================================
// AUTHENTICATION
// =========================================================

router.use(authenticateToken);

router.use(
  authorizeRoles('patient', 'caregiver')
);

// =========================================================
// GET MEMORY BOOK
// =========================================================

router.get('/', async (req, res) => {
  try {
    const userId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'User authentication information is missing.',
      });
    }

    const persons = await MemoryPerson.find({
      patient: userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json(persons);
  } catch (error) {
    console.error(
      'Failed to fetch memory book:',
      error
    );

    return res.status(500).json({
      message: 'Failed to fetch memory book',
    });
  }
});

// =========================================================
// ADD MEMORY MEMBER
// =========================================================

router.post(
  '/',
  upload.single('photo'),
  async (req, res) => {
    try {
      const userId =
        req.user?._id ||
        req.user?.id ||
        req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message:
            'User authentication information is missing.',
        });
      }

      const {
        name,
        relationship,
        description,
      } = req.body;

      // -----------------------------------------------
      // VALIDATION
      // -----------------------------------------------

      if (!name || !name.trim()) {
        return res.status(400).json({
          message: 'Member name is required.',
        });
      }

      if (
        !relationship ||
        !relationship.trim()
      ) {
        return res.status(400).json({
          message: 'Relationship is required.',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: 'Member photo is required.',
        });
      }

      // -----------------------------------------------
      // PHOTO URL
      // -----------------------------------------------

      const photoUrl =
        `/uploads/memory/${req.file.filename}`;

      // -----------------------------------------------
      // CREATE MEMORY PERSON
      // -----------------------------------------------

      const memoryPerson =
        new MemoryPerson({
          patient: userId,
          name: name.trim(),
          relationship: relationship.trim(),
          photo: photoUrl,
          description:
            description?.trim() || '',
        });

      await memoryPerson.save();

      return res.status(201).json({
        message:
          'Memory member added successfully.',
        person: memoryPerson,
      });
    } catch (error) {
      console.error(
        'Failed to add memory member:',
        error
      );

      // Remove uploaded file if database save failed
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // Ignore cleanup error
        }
      }

      return res.status(500).json({
        message:
          error.message ||
          'Failed to add memory member.',
      });
    }
  }
);

// =========================================================
// DELETE MEMORY MEMBER
// =========================================================

router.delete(
  '/:id',
  async (req, res) => {
    try {
      const userId =
        req.user?._id ||
        req.user?.id ||
        req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message:
            'User authentication information is missing.',
        });
      }

      const person =
        await MemoryPerson.findOne({
          _id: req.params.id,
          patient: userId,
        });

      if (!person) {
        return res.status(404).json({
          message:
            'Memory member not found.',
        });
      }

      // Delete image from server
      if (person.photo) {
        const photoPath = path.join(
          __dirname,
          '..',
          person.photo.replace(
            /^\/uploads\//,
            'uploads/'
          )
        );

        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      await MemoryPerson.findByIdAndDelete(
        req.params.id
      );

      return res.status(200).json({
        message:
          'Memory member deleted successfully.',
      });
    } catch (error) {
      console.error(
        'Failed to delete memory member:',
        error
      );

      return res.status(500).json({
        message:
          'Failed to delete memory member.',
      });
    }
  }
);

// =========================================================
// MULTER ERROR HANDLER
// =========================================================

router.use(
  (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message:
            'Image size should be less than 5 MB.',
        });
      }

      return res.status(400).json({
        message: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    next();
  }
);

export default router;