# ChatAI – Full Stack AI Chat Application
ChatAI is a modern full-stack AI-powered chat application built using the MERN Stack with Groq/OpenAI-compatible models.
It supports real-time AI conversations, Markdown rendering, model selection, and chat history storage in MongoDB.

## Features
- Real-time AI chat
- Multiple model selection
- Markdown support (code blocks, tables, formatting)
- Chat history stored in MongoDB
- Clear chat functionality
- Modern responsive UI
- Secure environment-based configuration
- Fast Vite + React frontend
  
## Tech Stack
🔹 Frontend
React (Vite)
Axios
React Markdown
CSS (Responsive Design)
🔹 Backend
Node.js
Express.js
MongoDB
Mongoose
CORS
Morgan
🔹 AI Integration
Groq API (OpenAI-compatible models)

## Project Structure
```
ChatAI/
│
├── backend/
│   ├── config/
│   │   └── db.js
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
```
Method  |  Endpoint   |  Description             |
________|_____________|__________________________|
GET     |  /messages  | Get all chat messages    |
POST    |  /messages  | Send message to AI       |
DELETE  |  /messages  | Clear chat history       |
GET     |  /models    | Get available AI models  |
```
## UI Highlights
- Sticky premium navbar
- Modern gradient theme
- Responsive chat layout
- AI & User message bubbles
- Markdown code rendering
- Clean minimal design

## Security
- Environment variables for API keys
- CORS configured properly
- No sensitive data exposed to frontend
- MongoDB secured via connection string
