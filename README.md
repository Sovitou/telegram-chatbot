# Telegram AI Chatbot

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Sovitou/telegram-ai-bot/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/badge/node.js-18.x-green.svg)](https://nodejs.org/)

A production-ready Telegram chatbot powered by Qwen3 1.7B AI model through OpenRouter. Demos full-stack integration with real-time AI response handling, contextual awareness, and enterprise-grade error recovery.

## 🌟 Key Features

- ✅ **Qwen3 1.7B Integration** - Leverages cutting-edge AI capabilities for code generation, multi-language support, and contextual understanding
- 📜 **Contextual Awareness** - Maintains message history for coherent multi-turn conversations
- ⚡ **Real-time UX** - Shows typing indicators and delivers instant responses
- 🔄 **Live Updates** - Continuous response streaming with markdown formatting support
- 🛡 **Enterprise-Grade Error Handling** - Comprehensive error recovery with graceful fallbacks

## 🧰 Tech Stack

| Layer          | Technology                          | Purpose                                                                 |
|----------------|-------------------------------------|-------------------------------------------------------------------------|
| Framework      | Telegraf.js                         | Telegram bot implementation                                             |
| API Client     | Axios + OpenRouter                  | Secure AI model integration                                             |
| Configuration  | DotEnv                              | Environment configuration management                                    |
| AI Model       | Qwen3-1.7B                          | Large language model processing                                         |
| Architecture   | JavaScript ES6+ Modules             | Modular, maintainable codebase                                          |
| Operations     | Node.js 18+                         | High-performance runtime environment                                    |

## 🧪 Installation Guide

```bash
# Clone repository
git clone https://github.com/Sovitou/telegram-ai-bot.git
cd telegram-ai-bot

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API credentials
```

## 🚀 Live Demo

1. [Sign up for OpenRouter API key](https://openrouter.dev)
2. Set your API credentials in `.env`
3. Start the bot: `node bot.js`
4. Chat with your AI assistant in Telegram

## 🛠 Maintenance Guide

- **Error Monitoring**: Check console logs for transparent error tracing
- **Model Updates**: Modify `model` field in API request parameters
- **Context Management**: Adjust `messageHistory` storage strategy for custom use cases
- **Performance Tuning**: Control response length via `max_tokens` parameter


## 🧾 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Maintained with ❤️ by Khem Sovitou
