require("dotenv").config();

const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testClaude() {
  console.log("Calling Claude...");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    temperature: 0,
    messages: [
      { role: "user", content: "Say hi and introduce Antropic in a sentence." },
    ],
  });

  console.log("Claude response:", message);
}

testClaude();
