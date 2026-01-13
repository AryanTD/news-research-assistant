require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const { searchNews } = require("./newsService");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const tools = [
  {
    name: "searchNews",
    description:
      "Search for recent news articles about a specific topic or query. Use this when the user asks about current events, recent news, or anything happening now.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query or topic to look for in news articles.",
        },
      },
      required: ["query"],
    },
  },
];

async function askClaude(conversationHistory) {
  console.log("Asking Claude:", conversationHistory.length, "messages");

  let messages = [...conversationHistory];

  const firstResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    tools: tools,
    messages: messages,
  });
  console.log("📊 First response stop_reason:", firstResponse.stop_reason);

  if (firstResponse.stop_reason === "tool_use") {
    console.log("🔧 Claude is calling a tool");

    const toolUse = firstResponse.content.find(
      (block) => block.type === "tool_use"
    );
    console.log("Tool requested:", toolUse.name);
    console.log("Tool input:", toolUse.input);

    console.log("\n📰 Fetching news...\n");
    const newsResults = await searchNews(toolUse.input.query);
    console.log(`✅ Found ${newsResults.length} articles\n`);

    messages.push({
      role: `assistant`,
      content: firstResponse.content,
    });

    messages.push({
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(newsResults),
        },
      ],
    });

    console.log("🗨️ Sending tool results back to Claude...\n");
    const finalResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      tools: tools,
      messages: messages,
    });
    console.log("✅ Final response received!\n");
    const textContent = finalResponse.content.find(
      (block) => block.type === "text"
    );
    return textContent ? textContent.text : "I couldn't generate a response.";
  }

  const textContent = finalResponse.content.find(
    (block) => block.type === "text"
  );
  return textContent ? textContent.text : "I couldn't generate a response.";
}

module.exports = { askClaude };
