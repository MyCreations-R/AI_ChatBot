const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ===============================
// GENERIC API REQUEST
// ===============================

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.error || "Something went wrong with the server."
    );
  }

  return data;
}

// ===============================
// CHAT API
// ===============================

// Get all chats
export async function fetchChats() {
  const data = await apiRequest("/chats");

  return data.chats;
}

// Create chat
export async function createChat(chat) {
  const data = await apiRequest("/chats", {
    method: "POST",
    body: JSON.stringify({
      id: chat.id,
      title: chat.title,
    }),
  });

  return data.chat;
}

// Get one chat
export async function fetchChat(chatId) {
  const data = await apiRequest(`/chats/${chatId}`);

  return data.chat;
}

// Rename chat
export async function renameChat(chatId, title) {
  const data = await apiRequest(`/chats/${chatId}`, {
    method: "PUT",
    body: JSON.stringify({
      title,
    }),
  });

  return data.chat;
}

// Delete chat
export async function removeChat(chatId) {
  return apiRequest(`/chats/${chatId}`, {
    method: "DELETE",
  });
}

// ===============================
// MESSAGE API
// ===============================

// Get messages
export async function fetchMessages(chatId) {
  const data = await apiRequest(
    `/chats/${chatId}/messages`
  );

  return data.messages;
}

// Save message
export async function saveMessage(chatId, message) {
  const data = await apiRequest(
    `/chats/${chatId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
      }),
    }
  );

  return data.message;
}

// Replace an existing assistant message
// Used for response regeneration
export async function replaceMessage(
  chatId,
  messageId,
  content
) {
  const data = await apiRequest(
    `/chats/${chatId}/messages/${messageId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        content,
        timestamp: Date.now(),
      }),
    }
  );

  return data.message;
}

// Clear messages
export async function clearMessages(chatId) {
  return apiRequest(
    `/chats/${chatId}/messages`,
    {
      method: "DELETE",
    }
  );
}

// ===============================
// AI API
// ===============================

export async function sendMessageToAI(messages) {
  const data = await apiRequest("/chat", {
    method: "POST",
    body: JSON.stringify({
      messages,
    }),
  });

  return data.message;
}