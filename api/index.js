import axios from 'axios';

// System instruction to define the AI's role
const systemInstruction = "你是一位专业的大学心理辅导员和 AI 导师。你的目标是以温暖、支持性和非批判性的方式，对用户的疑虑提供深思熟虑的、实用的建议。请保持你的回答在 300 字以内。";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).send('Not Found.');
    return;
  }

  try {
    const { user_text, step } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!user_text || !GEMINI_API_KEY) {
        return res.status(400).json({ ai_response: 'API配置错误，请检查Key和请求体。' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: user_text }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    };

    // Use axios to make the API call
    const response = await axios.post(apiUrl, payload);

    const aiResponse = response.data.candidates[0].content.parts[0].text.trim();

    // Send the structured response back to Qualtrics
    res.status(200).json({
      ai_response: aiResponse // This maps to the 'ai_response' in Qualtrics Response Mapping
    });

  } catch (error) {
    console.error('API Error:', error.message);
    let errorMessage = "无法连接到AI服务，请检查Vercel日志。";
    if (error.response && error.response.status === 400) {
        errorMessage = "API Key或请求格式错误。";
    }
    res.status(500).json({ ai_response: errorMessage });
  }
}
