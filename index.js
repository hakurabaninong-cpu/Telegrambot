const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Telegram Bot is Running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: { timeout: 10 }
  } 
});

async function callGeminiDirect(promptText) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: "Ikaw ay isang matalinong Telegram Video Editor AI Assistant. Tulungan ang user na mag-isip ng magandang screentext, font styles, at mga opinyon sa pag-e-edit ng video.\n\nUser: " + promptText }]
          }
        ]
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
    return "Pasensya na, nagka-error sa pagproseso ng AI.";
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Mabuhay! Handa na ang iyong Video Editor Bot.");
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if (msg.text && !msg.text.startsWith('/start')) {
    bot.sendMessage(chatId, "Nag-isip ang AI...");
    const aiReply = await callGeminiDirect(msg.text);
    if (aiReply && aiReply.trim() !== "") {
      bot.sendMessage(chatId, aiReply);
    } else {
      bot.sendMessage(chatId, "Pasensya na, walang naibalik na sagot ang AI.");
    }
  }
});
