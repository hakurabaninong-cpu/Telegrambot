const axios = require('axios');

async function callPaligemmaAI(promptText, imageUrl) {
  try {
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: "google/paligemma",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
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
    return "Nagka-error sa pagproseso ng AI.";
  }
}
