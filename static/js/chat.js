// Theme management
const themeToggle = document.getElementById('theme-toggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

// Check for saved theme preference or default to 'light' mode
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
    themeToggleLightIcon.classList.remove('hidden');
} else {
    themeToggleDarkIcon.classList.remove('hidden');
}

themeToggle.addEventListener('click', function () {
    // Toggle icons
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');

    // Toggle dark mode
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
});

// Tab management
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => {
            btn.classList.remove('active', 'border-primary', 'text-primary', 'bg-primary/10');
            btn.classList.add('text-gray-600', 'dark:text-gray-400', 'border-transparent');
        });
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.remove('text-gray-600', 'dark:text-gray-400', 'border-transparent');
        button.classList.add('active', 'border-primary', 'text-primary', 'bg-primary/10');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Model names for display
const MODEL_NAMES = {
    'mistral': 'Mistral AI',
    'glm': 'GLM (Z.AI)',
    'ollama_deepseek-v3.1:671b-cloud': 'DeepSeek V3.1 (671B)',
    'ollama_gpt-oss:20b-cloud': 'GPT-OSS (20B)',
    'ollama_gpt-oss:120b-cloud': 'GPT-OSS (120B)',
    'ollama_kimi-k2:1t-cloud': 'Kimi K2 (1T)',
    'ollama_qwen3-coder:480b-cloud': 'Qwen3 Coder (480B)',
    'ollama_glm-4.6:cloud': 'GLM 4.6'
};

// Model icons for display
const MODEL_ICONS = {
    'mistral': '🤖',
    'glm': '✍️',
    'ollama_deepseek-v3.1:671b-cloud': '🧠',
    'ollama_gpt-oss:20b-cloud': '💬',
    'ollama_gpt-oss:120b-cloud': '🚀',
    'ollama_kimi-k2:1t-cloud': '⭐',
    'ollama_qwen3-coder:480b-cloud': '💻',
    'ollama_glm-4.6:cloud': '🔥'
};

// Chat functionality
let selectedModels = ['mistral', 'glm'];
let messageHistory = [];
let streamingEnabled = true;

// DOM elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const selectedCount = document.getElementById('selected-count');
const streamToggle = document.getElementById('stream-toggle');
const liveResponses = document.getElementById('live-responses');
const chatHistory = document.getElementById('chat-history');

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    updateSelectedCount();
    setupEventListeners();
});

function setupEventListeners() {
    // Send message
    sendButton.addEventListener('click', sendMessage);

    // Enter key to send
    messageInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Model selection
    document.querySelectorAll('.model-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const modelKey = this.dataset.model;
            if (this.checked && !selectedModels.includes(modelKey)) {
                selectedModels.push(modelKey);
            } else if (!this.checked && selectedModels.includes(modelKey)) {
                selectedModels = selectedModels.filter(m => m !== modelKey);
            }
            updateSelectedCount();
        });
    });

    // Stream toggle
    streamToggle.addEventListener('click', function () {
        streamingEnabled = !streamingEnabled;
        this.textContent = streamingEnabled ? 'Streaming ON' : 'Streaming OFF';
        this.classList.toggle('bg-primary', streamingEnabled);
        this.classList.toggle('bg-gray-500', !streamingEnabled);
    });

    // New chat
    document.getElementById('new-chat-btn').addEventListener('click', clearChat);
}

function updateSelectedCount() {
    selectedCount.textContent = `${selectedModels.length} model${selectedModels.length !== 1 ? 's' : ''} selected`;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    if (selectedModels.length === 0) {
        alert('Please select at least one AI model.');
        return;
    }

    // Add user message
    displayMessage('user', message);
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // Add to history
    messageHistory.push({ user: 'user', text: message, timestamp: new Date() });
    updateChatHistory();

    if (streamingEnabled) {
        await sendStreamingMessage(message);
    } else {
        await sendBatchMessage(message);
    }
}

async function sendStreamingMessage(message) {
    // Clear live responses
    liveResponses.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-sm streaming-indicator">Waiting for responses...</p>';

    // Switch to responses tab
    document.querySelector('[data-tab="responses"]').click();

    const modelsToUse = selectedModels.reduce((acc, model) => {
        acc[model] = true;
        return acc;
    }, {});

    try {
        const response = await fetch('/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                models: modelsToUse,
                stream: true
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        displayStreamingResponse(data);
                        displayMessage('ai', data.response, [data.model]);

                        // Add to history
                        messageHistory.push({
                            user: 'ai',
                            text: data.response,
                            model: data.model,
                            timestamp: new Date()
                        });
                    } catch (e) {
                        console.error('Error parsing streaming data:', e);
                    }
                }
            }
        }

        updateChatHistory();
    } catch (error) {
        console.error('Streaming error:', error);
        displayMessage('ai', 'Sorry, there was an error processing your request. Please try again.', ['error']);
    }
}

async function sendBatchMessage(message) {
    const modelsToUse = selectedModels.reduce((acc, model) => {
        acc[model] = true;
        return acc;
    }, {});

    try {
        const response = await fetch('/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                models: modelsToUse,
                stream: false
            })
        });

        const results = await response.json();

        // Display responses
        Object.keys(results).forEach(modelKey => {
            if (results[modelKey]) {
                displayMessage('ai', results[modelKey], [modelKey]);
                messageHistory.push({
                    user: 'ai',
                    text: results[modelKey],
                    model: modelKey,
                    timestamp: new Date()
                });
            }
        });

        updateChatHistory();
    } catch (error) {
        console.error('Batch error:', error);
        displayMessage('ai', 'Sorry, there was an error processing your request. Please try again.', ['error']);
    }
}

function displayStreamingResponse(data) {
    const modelName = MODEL_NAMES[data.model] || data.model;
    const modelIcon = MODEL_ICONS[data.model] || '🤖';

    // Update live responses
    if (liveResponses.querySelector('.streaming-indicator')) {
        liveResponses.innerHTML = '';
    }

    const responseDiv = document.createElement('div');
    responseDiv.className = 'p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-primary';
    responseDiv.innerHTML = `
        <div class="flex items-center mb-2">
            <span class="text-lg mr-2">${modelIcon}</span>
            <span class="font-semibold text-gray-900 dark:text-white">${modelName}</span>
            <span class="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                ${data.status === 'complete' ? 'Complete' : 'Processing...'}
            </span>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${data.response}</p>
    `;

    liveResponses.appendChild(responseDiv);
}

function displayMessage(sender, text, models = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message flex space-x-4';

    if (sender === 'user') {
        messageDiv.className += ' justify-end';
        messageDiv.innerHTML = `
            <div class="max-w-xs lg:max-w-md xl:max-w-lg">
                <div class="bg-primary text-white rounded-lg rounded-br-sm px-4 py-2">
                    <p class="text-sm">${text}</p>
                </div>
            </div>
        `;
    } else {
        const modelName = models.length === 1 ? MODEL_NAMES[models[0]] : 'AI Assistant';
        const modelIcon = models.length === 1 ? MODEL_ICONS[models[0]] : '🤖';

        messageDiv.innerHTML = `
            <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                    <span class="text-sm">${modelIcon}</span>
                </div>
            </div>
            <div class="flex-1 max-w-xs lg:max-w-md xl:max-w-lg">
                <div class="flex items-center mb-1">
                    <span class="font-semibold text-gray-900 dark:text-white text-sm">${modelName}</span>
                </div>
                <div class="bg-white dark:bg-gray-700 rounded-lg rounded-bl-sm px-4 py-3 border border-gray-200 dark:border-gray-600">
                    <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${text}</p>
                </div>
            </div>
        `;
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateChatHistory() {
    chatHistory.innerHTML = '';

    if (messageHistory.length === 0) {
        chatHistory.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-sm">Your conversation history will appear here...</p>';
        return;
    }

    messageHistory.forEach(msg => {
        const historyItem = document.createElement('div');
        historyItem.className = 'p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2';

        const modelName = msg.model ? MODEL_NAMES[msg.model] : '';
        const timeStr = msg.timestamp ? msg.timestamp.toLocaleTimeString() : '';

        historyItem.innerHTML = `
            <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-semibold ${msg.user === 'user' ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}">${msg.user === 'user' ? 'You' : modelName}</span>
                <span class="text-xs text-gray-400">${timeStr}</span>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">${msg.text.substring(0, 100)}${msg.text.length > 100 ? '...' : ''}</p>
        `;

        chatHistory.appendChild(historyItem);
    });
}

function clearChat() {
    messagesContainer.innerHTML = `
        <div class="text-center py-12">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl">💬</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to aiAssistant!</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">Select AI models from the sidebar and start chatting. Responses will stream in real-time.</p>
        </div>
    `;
    messageHistory = [];
    messageInput.value = '';
    liveResponses.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-sm">Responses will appear here as they stream in...</p>';
    updateChatHistory();
}