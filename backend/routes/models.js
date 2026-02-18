const express = require('express');
const router = express.Router();

// Keep in sync with allowedModels in messages.js
const models = [
  { id: 'llama-3.1-8b-instant', name: 'LLaMA 3.1 (8B) — instant' },
  { id: 'llama-3.1-70b-instant', name: 'LLaMA 3.1 (70B) — instant' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
  { id: 'gemma-7b-it', name: 'Gemma 7B (it)' }
];

router.get('/', (req, res) => {
  res.json({ success: true, models });
});

module.exports = router;
