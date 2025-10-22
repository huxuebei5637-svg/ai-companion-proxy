const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const finishBtn = document.getElementById('finish-btn');

let conversationHistory = [];

function sendMessage() {
    const userMessageText = userInput.value.trim();
    if (userMessageText === '') {
        return;
    }

    displayMessage(userMessageText, 'user');
    
    conversationHistory.push({ sender: 'user', text: userMessageText });
    
    userInput.value = '';
    sendBtn.disabled = true; 
    
    getAiResponse();
}

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

async function getAiResponse() {
    const backendUrl = '/api/';
    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: conversationHistory }),
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


sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

userInput.addEventListener('input', () => {
    if (userInput.value.trim() !== '') {
        sendBtn.disabled = false; 
    } else {
        sendBtn.disabled = true;  
    }
});

window.addEventListener('load', () => {
    const welcomeMessage = "Hello! How can I assist you today?";
    displayMessage(welcomeMessage, 'ai');
    conversationHistory.push({ sender: 'ai', text: welcomeMessage });
});

finishBtn.addEventListener('click', () => {
    const chatLog = JSON.stringify(conversationHistory);
    window.parent.postMessage(chatLog, '*');
    alert("Conversation saved! Please click the arrow button to continue.");
    userInput.disabled = true;
    sendBtn.disabled = true;
    finishBtn.disabled = true;
    userInput.placeholder = "The conversation has ended.";
});
