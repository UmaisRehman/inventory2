const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json'); // You'll need to add this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// VK App credentials - replace with your actual values
const VK_APP_ID = 'YOUR_VK_APP_ID';
const VK_APP_SECRET = 'YOUR_VK_APP_SECRET';

// Endpoint to handle VK authentication
app.post('/api/auth/vk', async (req, res) => {
  try {
    const { vkUser, vkToken } = req.body;

    if (!vkUser || !vkToken) {
      return res.status(400).json({ error: 'Missing VK user data or token' });
    }

    // Verify VK token (optional but recommended)
    // You can verify the token with VK API if needed

    // Create Firebase custom token
    const uid = `vk_${vkUser.id}`;
    const additionalClaims = {
      provider: 'vk',
      vkId: vkUser.id
    };

    const firebaseToken = await admin.auth().createCustomToken(uid, additionalClaims);

    res.json({ firebaseToken });
  } catch (error) {
    console.error('VK authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('VK Authentication endpoint: POST /api/auth/vk');
});
