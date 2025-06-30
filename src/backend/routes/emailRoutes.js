
import express from 'express';
import { sendCredentialsEmail,sendUpdateCredentialsEmail } from '../services/emailService.js';

const router = express.Router();

router.post('/send-credentials', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    //console.log("req.body",req.body)
    
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const success = await sendCredentialsEmail(email, name, password);
    
    if (success) {
      res.json({ message: 'Credentials email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Error in send-credentials route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/send-updated-credentials', async (req, res) => {
    try {
      const { email, name, password } = req.body;
  
      //console.log("req.body",req.body)
      
      if (!email || !name || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const success = await sendUpdateCredentialsEmail(email, name, password);
      
      if (success) {
        res.json({ message: 'Credentials email sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send email' });
      }
    } catch (error) {
      console.error('Error in send-credentials route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
export default router;