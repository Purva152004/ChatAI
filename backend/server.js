
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db'); // your db connector
const messagesRouter = require('./routes/messages');
const modelsRouter = require('./routes/models');

const app = express();


app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://chat-ai-amber-five.vercel.app'
  ],
  credentials: true
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
