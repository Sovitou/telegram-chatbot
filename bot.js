import { Telegraf } from "telegraf";
import { configDotenv } from "dotenv";
import axios from "axios";

configDotenv();
const bot = new Telegraf(process.env.HTTP_API);

const userMessageHistories = new Map();

bot.start((ctx) => {
  userMessageHistories.delete(ctx.message.from.id);
  ctx.reply(
    `🚀 Hello! I'm powered by Qwen3 1.7B and ready to help you on Telegram.` +
      `\n🧠 Model features: Contextual understanding, Code generation, Multi-language support` +
      `\n\nType any message to get started!`
  );
});

// Enhanced text message handler with Qwen3 integration
bot.on("text", async (ctx) => {
  try {
    const userId = ctx.message.from.id;
    const userMessage = ctx.message.text;

    const userState = {
      lastMessageTime: 0,
      requestCount: 0,
      recentRequests: [],
    };

    await ctx.sendChatAction("typing");

    // Initialize message history with system message if empty
    if (!userMessageHistories.has(userId)) {
      userMessageHistories.set(userId, [
        {
          role: "system",
          content:
            "You are Qwen3 1.7B, a powerful AI developed by Tongyi Lab. " +
            "Provide clear, concise, and accurate responses with proper formatting. " +
            "Use code blocks for code suggestions and maintain a helpful tone.",
        },
      ]);
    }

    // Get current user history and add new message
    const messageHistory = userMessageHistories.get(userId);
    messageHistory.push({ role: "user", content: userMessage });

    // Prepare Qwen3 API call for OpenRouter
    const response = await axios.post(
      process.env.QWEN3_API_ENDPOINT ||
        "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "qwen/qwen3-1.7b:free",
        messages: messageHistory,
        temperature: 0.8,
        max_tokens: 4096,
        top_p: 0.8,
        frequency_penalty: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.OPENROUTER_REFERRER ||
            "https://github.com/Sovitou/telegram-chatbot",
          "X-Title": process.env.OPENROUTER_APP_NAME || "Telegram-AI-Bot",
        },
        timeout: 30000,
      }
    );

    // Extract AI response and update message history
    const aiMessage = response.data.choices?.[0]?.message;
    if (aiMessage) {
      messageHistory.push(aiMessage);
      userMessageHistories.set(userId, messageHistory);

      const enhancedMessage = `
      Qwen3 Response:\n--------------------\n${aiMessage.content.trim()}\n--------------------\nYou can ask for clarification, examples, or dive deeper!😊\n
      `.trim();

      await ctx.sendChatAction("typing");
      await ctx.reply(enhancedMessage, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      });
    } else {
      throw new Error(
        "🤔 Hmm, I couldn't process that response. Let me try again!"
      );
    }
  } catch (error) {
    console.error("Qwen3 API Error:", error);
    await ctx.reply(
      "⚠️ I'm currently unavailable. Let me suggest: " +
        `\n- Check your Qwen3 connection status` +
        `\n- Verify API configuration in .env` +
        `\n- Ensure model hosting service is running`,
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.launch();

["exit", "SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log("Bot shutting down...");
    bot.stop(signal);
  });
});
