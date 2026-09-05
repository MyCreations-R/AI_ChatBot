import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import WelcomeScreen from "./WelcomeScreen";

function ChatMessages({
  messages = [],
  loading = false,
  loadingMessages = false,
  onSuggestion,
  onRegenerate,
}) {
  const messagesEndRef = useRef(null);

  // ===============================
  // AUTO SCROLL
  // ===============================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ===============================
  // LOADING CONVERSATION
  // ===============================

  if (loadingMessages) {
    return (
      <main className="chat-container">
        <div className="loading-messages">
          <div className="loading-spinner"></div>

          <p>Loading conversation...</p>
        </div>
      </main>
    );
  }

  // ===============================
  // EMPTY CHAT
  // ===============================

  if (messages.length === 0) {
    return (
      <main className="chat-container">
        <WelcomeScreen
          onSuggestion={onSuggestion}
        />
      </main>
    );
  }

  // ===============================
  // MESSAGES
  // ===============================

  return (
    <main className="chat-container">
      <div className="messages">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRegenerate={onRegenerate}
          />
        ))}

        {/* AI TYPING INDICATOR */}

        {loading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </main>
  );
}

export default ChatMessages;