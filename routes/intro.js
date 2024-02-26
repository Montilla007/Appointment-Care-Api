const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Behold, the backend API, the silent force powering our digital realm. Like a ninja in the shadows, it orchestrates data with precision, ensuring seamless interactions while the flashy frontends hog the spotlight. It's the unsung hero, the digital wizard behind the curtain, quietly making miracles happen in the world of ones and zeroes.");
  });

  module.exports = router;