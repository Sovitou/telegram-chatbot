import { Telegraf } from "telegraf";
import { configDotenv } from "dotenv";
import axios from "axios";

configDotenv();
const bot = new Telegraf(process.env.HTTP_API);

// Map to store user message histories
const userMessageHistories = new Map();

// Function to escape special characters for MarkdownV2
const escapeMarkdownV2 = (text) => {
  const specialChars = [
    "_",
    "*",
    "[",
    "]",
    "(",
    ")",
    "~",
    "`",
    ">",
    "#",
    "+",
    "-",
    "=",
    "|",
    "{",
    "}",
    ".",
    "!",
  ];
  let escapedText = text;
  specialChars.forEach((char) => {
    escapedText = escapedText.replace(
      new RegExp(`\\${char}`, "g"),
      `\\${char}`
    );
  });
  return escapedText;
};

// Function to sanitize and format message for MarkdownV2
const sanitizeMessage = (text) => {
  // Split message into parts (code blocks and regular text)
  const parts = text.split(/(```[\s\S]*?```)/g);
  const sanitizedParts = parts.map((part) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      // Handle code block
      const codeContent = part.slice(3, -3).trim();
      const languageMatch = codeContent.match(/^(\w+)\n/);
      const language = languageMatch ? languageMatch[1] : "";
      const code = language
        ? codeContent.slice(language.length + 1)
        : codeContent;
      return `\`\`\`${language}\n${escapeMarkdownV2(code)}\n\`\`\``;
    }
    // Escape regular text
    return escapeMarkdownV2(part);
  });
  return sanitizedParts.join("");
};

bot.start((ctx) => {
  userMessageHistories.delete(ctx.message.from.id);
  const startMessage = escapeMarkdownV2(
    `🚀 Hello! I'm powered by Qwen3 1.7B and ready to help you on Telegram.\n` +
      `🧠 Model features: Contextual understanding, Code generation, Multi-language support\n\n` +
      `Type any message to get started!`
  );
  ctx.reply(startMessage, { parse_mode: "MarkdownV2" });
});

// Enhanced text message handler with Qwen3 integration
bot.on("text", async (ctx) => {
  try {
    const userId = ctx.message.from.id;
    const userMessage = ctx.message.text;

    await ctx.sendChatAction("typing");

    // Initialize message history with system message if empty
    if (!userMessageHistories.has(userId)) {
      userMessageHistories.set(userId, [
        {
          role: "system",
          content:
            "You are Qwen3 1.7B, a powerful AI developed by Tongyi Lab. " +
            "Provide clear, concise, and accurate responses with proper formatting. Your role is a Telegram bot assistant. " +
            "Use code blocks for code suggestions and maintain a helpful tone. Offer suggestions for the user.",
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

    // Log the full API response for debugging
    console.log("OpenRouter API Response:", JSON.stringify(response.data, null, 2));

    // Extract AI response and update message history
    const aiMessage = response.data.choices?.[0]?.message;
    if (aiMessage && aiMessage.content) {
      messageHistory.push(aiMessage);
      userMessageHistories.set(userId, messageHistory);

      // Sanitize and format the AI response
      const sanitizedContent = sanitizeMessage(aiMessage.content.trim());
      // Create the enhanced message with footer
      const footer = escapeMarkdownV2(
        `\n--------------------\n\nThank you for using my AI Chatbot, @khem_sovitou 😊`
      );
      const enhancedMessage = `${sanitizedContent}${footer}`;

      // Log the message for debugging
      console.log("Sending message:", enhancedMessage);

      // Check message length (Telegram limit: 4096 characters)
      if (enhancedMessage.length > 4096) {
        const truncatedMessage = enhancedMessage.slice(0, 4090) + "...";
        await ctx.reply(truncatedMessage, {
          parse_mode: "MarkdownV2",
          disable_web_page_preview: true,
        });
      } else {
        await ctx.sendChatAction("typing");
        await ctx.reply(enhancedMessage, {
          parse_mode: "MarkdownV2",
          disable_web_page_preview: true,
        });
      }
    } else {
      console.warn("Invalid API response structure:", response.data);
      await ctx.reply(
        escapeMarkdownV2(
          `🤔 Hmm, I couldn't process the AI response. Please try again or simplify your request!`
        ),
        { parse_mode: "MarkdownV2" }
      );
    }
  } catch (error) {
    console.error("Qwen3 API Error:", error.message, error.response?.data);
    const errorMessage = escapeMarkdownV2(
      `⚠️ I'm currently unavailable. Let me suggest:\n` +
        `- Check your Qwen3 connection status\n` +
        `- Verify API configuration in .env\n` +
        `- Ensure model hosting service is running\n` +
        `Error details: ${error.message}`
    );
    await ctx.reply(errorMessage, {
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    });
  }
});

bot.launch();

["exit", "SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log("Bot shutting down...");
    bot.stop(signal);
  });
});