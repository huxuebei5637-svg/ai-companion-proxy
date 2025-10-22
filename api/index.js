export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { user_text } = req.body; 

        if (!user_text) {
            return res.status(400).json({ 
                al_response: '错误: 请提供 user_text 参数' 
            });
        }
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
            return res.status(500).json({ 
                al_response: '错误: OpenAI API 密钥未配置' 
            });
        }

        const apiUrl = 'https://api.openai.com/v1/chat/completions';
        const modelName = 'gpt-4o';
        const smartSystemPrompt = `
You are a warm and supportive psychological counselor.

Your default response style is brief and supportive, under 20 words.

HOWEVER, you must analyze the user's message for negative emotions. 
If the user mentions feeling sad, depressed, hopeless, crying, mentions medication, or expresses any form of significant distress, you MUST change your style. 

In those specific cases, you must:
1.  Respond with extra warmth, care, and meticulousness.
2.  Fully validate their feelings.
3.  Gently offer support.
4.  You can (and should) ignore the 20-word limit to provide a proper, supportive response.
`;
        
        const payload = {
            model: modelName,
            messages: [
                {
                    role: "system",
                    content: smartSystemPrompt 
                },
                {
                    role: "user",
                    content: user_text
                }
            ]
        };

        const openAiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!openAiResponse.ok) {
            const errorText = await openAiResponse.text();
            return res.status(500).json({ 
                al_response: `OpenAI API 错误: ${openAiResponse.status}`
            });
        }

        const openAiData = await openAiResponse.json();

        if (openAiData.choices && openAiData.choices.length > 0) {
            const responseText = openAiData.choices[0].message.content;
            return res.status(200).json({
                al_response: responseText
            });
        } else {
            return res.status(500).json({ 
                al_response: '错误: OpenAI API 返回了空响应' 
            });
        }

    } catch (error) {
        console.error('全局错误:', error);
        return res.status(500).json({ 
            al_response: '服务器内部错误',
            error: error.message 
        });
    }
}
