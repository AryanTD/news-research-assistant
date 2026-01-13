require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const { searchNews } = require("./newsService");
const { calculate } = require("./calculatorService");
const { getWeather } = require("./weatherService");

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
  {
    name: "calculate",
    description:
      "Perform basic arithmetic calculations. Use this tool when the user asks for mathematical computations.",
    input_schema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description:
            "The mathematical expression to evaluate. Examples: '15% of 87.50', '25 * 4 + 10', '32 fahrenheit to celsius', 'sqrt(144)'",
        },
      },
      required: ["expression"],
    },
  },
  {
    name: "getWeather",
    description:
      "Get the current weather for a specific location. Use this tool when the user asks about weather conditions in a city or region.",
    input_schema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description:
            "The name of the city or location to get the weather for.",
        },
      },
      required: ["location"],
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

    let toolResult;

    if (toolUse.name === "searchNews") {
      console.log("📰 Fetching news...\n");
      const newsResults = await searchNews(toolUse.input.query);
      console.log(`✅ Found ${newsResults.length} articles\n`);
      toolResult = JSON.stringify(newsResults);
    } else if (toolUse.name === "calculate") {
      console.log("🧮 Calculating expression...\n");
      const calculation = await calculate(toolUse.input.expression);
      console.log(`✅ Calculation result: ${calculation}\n`);
      toolResult = JSON.stringify(calculation);
    } else if (toolUse.name === "getWeather") {
      console.log("🌤️ Fetching weather...\n");
      const weather = await getWeather(toolUse.input.location);
      console.log(`✅ Weather fetched: ${JSON.stringify(weather)}\n`);
      toolResult = JSON.stringify(weather);
    }

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
          content: JSON.stringify(toolResult),
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
