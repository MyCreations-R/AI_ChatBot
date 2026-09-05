# 🤖 Nova AI — Full-Stack AI Chatbot

A modern full-stack AI chatbot built from scratch using React.js, JavaScript, CSS, Node.js, Express, SQLite, and the Google Gemini API.

The application provides a ChatGPT-style conversational interface with persistent chat history, multiple conversations, response regeneration, Markdown support, code formatting, and other productivity features.

---

## ✨ Features

### 💬 AI Chat
- Real-time AI conversations using Google Gemini
- Natural conversational context
- Loading / typing indicator
- Error handling for failed requests
- Character limit protection

### 🗂️ Chat Management
- Create new conversations
- Persistent chat history
- Select previous conversations
- Rename conversations
- Delete conversations
- Search chat history
- Clear conversation messages
- Automatically generated chat titles

### 🔄 AI Response Controls
- Regenerate AI responses
- Preserve conversation history
- Copy complete AI responses
- Copy individual code blocks

### 📝 Rich Message Rendering
- Markdown support
- Inline code formatting
- Code blocks
- Code language labels
- Message timestamps

### 💾 Persistent Storage
- SQLite database
- Conversations remain available after refreshing the browser
- Messages are stored on the backend

### 🔐 Security
- Gemini API key stored in environment variables
- API key is never exposed in the React frontend
- `.env` is excluded from Git
- Local SQLite database is excluded from Git

### 📱 User Experience
- Responsive interface
- Clean chat layout
- Empty-state suggestions
- Keyboard support
- Enter to send
- Shift + Enter for a new line

---

## 🛠️ Tech Stack

### Frontend

- React.js
- JavaScript
- CSS
- Vite
- React Markdown

### Backend

- Node.js
- Express.js
- REST API
- CORS
- dotenv

### Database

- SQLite
- better-sqlite3

### AI

- Google Gemini API
- Google GenAI SDK

### Development Tools

- Git
- GitHub
- VS Code

---

## 🏗️ Project Architecture

```text
User
  │
  ▼
React Frontend
  │
  │ HTTP Requests
  ▼
Express Backend
  │
  ├──────────────► Google Gemini API
  │
  ▼
SQLite Database
  │
  ├── Chats
  └── Messages
