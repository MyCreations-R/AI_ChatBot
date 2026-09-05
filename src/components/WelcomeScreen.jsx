function WelcomeScreen({ onSuggestion }) {
  const suggestions = [
    "Explain something to me",
    "Help me write some code",
    "Give me some ideas",
  ];

  return (
    <div className="welcome-screen">
      <div className="welcome-icon">✦</div>

      <h2>How can I help you today?</h2>

      <p>
        Ask me anything. I can help with coding,
        explanations, ideas, writing, and more.
      </p>

      <div className="suggestion-list">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestion?.(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default WelcomeScreen;