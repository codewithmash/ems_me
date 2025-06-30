
import express from 'express';
import noticeService from '../services/noticeService.js';

const router = express.Router();

// Get all notices
router.get('/', async (req, res) => {
  try {
    const notices = await noticeService.getAllNotices();
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notices', error });
  }
});

// Create notice
router.post('/', async (req, res) => {
  try {
    const notice = await noticeService.createNotice(req.body);
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notice', error });
  }
});

// Update notice
router.put('/:id', async (req, res) => {
  try {
    const notice = await noticeService.updateNotice(Number(req.params.id), req.body);
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notice', error });
  }
});

// Delete notice
router.delete('/:id', async (req, res) => {
  try {
    await noticeService.deleteNotice(Number(req.params.id));
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notice', error });
  }
});

export default router;
