import { useMemo, useState } from "react";

function Sidebar({
  chats = [],
  selectedChatId,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  disabled = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const filteredChats = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return chats;
    }

    return chats.filter((chat) =>
      chat.title.toLowerCase().includes(query)
    );
  }, [chats, searchTerm]);

  const startRename = (chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const cancelRename = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const saveRename = async (chatId) => {
    const title = editingTitle.trim();

    if (!title) {
      return;
    }

    if (onRenameChat) {
      await onRenameChat(chatId, title);
    }

    cancelRename();
  };

  const handleRenameKeyDown = (event, chatId) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveRename(chatId);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelRename();
    }
  };

  const handleDelete = async (chat) => {
    const confirmed = window.confirm(
      `Delete "${chat.title}"?\n\nThis will permanently delete this conversation.`
    );

    if (!confirmed) {
      return;
    }

    if (onDeleteChat) {
      await onDeleteChat(chat.id);
    }
  };

  return (
    <aside className="sidebar">
      {/* ===============================
          SIDEBAR HEADER
      =============================== */}

      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            ✦
          </div>

          <div>
            <h2>Nova AI</h2>
            <span>AI Assistant</span>
          </div>
        </div>

        <button
          className="sidebar-new-chat"
          onClick={onNewChat}
          disabled={disabled}
          title="Create a new chat"
        >
          +
        </button>
      </div>

      {/* ===============================
          NEW CHAT BUTTON
      =============================== */}

      <button
        className="new-chat-full-button"
        onClick={onNewChat}
        disabled={disabled}
      >
        <span className="new-chat-icon">+</span>
        <span>New Chat</span>
      </button>

      {/* ===============================
          SEARCH
      =============================== */}

      <div className="chat-search">
        <span className="search-icon">
          ⌕
        </span>

        <input
          type="text"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="Search conversations..."
          disabled={disabled}
        />

        {searchTerm && (
          <button
            className="search-clear"
            onClick={() => setSearchTerm("")}
            type="button"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* ===============================
          CHAT HISTORY HEADER
      =============================== */}

      <div className="history-header">
        <span>Conversations</span>

        <span className="history-count">
          {filteredChats.length}
        </span>
      </div>

      {/* ===============================
          CHAT HISTORY
      =============================== */}

      <div className="chat-list">
        {filteredChats.length === 0 ? (
          <div className="empty-chat-history">
            {searchTerm
              ? "No conversations found."
              : "No conversations yet."}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive =
              chat.id === selectedChatId;

            const isEditing =
              chat.id === editingChatId;

            return (
              <div
                key={chat.id}
                className={`chat-list-item ${
                  isActive ? "active" : ""
                }`}
              >
                {isEditing ? (
                  <div className="chat-rename-box">
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(event) =>
                        setEditingTitle(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) =>
                        handleRenameKeyDown(
                          event,
                          chat.id
                        )
                      }
                      maxLength={60}
                    />

                    <div className="rename-actions">
                      <button
                        type="button"
                        onClick={() =>
                          saveRename(chat.id)
                        }
                        title="Save"
                      >
                        ✓
                      </button>

                      <button
                        type="button"
                        onClick={cancelRename}
                        title="Cancel"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="chat-select-button"
                      onClick={() =>
                        onSelectChat(chat.id)
                      }
                      disabled={disabled}
                    >
                      <span className="chat-icon">
                        ◌
                      </span>

                      <span className="chat-title">
                        {chat.title}
                      </span>
                    </button>

                    <div className="chat-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startRename(chat)
                        }
                        disabled={disabled}
                        title="Rename chat"
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(chat)
                        }
                        disabled={disabled}
                        title="Delete chat"
                      >
                        🗑
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ===============================
          SIDEBAR FOOTER
      =============================== */}

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="status-dot"></span>

          <span>AI Online</span>
        </div>

        <span className="sidebar-version">
          Nova AI
        </span>
      </div>
    </aside>
  );
}

export default Sidebar;