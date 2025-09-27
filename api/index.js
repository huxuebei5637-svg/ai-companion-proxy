import axios from 'axios';

const systemInstruction = "你是一位大学心理辅导员和AI导师，你的目标是通过温暖、支持性和非批判性的方式，对用户的描述提供深思熟虑的、实用的建议。请保持你的回答在300字以内。";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(404).send("Not Found");
        return;
    }
    
    try {
        const { user_text, step } = req.body;
        const ENHUI_API_KEY = process.env.ENHUI_API_KEY;
        
        if (!user_text || !ENHUI_API_KEY) {
            return res.status(400).json({ 
                ai_response: 'API配置错误，请检查Key和请求值' 
            });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${ENHUI_API_KEY}`;
        
        const payload = {
            contents: [{
                parts: [{ text: user_text }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300
            }
        };

        const response = await axios.post(apiUrl, payload);
        const aiResponse = response.data.candidates[0].content.parts[0].text.trim();
        
        res.status(200).json({ ai_response: aiResponse });
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            ai_response: '服务器错误，请稍后重试' 
        });
    }
}
