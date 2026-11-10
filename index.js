const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// 1. Web server para sa Render.com
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Telegram AI Bot is Running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 2. Initialize Telegram Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// 3. Function para tawagin ang Mistral Large 4 sa pamamagitan ng NVIDIA API
async function callMistralAI(promptText) {
  try {
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: "mistralai/mistral-large-4-1t-a52b", // <-- Ginamit ang exact model ID mula sa iyong snippet
        messages: [
          {
            role: "user",
            content: promptText
          }
        ],
        max_tokens: 1024,
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("NVIDIA API Error:", error.response ? error.response.data : error.message);
    return "Pasensya na, nagka-error sa pagproseso ng AI.";
  }
}

// 4. Telegram Event Listeners
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Mabuhay! Handa na ang iyong Mistral AI Bot. Magpadala ng mensahe.");
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  
  if (msg.text && !msg.text.startsWith('/start')) {
    bot.sendMessage(chatId, "Nag-isip ang AI...");
    const aiReply = await callMistralAI(msg.text);
    bot.sendMessage(chatId, aiReply);
  }
});
