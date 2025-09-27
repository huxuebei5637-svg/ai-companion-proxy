const systemInstruction = "你是一位大学心理辅导员和AI导师，你的目标是通过温暖、支持性和非批判性的方式，利用户的焦虑提供深度感知。实用的建议，请保持你的回答在3mm中"

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).send("Method Not Allowed");
        return;
    }
    
    try {
        const { user_text, step } = req.body;
        const BIMUL_API_KEY = process.env.BIMUL_API_KEY;
        
        if (!user_text || !BIMUL_API_KEY) {
            return res.status(400).json({
                al_response: 'API配置错误，请检查Key和请求值'
            });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${BIMUL_API_KEY}`;

        // 使用 fetch 代替 axios
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `系统指令: ${systemInstruction}\n用户输入: ${user_text}\n步骤: ${step}`
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        
        // 处理 Gemini API 响应
        const generatedText = data.candidates[0].content.parts[0].text;
        
        res.status(200).json({
            al_response: generatedText
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            al_response: '请求处理过程中出现错误'
        });
    }
}
