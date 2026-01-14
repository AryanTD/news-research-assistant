require("dotenv").config();
const { searchNews } = require("../services/newsService");

async function test() {
  console.log("Testing searchNews function...\n");

  const articles = await searchNews("bitcoin"); // Try a different search!

  console.log(`Found ${articles.length} articles about bitcoin\n`);
  console.log("First article:", articles[0].title);
}

test();
