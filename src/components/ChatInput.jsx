function ChatInput({
  value = "",
  onChange,
  onSend,
  onKeyDown,
  disabled = false,
  maxLength = 4000,
}) {
  const remainingCharacters =
    maxLength - value.length;

  return (
    <div className="input-area">
      <div className="input-box">
        <textarea
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          onKeyDown={onKeyDown}
          placeholder="Ask anything..."
          rows={1}
          disabled={disabled}
          maxLength={maxLength}
          aria-label="Message input"
        />

        <button
          type="button"
          className="send-button"
          onClick={onSend}
          disabled={
            !value.trim() || disabled
          }
          title="Send message"
        >
          ➤
        </button>
      </div>

      <div className="input-footer">
        <p className="input-hint">
          Press Enter to send • Shift +
          Enter for new line
        </p>

        {value.length > 0 && (
          <span
            className={`character-count ${
              remainingCharacters < 200
                ? "warning"
                : ""
            }`}
          >
            {remainingCharacters}
          </span>
        )}
      </div>
    </div>
  );
}

export default ChatInput;