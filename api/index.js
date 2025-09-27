import { GoogleGenAI } from '@google/genai';

// Initialize the GoogleGenAI instance.
// It automatically looks for the GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

// System instruction to define the AI's role
const systemInstruction = "你是一位专业的大学心理辅导员和 AI 导师。你的目标是以温暖、支持性和非批判性的方式，对用户的疑虑提供深思熟虑的、实用的建议。请保持你的回答在 300 字以内。";

export default async function handler(req, res) {
  // Only process POST requests from Qualtrics
  if (req.method !== 'POST') {
    res.status(404).send('Not Found. This is an API endpoint for POST requests.');
    return;
  }

  try {
    // Qualtrics sends user_text and step in the request body
    const { user_text, step } = req.body;

    if (!user_text) {
      return res.status(400).json({ error: 'Missing user_text in request body.' });
    }

    // Define the chat history (initial message)
    let history = [
      {
        role: "user",
        parts: [{ text: user_text }],
      }
    ];

    // Call the Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    // Extract the AI response
    const aiResponse = response.text.trim();

    // Send the structured response back to Qualtrics
    res.status(200).json({
      ai_response: aiResponse // This maps to the 'ai_response' in Qualtrics Response Mapping
    });

  } catch (error) {
    // Log the error for debugging in Vercel Logs
    console.error('Gemini API Error:', error.message);
    // Send a generic error response back to Qualtrics
    res.status(500).json({ ai_response: `API 内部错误: ${error.message}` });
  }
}
