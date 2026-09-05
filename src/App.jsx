import useChatStorage from "./hooks/useChatStorage";
import useChat from "./hooks/useChat";

import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";

import "./App.css";

function App() {
  // ===============================
  // CHAT STORAGE
  // ===============================

  const {
    chats,
    loading: chatsLoading,
    error: chatsError,
    addChat,
    removeChatFromState,
    updateChatInState,
  } = useChatStorage();

  // ===============================
  // CHAT LOGIC
  // ===============================

  const {
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
  } = useChat({
    chats,
    addChat,
    removeChatFromState,
    updateChatInState,
    chatsLoading,
  });

  // ===============================
  // LOADING SCREEN
  // ===============================

  if (chatsLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading Nova AI...</p>
        </div>
      </div>
    );
  }

  // ===============================
  // MAIN UI
  // ===============================

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        disabled={loading}
      />

      <section className="main-chat">
        <ChatHeader
          chat={selectedChat}
          onClear={handleClearChat}
          disabled={loading}
          messageCount={messages.length}
        />

        {/* Error messages */}
        {(error || chatsError) && (
          <div className="error-message">
            {error || chatsError}
          </div>
        )}

        <ChatMessages
          messages={messages}
          loading={loading}
          loadingMessages={messagesLoading}
          onSuggestion={handleSuggestion}
          onRegenerate={handleRegenerate}
        />

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          onKeyDown={handleKeyDown}
          disabled={loading || !selectedChatId}
          maxLength={4000}
        />
      </section>
    </div>
  );
}

export default App;