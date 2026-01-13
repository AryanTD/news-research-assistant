const readline = require("readline");
const { askClaude } = require("./claudeService");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let conversationHistory = [];

console.log("🤖 News Research Assistant powered by Claude!");
console.log("Ask me anything about current events or recent news.");
console.log('Type "exit" to quit.\n');

function chat() {
  rl.question("You: ", async (userInput) => {
    if (userInput.toLowerCase() === "exit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    if (userInput.toLowerCase() === "clear") {
      conversationHistory = [];
      console.log("Conversation history cleared.\n");
      chat();
      return;
    }

    if (!userInput.trim()) {
      chat();
      return;
    }

    try {
      conversationHistory.push({ role: "user", content: userInput });

      const response = await askClaude(conversationHistory);

      conversationHistory.push({ role: "assistant", content: response });

      console.log(`\nAssistant: ${response}\n`);

      // Continue conversation
      chat();
    } catch (error) {
      console.error("❌ Error:", error.message);
      console.log("Let's try again.\n");
      // Continue even if there's an error
      chat();
    }
  });
}

// Start the conversation
chat();
