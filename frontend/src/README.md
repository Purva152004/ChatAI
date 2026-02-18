 ## AI Chat App

A full-stack AI Chat application built using the MERN stack with Groq/OpenAI-compatible models.
Supports real-time messaging, model selection, chat history storage, and Markdown rendering.

## Features

💬 Real-time AI chat
🧠 Multiple model selection
📝 Markdown support (code blocks, formatting, tables)
📊 Chat history stored in MongoDB
🧹 Clear chat functionality
⚡ Fast Vite + React frontend
🔐 Environment-based configuration
🎨 Modern responsive UI

## Tech Stack
🔹 Frontend
- React (Vite)
- Axios
- React Markdown
- CSS (Responsive Design)

🔹 Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS
- Morgan

🔹 AI Integration

- Groq API (OpenAI-compatible models)

## Project Structure
```
ChatAI/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── Message.js
│   ├── routes/
│   │   ├── messages.js
│   │   └── models.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.jsx
│   │   ├── index.css
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── .env
│
└── README.md
```
## API Endpoints
- GET /messages
Fetch all chat messages
- POST /messages
Send new message to AI
- DELETE /messages
Clear chat history
- GET /models
Get available AI models

## UI Preview

- Sticky navbar
- Modern gradient theme
- Responsive layout
- Markdown message rendering
- Clean chat bubbles

## Security

- Environment-based configuration
- CORS controlled
- No API keys exposed to frontend
- MongoDB connection secured via .env