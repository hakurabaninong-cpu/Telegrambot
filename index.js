const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// 1. Web server para sa Render.com (para hindi mag-exit early)
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

// 3. Function para tawagin ang NVIDIA Paligemma API
async function callPaligemmaAI(promptText, imageUrl = null) {
  try {
    let content = [{ type: "text", text: promptText }];
    
    if (imageUrl) {
      content.push({ type: "image_url", image_url: { url: imageUrl } });
    }

    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: "google/paligemma",
        messages: [{ role: "user", content: content }],
        max_tokens: 512,
        temperature: 0.2
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
    console.error("NVIDIA API Error:", error.response?.data || error.message);
    return "Pasensya na, nagka-error sa pagproseso ng AI.";
  }
}

// 4. Telegram Event Listeners
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Mabuhay! Handa na ang iyong AI Bot. Magpadala ng mensahe o litrato para masimulan natin.");
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  
  if (msg.text && !msg.text.startsWith('/start')) {
    bot.sendMessage(chatId, "Nag-isip ang AI...");
    const aiReply = await callPaligemmaAI(msg.text);
    bot.sendMessage(chatId, aiReply);
  }
});
