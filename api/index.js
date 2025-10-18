export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        console.log('=== 开始处理请求 ===');
        
        const { user_text, step } = req.body;
        console.log('请求体:', JSON.stringify(req.body, null, 2));
        
        if (!user_text) {
            return res.status(400).json({ 
                al_response: '错误: 请提供 user_text 参数' 
            });
        }
        
        const BIMUL_API_KEY = process.env.BIMUL_API_KEY;
        console.log('API Key 长度:', BIMUL_API_KEY ? BIMUL_API_KEY.length : '未设置');
        
        if (!BIMUL_API_KEY) {
            return res.status(500).json({ 
                al_response: '错误: API 密钥未配置' 
            });
        }
        const modelName = 'gemini-2.5-flash'; // 或者 'gemini-2.0-flash'
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${BIMUL_API_KEY}`;
        
        console.log('使用模型:', modelName);
        console.log('API URL:', apiUrl.replace(BIMUL_API_KEY, '***'));
        
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a warm and supportive psychological counselor. Please answer the following question in a warm and supportive manner**Keep your response under 20 words**:${user_text}`
                    }]
                }]
            })
        });
        
        console.log('Gemini API 响应状态:', geminiResponse.status);
        
        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('Gemini API 错误详情:', errorText);
            return res.status(500).json({ 
                al_response: `Gemini API 错误: ${geminiResponse.status}`,
                debug: `使用的模型: ${modelName}`
            });
        }
        
        const geminiData = await geminiResponse.json();
        console.log('Gemini API 响应成功');
        
        if (geminiData.candidates && geminiData.candidates.length > 0) {
            const responseText = geminiData.candidates[0].content.parts[0].text;
            return res.status(200).json({
                al_response: responseText
            });
        } else {
            return res.status(500).json({ 
                al_response: '错误: Gemini API 返回了空响应'
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
