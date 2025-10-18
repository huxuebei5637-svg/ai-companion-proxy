// --- 第一部分：拿到HTML里的工具，并准备好“对话笔记本” ---
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let conversationHistory = [];


function sendMessage() {
    const userMessageText = userInput.value.trim();
    if (userMessageText === '') {
        return;
    }
    displayMessage(userMessageText, 'user');
    conversationHistory.push({ sender: 'user', text: userMessageText });
    userInput.value = '';
    getAiResponse(userMessageText);
}

// --- 第三部分：定义在屏幕上显示带头像消息的函数 ---
function displayMessage(text, sender) {
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper');
    if (sender === 'user') {
        messageWrapper.classList.add('user-message-wrapper');
    } else {
        messageWrapper.classList.add('ai-message-wrapper');
    }

    const avatar = document.createElement('img');
    avatar.classList.add('avatar');
    if (sender === 'user') {
        avatar.src = 'user_avatar.png';
    } else {
        avatar.src = 'ai_avatar.png';
    }

    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.textContent = text;

    messageWrapper.appendChild(avatar);
    messageWrapper.appendChild(messageText);
    chatBox.appendChild(messageWrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
}


// --- 第四部分：【最终正确版本】和你的 Vercel 后端沟通 ---
async function getAiResponse(userMessage) {
    const backendUrl = 'https://ai-companion-proxy.vercel.app/api/';

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_text: userMessage }),
        });

        const data = await response.json();

        if (data && data.al_response) {
            const aiReply = data.al_response;
            displayMessage(aiReply, 'ai');
            conversationHistory.push({ sender: 'ai', text: aiReply });
        } else {
            const errorMessage = data.error || '后端返回了未知格式的数据';
            displayMessage(`Something Wrong: ${errorMessage}`, 'ai');
            console.error('后端返回的数据:', data);
        }

    } catch (error) {
        console.error('连接后端时出错:', error);
        displayMessage('Sorry, there was an error connecting to the backend server', 'ai');
    }
}


// --- 第五部分：让按钮和回车键生效 ---
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
// ... userInput 和 sendBtn 的定义之后 ...

// 新增：监听输入框的输入事件
userInput.addEventListener('input', () => {
    if (userInput.value.trim() !== '') {
        sendBtn.disabled = false; // 如果有内容，启用按钮
    } else {
        sendBtn.disabled = true;  // 如果没内容，禁用按钮
    }
});

// 【这是 sendMessage 函数的最终正确版本】
function sendMessage() {
    // 1. 首先，从输入框获取用户输入的内容
    const userMessageText = userInput.value.trim();

    // 2. 如果是空的，就什么也不做
    if (userMessageText === '') {
        return;
    }

    // 3. 【关键】立刻调用 displayMessage，把你自己的话说的话显示出来！
    displayMessage(userMessageText, 'user');
    
    // 4. 把你的话记录到“笔记本”里
    conversationHistory.push({ sender: 'user', text: userMessageText });

    // 5. 清空输入框
    userInput.value = '';
    
    // 6. 禁用按钮，防止重复发送
    sendBtn.disabled = true; 

    // 7. 最后，才去调用后端获取AI的回复
    getAiResponse(userMessageText);
}

// --- 第六部分：页面加载后，自动显示AI的欢迎消息 ---
window.addEventListener('load', () => {
    const welcomeMessage = "Hello! How can I assist you today?";
    displayMessage(welcomeMessage, 'ai');
    conversationHistory.push({ sender: 'ai', text: welcomeMessage });
});