import db from "./db.js";

// ===============================
// GET ALL CHATS
// ===============================

export function getAllChats() {
  return db
    .prepare(`
      SELECT
        id,
        title,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM chats
      ORDER BY updated_at DESC
    `)
    .all();
}

// ===============================
// GET SINGLE CHAT
// ===============================

export function getChatById(chatId) {
  return db
    .prepare(`
      SELECT
        id,
        title,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM chats
      WHERE id = ?
    `)
    .get(chatId);
}

// ===============================
// CREATE CHAT
// ===============================

export function createChat(chat) {
  db.prepare(`
    INSERT INTO chats (
      id,
      title,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?)
  `).run(
    chat.id,
    chat.title,
    chat.createdAt,
    chat.updatedAt
  );

  return getChatById(chat.id);
}

// ===============================
// UPDATE CHAT TITLE
// ===============================

export function updateChatTitle(chatId, title) {
  const updatedAt = Date.now();

  db.prepare(`
    UPDATE chats
    SET
      title = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    title,
    updatedAt,
    chatId
  );

  return getChatById(chatId);
}

// ===============================
// TOUCH CHAT
// Updates the chat's last activity time
// ===============================

export function touchChat(chatId) {
  const updatedAt = Date.now();

  db.prepare(`
    UPDATE chats
    SET updated_at = ?
    WHERE id = ?
  `).run(
    updatedAt,
    chatId
  );

  return getChatById(chatId);
}

// ===============================
// DELETE CHAT
// ===============================

export function deleteChat(chatId) {
  const result = db
    .prepare(`
      DELETE FROM chats
      WHERE id = ?
    `)
    .run(chatId);

  return result.changes > 0;
}

// ===============================
// GET MESSAGES
// ===============================

export function getMessages(chatId) {
  return db
    .prepare(`
      SELECT
        id,
        role,
        content,
        created_at AS timestamp
      FROM messages
      WHERE chat_id = ?
      ORDER BY created_at ASC
    `)
    .all(chatId);
}

// ===============================
// CREATE MESSAGE
// ===============================

export function createMessage(message) {
  const saveMessage = db.transaction(() => {
    db.prepare(`
      INSERT INTO messages (
        id,
        chat_id,
        role,
        content,
        created_at
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(
      message.id,
      message.chatId,
      message.role,
      message.content,
      message.timestamp
    );

    // Update the parent chat's last activity time
    touchChat(message.chatId);
  });

  saveMessage();

  return message;
}

// ===============================
// REPLACE MESSAGE
// Used for AI response regeneration
// ===============================

export function replaceMessage(
  messageId,
  chatId,
  content,
  timestamp
) {
  const result = db
    .prepare(`
      UPDATE messages
      SET
        content = ?,
        created_at = ?
      WHERE
        id = ?
        AND chat_id = ?
        AND role = 'assistant'
    `)
    .run(
      content,
      timestamp,
      messageId,
      chatId
    );

  if (result.changes === 0) {
    return null;
  }

  touchChat(chatId);

  return db
    .prepare(`
      SELECT
        id,
        role,
        content,
        created_at AS timestamp
      FROM messages
      WHERE
        id = ?
        AND chat_id = ?
    `)
    .get(
      messageId,
      chatId
    );
}

// ===============================
// DELETE ALL MESSAGES
// ===============================

export function deleteMessages(chatId) {
  db.prepare(`
    DELETE FROM messages
    WHERE chat_id = ?
  `).run(chatId);

  // Keep the chat's updatedAt current
  touchChat(chatId);
}