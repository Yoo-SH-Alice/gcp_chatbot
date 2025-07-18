document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    const appendMessage = (sender, message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // 스크롤을 항상 아래로
    };

    const sendMessage = async () => {
        const message = userInput.value.trim();
        if (message === '') return;

        appendMessage('user', message);
        userInput.value = ''; // 입력창 비우기

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });

            const data = await response.json();
            if (!response.ok) {
                // 서버에서 반환한 오류 메시지를 직접 표시
                appendMessage('bot', `오류: ${data.error || '알 수 없는 서버 오류'}`);
                console.error('Server error:', data.error);
            } else {
                appendMessage('bot', data.response);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            appendMessage('bot', '죄송합니다. 네트워크 오류 또는 서버 응답을 처리할 수 없습니다.');
        }
    };

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});