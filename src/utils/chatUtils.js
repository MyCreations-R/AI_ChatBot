// ===============================
// CHAT CONSTANTS
// ===============================

export const MAX_MESSAGE_LENGTH = 4000;

// ===============================
// CREATE CHAT
// ===============================

export function createChat() {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    title: "New Chat",
    createdAt: now,
    updatedAt: now,
  };
}

// ===============================
// CREATE MESSAGE
// ===============================

export function createMessage(
  role,
  content,
  extra = {}
) {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
    ...extra,
  };
}

// ===============================
// GET CHAT TITLE
// ===============================

export function getChatTitle(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return "New Chat";
  }

  if (trimmedText.length <= 40) {
    return trimmedText;
  }

  return `${trimmedText.slice(0, 40)}...`;
}

// ===============================
// FORMAT MESSAGE TIME
// ===============================

export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ===============================
// SORT CHATS
// ===============================

export function sortChats(chats) {
  return [...chats].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );
}