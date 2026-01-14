const API_URL = "http://localhost:3000/api";
const sessionId = "web-session-" + Date.now();

const chatContainer = document.getElementById("chatContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const status = document.getElementById("status");

// Add message to chat
function addMessage(role, content) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.textContent = content;

  messageDiv.appendChild(contentDiv);
  chatContainer.appendChild(messageDiv);

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send message to API
async function sendMessage() {
  const message = userInput.value.trim();

  if (!message) return;

  // Add user message to chat
  addMessage("user", message);
  userInput.value = "";

  // Disable input while processing
  sendBtn.disabled = true;
  userInput.disabled = true;
  status.textContent = "Claude is thinking...";
  status.className = "status loading";

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Add assistant response to chat
    addMessage("assistant", data.response);
    status.textContent = "";
  } catch (error) {
    console.error("Error:", error);
    addMessage("system", `Error: ${error.message}`);
    status.textContent = "";
  } finally {
    // Re-enable input
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }
}

// Clear conversation
async function clearConversation() {
  if (!confirm("Clear conversation history?")) return;

  try {
    await fetch(`${API_URL}/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });

    chatContainer.innerHTML = "";
    addMessage("system", "Conversation cleared");
  } catch (error) {
    console.error("Error clearing conversation:", error);
  }
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
clearBtn.addEventListener("click", clearConversation);

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Welcome message
addMessage(
  "system",
  "Ask me anything about news, weather, calculations, or general knowledge!"
);
