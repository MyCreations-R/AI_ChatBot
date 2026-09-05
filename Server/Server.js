import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

import {
  getAllChats,
  getChatById,
  createChat,
  updateChatTitle,
  deleteChat,
  getMessages,
  createMessage,
  deleteMessages,
  replaceMessage,
} from "./chatRepository.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

const PORT = process.env.PORT || 5000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(
  express.json({
    limit: "1mb",
  })
);

// ===============================
// GEMINI API SETUP
// ===============================

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Nova AI backend is running",
  });
});

// ===============================
// AI CHAT ROUTE
// ===============================

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Please provide at least one message.",
      });
    }

    // Get the latest message
    const lastMessage = messages[messages.length - 1];

    // Validate latest message
    if (
      !lastMessage ||
      lastMessage.role !== "user" ||
      !lastMessage.content?.trim()
    ) {
      return res.status(400).json({
        error: "The last message must contain user text.",
      });
    }

    // Convert previous messages into Gemini history format
    const history = messages.slice(0, -1).map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: String(message.content),
        },
      ],
    }));

    // Create Gemini chat
    const chat = ai.chats.create({
      model: "gemini-3.7-flash",
      history,
    });

    // Send latest user message
    const response = await chat.sendMessage({
      message: lastMessage.content.trim(),
    });

    // Get AI response text
    const text = response.text?.trim();

    // Check empty response
    if (!text) {
      return res.status(502).json({
        error: "The AI returned an empty response.",
      });
    }

    // Send response to frontend
    res.json({
      message: text,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    res.status(500).json({
      error: "Unable to generate an AI response. Please try again.",
    });
  }
});

// ==================================================
// CHAT DATABASE ROUTES
// ==================================================

// ===============================
// GET ALL CHATS
// ===============================

app.get("/api/chats", (req, res) => {
  try {
    const chats = getAllChats();

    res.json({
      chats,
    });
  } catch (error) {
    console.error("Get chats error:", error);

    res.status(500).json({
      error: "Failed to load chats.",
    });
  }
});

// ===============================
// CREATE NEW CHAT
// ===============================

app.post("/api/chats", (req, res) => {
  try {
    const { id, title } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "Chat ID is required.",
      });
    }

    const now = Date.now();

    const chat = createChat({
      id,
      title: title?.trim() || "New Chat",
      createdAt: now,
      updatedAt: now,
    });

    res.status(201).json({
      chat,
    });
  } catch (error) {
    console.error("Create chat error:", error);

    res.status(500).json({
      error: "Failed to create chat.",
    });
  }
});

// ===============================
// GET SINGLE CHAT
// ===============================

app.get("/api/chats/:chatId", (req, res) => {
  try {
    const chat = getChatById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found.",
      });
    }

    res.json({
      chat,
    });
  } catch (error) {
    console.error("Get chat error:", error);

    res.status(500).json({
      error: "Failed to load chat.",
    });
  }
});

// ===============================
// RENAME CHAT
// ===============================

app.put("/api/chats/:chatId", (req, res) => {
  try {
    const { title } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        error: "Chat title is required.",
      });
    }

    const chat = updateChatTitle(
      req.params.chatId,
      title.trim()
    );

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found.",
      });
    }

    res.json({
      chat,
    });
  } catch (error) {
    console.error("Update chat error:", error);

    res.status(500).json({
      error: "Failed to update chat.",
    });
  }
});

// ===============================
// DELETE CHAT
// ===============================

app.delete("/api/chats/:chatId", (req, res) => {
  try {
    const deleted = deleteChat(req.params.chatId);

    if (!deleted) {
      return res.status(404).json({
        error: "Chat not found.",
      });
    }

    res.json({
      message: "Chat deleted successfully.",
    });
  } catch (error) {
    console.error("Delete chat error:", error);

    res.status(500).json({
      error: "Failed to delete chat.",
    });
  }
});

// ==================================================
// MESSAGE ROUTES
// ==================================================

// ===============================
// GET MESSAGES FOR CHAT
// ===============================

app.get("/api/chats/:chatId/messages", (req, res) => {
  try {
    const chat = getChatById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found.",
      });
    }

    const messages = getMessages(req.params.chatId);

    res.json({
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      error: "Failed to load messages.",
    });
  }
});

// ===============================
// SAVE MESSAGE
// ===============================

app.post("/api/chats/:chatId/messages", (req, res) => {
  try {
    const {
      id,
      role,
      content,
      timestamp,
    } = req.body;

    // Check chat exists
    const chat = getChatById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found.",
      });
    }

    // Validate message
    if (!id || !role || !content?.trim()) {
      return res.status(400).json({
        error: "Invalid message.",
      });
    }

    // Only allow valid message roles
    if (role !== "user" && role !== "assistant") {
      return res.status(400).json({
        error: "Invalid message role.",
      });
    }

    const message = createMessage({
      id,
      chatId: req.params.chatId,
      role,
      content: content.trim(),
      timestamp: timestamp || Date.now(),
    });

    res.status(201).json({
      message,
    });
  } catch (error) {
    console.error("Save message error:", error);

    res.status(500).json({
      error: "Failed to save message.",
    });
  }
});

// ===============================
// REGENERATE / REPLACE MESSAGE
// ===============================

app.put(
  "/api/chats/:chatId/messages/:messageId",
  (req, res) => {
    try {
      const { content, timestamp } = req.body;

      // Check chat exists
      const chat = getChatById(req.params.chatId);

      if (!chat) {
        return res.status(404).json({
          error: "Chat not found.",
        });
      }

      // Validate content
      if (!content?.trim()) {
        return res.status(400).json({
          error: "Message content is required.",
        });
      }

      // Replace existing assistant message
      const message = replaceMessage(
        req.params.messageId,
        req.params.chatId,
        content.trim(),
        timestamp || Date.now()
      );

      if (!message) {
        return res.status(404).json({
          error: "Assistant message not found.",
        });
      }

      res.json({
        message,
      });
    } catch (error) {
      console.error("Replace message error:", error);

      res.status(500).json({
        error: "Failed to regenerate message.",
      });
    }
  }
);

// ===============================
// CLEAR CONVERSATION
// ===============================

app.delete("/api/chats/:chatId/messages", (req, res) => {
  try {
    const chat = getChatById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found.",
      });
    }

    deleteMessages(req.params.chatId);

    res.json({
      message: "Conversation cleared successfully.",
    });
  } catch (error) {
    console.error("Clear messages error:", error);

    res.status(500).json({
      error: "Failed to clear conversation.",
    });
  }
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});