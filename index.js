const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Telegram Gemini Video Editor Bot is Running!');
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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callGeminiAI(promptText) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Pasensya na, may suliranin sa pagproseso ng Gemini AI.";
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Mabuhay! Handa na ang iyong Gemini Video Editor Bot.");
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if (msg.text && !msg.text.startsWith('/start')) {
    bot.sendMessage(chatId, "Nag-isip ang AI...");
    const aiReply = await callGeminiAI(msg.text);
    if (aiReply && aiReply.trim() !== "") {
      bot.sendMessage(chatId, aiReply);
    } else {
      bot.sendMessage(chatId, "Pasensya na, walang naibalik na sagot ang AI.");
    }
  }
});
