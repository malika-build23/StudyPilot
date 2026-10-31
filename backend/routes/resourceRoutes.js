const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/test', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Resource Finder API is working!',
  });
});

module.exports = router;
