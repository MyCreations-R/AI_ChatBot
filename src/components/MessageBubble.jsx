import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { formatTime } from "../utils/chatUtils";

function MessageBubble({
  message,
  onRegenerate,
}) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";

  // ===============================
  // COPY MESSAGE
  // ===============================

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(
        message.content
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // ===============================
  // COPY CODE
  // ===============================

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error("Code copy failed:", error);
    }
  };

  return (
    <div
      className={`message-row ${
        isUser ? "user" : "assistant"
      }`}
    >
      {/* ===============================
          AVATAR
      =============================== */}

      <div className="avatar">
        {isUser ? "You" : "AI"}
      </div>

      {/* ===============================
          MESSAGE CONTENT
      =============================== */}

      <div className="message-content">
        <div className="message">
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                code({
                  inline,
                  className,
                  children,
                  ...props
                }) {
                  const language =
                    className
                      ?.replace("language-", "")
                      .trim() || "";

                  const code = String(children).replace(
                    /\n$/,
                    ""
                  );

                  // Inline code
                  if (inline) {
                    return (
                      <code
                        className="inline-code"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  // Code block
                  return (
                    <div className="code-block">
                      <div className="code-header">
                        <span>
                          {language || "Code"}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            copyCode(code)
                          }
                          title="Copy code"
                        >
                          Copy
                        </button>
                      </div>

                      <pre>
                        <code
                          className={className || ""}
                          {...props}
                        >
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* ===============================
            MESSAGE META
        =============================== */}

        <div className="message-meta">
          <span className="message-time">
            {formatTime(message.timestamp)}
          </span>

          <div className="message-actions">
            {/* Copy message */}

            <button
              type="button"
              onClick={copyMessage}
              title="Copy message"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>

            {/* Regenerate AI response */}

            {!isUser && onRegenerate && (
              <button
                type="button"
                onClick={() =>
                  onRegenerate(message.id)
                }
                title="Regenerate response"
              >
                ↻ Regenerate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;