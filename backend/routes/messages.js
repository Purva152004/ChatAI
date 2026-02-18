const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const axios = require('axios');

// Allowed models (update as Groq announces new ones)
const allowedModels = [
  'llama-3.1-8b-instant',
  'llama-3.1-70b-instant',
  'mixtral-8x7b-32768',
  'gemma-7b-it'
];

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

// Helper: approximate token estimator
function estimateTokens(text) {
  if (!text) return 0;
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words * 1.3)); // rough estimate
}

// GET /api/messages - fetch full chat history (sorted asc)
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    return res.json({ success: true, messages });
  } catch (err) {
    console.error('GET /api/messages error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/messages - accept user message, save it, get AI reply, save reply, return updated messages
// Optional body: { text, model } - model must be in allowedModels
router.post('/', async (req, res) => {
  try {
    const { text, model } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Empty message' });
    }

    const chosenModel = model && allowedModels.includes(model) ? model : DEFAULT_MODEL;

    // Save user message (with token estimate)
    const userTokens = estimateTokens(text);
    const userMsg = new Message({ role: 'user', text: text.trim(), tokens: userTokens });
    await userMsg.save();

    // AI reply (fallback text if no key or error)
    let aiText = 'Hello! (default reply — no GROQ_API_KEY configured or AI error.)';
    let aiTokens = 0;

    if (GROQ_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: chosenModel,
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: text }
            ],
            max_tokens: 800,
            temperature: 0.7
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${GROQ_API_KEY}`
            },
            timeout: 20000
          }
        );

        const data = response && response.data ? response.data : null;

        if (data) {
          if (Array.isArray(data.choices) && data.choices.length > 0) {
            if (data.choices[0].message && data.choices[0].message.content) {
              aiText = String(data.choices[0].message.content).trim();
            } else if (data.choices[0].text) {
              aiText = String(data.choices[0].text).trim();
            } else {
              aiText = JSON.stringify(data.choices[0]).slice(0, 4000);
            }
          } else if (data.output && Array.isArray(data.output) && data.output[0] && data.output[0].content) {
            aiText = String(data.output[0].content).trim();
          } else {
            aiText = 'Sorry — could not parse AI reply.';
          }
        } else {
          aiText = 'No response from AI service.';
        }
      } catch (err) {
        console.error('Groq API call failed:');
        if (err.response) {
          console.error('Status:', err.response.status);
          console.error('Data:', JSON.stringify(err.response.data, null, 2));
          // Informative fallback messages
          const errData = err.response.data;
          if (errData && errData.error && errData.error.code === 'model_decommissioned') {
            aiText = 'AI model unavailable. Please contact admin to update the model.';
          } else if (err.response.status === 401 || err.response.status === 403) {
            aiText = 'AI auth error. Check GROQ_API_KEY.';
          } else {
            aiText = 'AI service returned an error. Using fallback reply.';
          }
        } else {
          console.error(err.message);
          aiText = 'AI network error. Using fallback reply.';
        }
      }
    } else {
      aiText = `You said: "${text}". (Fallback reply — no GROQ_API_KEY.)`;
    }

    aiTokens = estimateTokens(aiText);
    const aiMsg = new Message({ role: 'ai', text: aiText, tokens: aiTokens });
    await aiMsg.save();

    const messages = await Message.find().sort({ createdAt: 1 });
    return res.json({ success: true, messages });
  } catch (err) {
    console.error('POST /api/messages error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/clear - clear chat history (deletes messages)
router.post('/clear', async (req, res) => {
  try {
    await Message.deleteMany({});
    return res.json({ success: true, message: 'Chat history cleared.' });
  } catch (err) {
    console.error('POST /api/clear error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/stats - returns message count and total tokens
router.get('/stats', async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    const agg = await Message.aggregate([
      { $group: { _id: null, totalTokens: { $sum: '$tokens' } } }
    ]);
    const totalTokens = agg && agg[0] ? agg[0].totalTokens : 0;
    return res.json({ success: true, totalMessages, totalTokens });
  } catch (err) {
    console.error('GET /api/stats error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
