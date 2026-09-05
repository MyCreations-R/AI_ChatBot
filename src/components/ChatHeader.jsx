function ChatHeader({
  chat,
  onClear,
  disabled = false,
  messageCount = 0,
}) {
  return (
    <header className="chat-header">
      <div className="chat-header-info">
        <div className="chat-header-avatar">
          ✦
        </div>

        <div className="chat-header-details">
          <h1>
            {chat?.title || "Nova AI"}
          </h1>

          <p>
            <span className="online-dot"></span>
            AI Assistant
          </p>
        </div>
      </div>

      <div className="chat-header-actions">
        <span className="message-count">
          {messageCount > 0
            ? `${messageCount} ${
                messageCount === 1
                  ? "message"
                  : "messages"
              }`
            : ""}
        </span>

        <button
          type="button"
          onClick={onClear}
          disabled={
            disabled ||
            messageCount === 0
          }
          title="Clear conversation"
        >
          Clear
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;