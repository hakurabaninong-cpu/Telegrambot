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

// 2. Initialize Telegram Bot na may polling settings para iwas 409 Conflict
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: { timeout: 10 }
  } 
});

// 3. Function para tawagin ang Mistral Large 4 sa pamamagitan ng NVIDIA API
async function callMistralAI(promptText) {
  try {
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: "mistralai/mistral-large-4-1t-a52b",
        messages: [
          {
            role: "user",
            content: promptText
          }
        ],
        max_tokens: 512, // Binabaan ko nang kaunti para mas bumilis ang pag-generate
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

// Isang malinis at pinag-isang message handler na lang (tinanggal ang dobleng code)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  
  if (msg.text && !msg.text.startsWith('/start')) {
    bot.sendMessage(chatId, "Nag-isip ang AI...");
    const aiReply = await callMistralAI(msg.text);
    
    // Siguraduhing may laman ang aiReply bago i-send sa Telegram para iwas 400 Bad Request
    if (aiReply && aiReply.trim() !== "") {
      bot.sendMessage(chatId, aiReply);
    } else {
      bot.sendMessage(chatId, "Pasensya na, walang naibalik na sagot ang AI.");
    }
  }
});
