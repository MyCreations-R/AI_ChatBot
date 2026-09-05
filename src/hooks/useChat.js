import { useEffect, useState } from "react";

import {
  fetchMessages,
  saveMessage,
  replaceMessage,
  clearMessages,
  sendMessageToAI,
  renameChat,
  removeChat,
} from "../utils/chatApi";

import {
  createMessage,
  getChatTitle,
  MAX_MESSAGE_LENGTH,
} from "../utils/chatUtils";

export default function useChat({
  chats,
  addChat,
  removeChatFromState,
  updateChatInState,
  chatsLoading,
}) {
  const [selectedChatId, setSelectedChatId] =
    useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] =
    useState(false);
  const [error, setError] = useState("");

  const selectedChat = chats.find(
    (chat) => chat.id === selectedChatId
  );

  // ===============================
  // CREATE FIRST CHAT
  // ===============================

  useEffect(() => {
    if (
      chatsLoading ||
      chats.length > 0
    ) {
      return;
    }

    async function createFirstChat() {
      const chat = await addChat();

      if (chat) {
        setSelectedChatId(chat.id);
      }
    }

    createFirstChat();
  }, [
    chatsLoading,
    chats.length,
    addChat,
  ]);

  // ===============================
  // SELECT FIRST CHAT
  // ===============================

  useEffect(() => {
    if (
      !selectedChatId &&
      chats.length > 0
    ) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  // ===============================
  // LOAD MESSAGES
  // ===============================

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    let ignore = false;

    async function loadMessages() {
      try {
        setMessagesLoading(true);
        setError("");

        const savedMessages =
          await fetchMessages(selectedChatId);

        if (!ignore) {
          setMessages(savedMessages);
        }
      } catch (error) {
        if (!ignore) {
          console.error(
            "Failed to load messages:",
            error
          );

          setMessages([]);

          setError(
            "Unable to load this conversation."
          );
        }
      } finally {
        if (!ignore) {
          setMessagesLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      ignore = true;
    };
  }, [selectedChatId]);

  // ===============================
  // SEND MESSAGE
  // ===============================

  const sendMessage = async () => {
    const text = input.trim();

    if (
      !text ||
      loading ||
      !selectedChatId
    ) {
      return;
    }

    if (
      text.length > MAX_MESSAGE_LENGTH
    ) {
      setError(
        `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`
      );
      return;
    }

    setError("");

    const userMessage = createMessage(
      "user",
      text
    );

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      await saveMessage(
        selectedChatId,
        userMessage
      );

      // Automatically rename a new chat
      if (
        selectedChat?.title === "New Chat"
      ) {
        const newTitle =
          getChatTitle(text);

        const updatedChat =
          await renameChat(
            selectedChatId,
            newTitle
          );

        updateChatInState(updatedChat);
      }

      const aiResponse =
        await sendMessageToAI(
          updatedMessages.map(
            (message) => ({
              role: message.role,
              content: message.content,
            })
          )
        );

      const assistantMessage =
        createMessage(
          "assistant",
          aiResponse
        );

      await saveMessage(
        selectedChatId,
        assistantMessage
      );

      setMessages(
        (previousMessages) => [
          ...previousMessages,
          assistantMessage,
        ]
      );
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      setError(
        error.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // REGENERATE RESPONSE
  // ===============================

  const handleRegenerate = async (
    assistantMessageId
  ) => {
    if (
      loading ||
      !selectedChatId
    ) {
      return;
    }

    const assistantIndex =
      messages.findIndex(
        (message) =>
          message.id ===
          assistantMessageId
      );

    if (assistantIndex === -1) {
      return;
    }

    if (
      messages[assistantIndex].role !==
      "assistant"
    ) {
      return;
    }

    const previousMessages =
      messages.slice(0, assistantIndex);

    const lastUserMessage =
      [...previousMessages]
        .reverse()
        .find(
          (message) =>
            message.role === "user"
        );

    if (!lastUserMessage) {
      setError(
        "Unable to regenerate this response."
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const conversationForAI =
        previousMessages.map(
          (message) => ({
            role: message.role,
            content: message.content,
          })
        );

      const aiResponse =
        await sendMessageToAI(
          conversationForAI
        );

      const updatedAssistantMessage =
        await replaceMessage(
          selectedChatId,
          assistantMessageId,
          aiResponse
        );

      setMessages(
        (previousMessages) =>
          previousMessages.map(
            (message) =>
              message.id ===
              assistantMessageId
                ? updatedAssistantMessage
                : message
          )
      );
    } catch (error) {
      console.error(
        "Regenerate error:",
        error
      );

      setError(
        error.message ||
          "Unable to regenerate the response. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // NEW CHAT
  // ===============================

  const handleNewChat = async () => {
    if (loading) {
      return;
    }

    setError("");

    const chat = await addChat();

    if (chat) {
      setSelectedChatId(chat.id);
      setMessages([]);
      setInput("");
    }
  };

  // ===============================
  // SELECT CHAT
  // ===============================

  const handleSelectChat = (chatId) => {
    if (
      loading ||
      chatId === selectedChatId
    ) {
      return;
    }

    setError("");
    setSelectedChatId(chatId);
    setMessages([]);
    setInput("");
  };

  // ===============================
  // RENAME CHAT
  // ===============================

  const handleRenameChat = async (
    chatId,
    title
  ) => {
    try {
      setError("");

      const updatedChat =
        await renameChat(
          chatId,
          title
        );

      updateChatInState(updatedChat);
    } catch (error) {
      console.error(
        "Rename error:",
        error
      );

      setError(
        "Unable to rename this conversation."
      );
    }
  };

  // ===============================
  // DELETE CHAT
  // ===============================

  const handleDeleteChat = async (
    chatId
  ) => {
    if (loading) {
      return;
    }

    try {
      setError("");

      await removeChat(chatId);

      removeChatFromState(chatId);

      if (chatId === selectedChatId) {
        const remainingChats =
          chats.filter(
            (chat) => chat.id !== chatId
          );

        setMessages([]);
        setInput("");

        if (remainingChats.length > 0) {
          setSelectedChatId(
            remainingChats[0].id
          );
        } else {
          const newChat =
            await addChat();

          if (newChat) {
            setSelectedChatId(
              newChat.id
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      setError(
        "Unable to delete this conversation."
      );
    }
  };

  // ===============================
  // CLEAR CHAT
  // ===============================

  const handleClearChat = async () => {
    if (
      !selectedChatId ||
      loading ||
      messages.length === 0
    ) {
      return;
    }

    try {
      setError("");

      await clearMessages(
        selectedChatId
      );

      setMessages([]);
    } catch (error) {
      console.error(
        "Clear chat error:",
        error
      );

      setError(
        "Unable to clear this conversation."
      );
    }
  };

  // ===============================
  // SUGGESTION
  // ===============================

  const handleSuggestion = (text) => {
    setInput(text);
  };

  // ===============================
  // KEYBOARD
  // ===============================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  return {
    selectedChatId,
    selectedChat,
    messages,
    input,
    loading,
    messagesLoading,
    error,

    setInput,

    sendMessage,
    handleRegenerate,
    handleNewChat,
    handleSelectChat,
    handleRenameChat,
    handleDeleteChat,
    handleClearChat,
    handleSuggestion,
    handleKeyDown,
  };
}