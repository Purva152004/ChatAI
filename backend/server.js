
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db'); // your db connector
const messagesRouter = require('./routes/messages');
const modelsRouter = require('./routes/models');

const app = express();

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',   // Vite frontend
  process.env.FRONTEND_URL   // Production frontend
];

app.use(cors({
  origin: function (origin, callback) {

    // Allow requests with no origin (Postman, curl)
    if (!origin) return callback(null, true);

    // Allow if in allowedOrigins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Netlify domains
    try {
      const hostname = new URL(origin).hostname;
      if (hostname.endsWith('.netlify.app')) {
        return callback(null, true);
      }
    } catch (err) {}

    console.warn('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(morgan('dev'));

// connect to Mongo
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGODB_URI (or MONGO_URI) is not set in env!');
  process.exit(1);
}
connectDB(mongoUri);

// routes
app.use('/messages', messagesRouter);
app.use('/models', modelsRouter);

// health
app.get('/', (req, res) => res.send('AI Chat Backend running'));

// listen using Render's PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
