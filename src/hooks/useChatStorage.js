import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchChats,
  createChat as createChatApi,
} from "../utils/chatApi";

import {
  createChat as createLocalChat,
  sortChats,
} from "../utils/chatUtils";

export default function useChatStorage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===============================
  // LOAD CHATS FROM SQLITE
  // ===============================

  useEffect(() => {
    let ignore = false;

    async function loadChats() {
      try {
        setLoading(true);
        setError("");

        const savedChats = await fetchChats();

        if (ignore) {
          return;
        }

        setChats(sortChats(savedChats));
      } catch (error) {
        if (ignore) {
          return;
        }

        console.error(
          "Failed to load chats:",
          error
        );

        setError(
          "Unable to load chat history. Please check the backend."
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadChats();

    return () => {
      ignore = true;
    };
  }, []);

  // ===============================
  // CREATE CHAT
  // ===============================

  const addChat = useCallback(async () => {
    try {
      setError("");

      const newChat = createLocalChat();

      const savedChat =
        await createChatApi(newChat);

      setChats((currentChats) =>
        sortChats([
          savedChat,
          ...currentChats,
        ])
      );

      return savedChat;
    } catch (error) {
      console.error(
        "Failed to create chat:",
        error
      );

      setError(
        "Unable to create a new chat."
      );

      return null;
    }
  }, []);

  // ===============================
  // REMOVE CHAT FROM UI
  // ===============================

  const removeChatFromState = useCallback(
    (chatId) => {
      setChats((currentChats) =>
        currentChats.filter(
          (chat) => chat.id !== chatId
        )
      );
    },
    []
  );

  // ===============================
  // UPDATE CHAT IN UI
  // ===============================

  const updateChatInState = useCallback(
    (updatedChat) => {
      setChats((currentChats) =>
        sortChats(
          currentChats.map((chat) =>
            chat.id === updatedChat.id
              ? updatedChat
              : chat
          )
        )
      );
    },
    []
  );

  // ===============================
  // RETURN
  // ===============================

  return {
    chats,
    setChats,
    loading,
    error,
    addChat,
    removeChatFromState,
    updateChatInState,
  };
}