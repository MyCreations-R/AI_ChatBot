function TypingIndicator() {
  return (
    <div className="message-row assistant">
      <div className="avatar">AI</div>

      <div className="message-content">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;