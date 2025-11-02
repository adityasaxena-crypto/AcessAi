document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submitBtn');
    const userInput = document.getElementById('userInput');
    const resultsGrid = document.getElementById('resultsGrid');
    const loading = document.getElementById('loading');

    // Model display names
    const MODEL_NAMES = {
        'mistral': 'Mistral AI (Medium Latest)',
        'glm': 'GLM (Z.AI) 4.5 Flash',
        'ollama_deepseek-v3.1:671b-cloud': 'DeepSeek V3.1 (671B)',
        'ollama_gpt-oss:20b-cloud': 'GPT-OSS (20B)',
        'ollama_gpt-oss:120b-cloud': 'GPT-OSS (120B)',
        'ollama_kimi-k2:1t-cloud': 'Kimi K2 (1T)',
        'ollama_qwen3-coder:480b-cloud': 'Qwen3 Coder (480B)',
        'ollama_glm-4.6:cloud': 'GLM 4.6'
    };

    submitBtn.addEventListener('click', sendQuery);

    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendQuery();
        }
    });

    async function sendQuery() {
        const message = userInput.value.trim();
        if (!message) {
            alert('Please enter a question or message.');
            return;
        }

        // Get selected models
        const selectedModels = {};

        // Check core models
        if (document.getElementById('mistral').checked) selectedModels.mistral = true;
        if (document.getElementById('glm').checked) selectedModels.glm = true;

        // Check Ollama models
        if (document.getElementById('ollama_deepseek-v3.1:671b-cloud').checked) selectedModels['ollama_deepseek-v3.1:671b-cloud'] = true;
        if (document.getElementById('ollama_gpt-oss:20b-cloud').checked) selectedModels['ollama_gpt-oss:20b-cloud'] = true;
        if (document.getElementById('ollama_gpt-oss:120b-cloud').checked) selectedModels['ollama_gpt-oss:120b-cloud'] = true;
        if (document.getElementById('ollama_kimi-k2:1t-cloud').checked) selectedModels['ollama_kimi-k2:1t-cloud'] = true;
        if (document.getElementById('ollama_qwen3-coder:480b-cloud').checked) selectedModels['ollama_qwen3-coder:480b-cloud'] = true;
        if (document.getElementById('ollama_glm-4.6:cloud').checked) selectedModels['ollama_glm-4.6:cloud'] = true;

        if (Object.keys(selectedModels).length === 0) {
            alert('Please select at least one AI model.');
            return;
        }

        // Show loading
        loading.style.display = 'block';
        resultsGrid.innerHTML = '';

        try {
            const response = await fetch('/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    models: selectedModels
                })
            });

            const results = await response.json();

            // Hide loading
            loading.style.display = 'none';

            // Display results
            displayResults(results);

        } catch (error) {
            loading.style.display = 'none';
            resultsGrid.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
        }
    }

    function displayResults(results) {
        resultsGrid.innerHTML = '';

        Object.keys(results).forEach(modelKey => {
            if (results[modelKey]) {
                const card = document.createElement('div');
                card.className = 'result-card';

                const modelName = MODEL_NAMES[modelKey] || modelKey;

                card.innerHTML = `
                    <h3>${modelName}</h3>
                    <p>${results[modelKey]}</p>
                `;

                resultsGrid.appendChild(card);
            }
        });

        // Scroll to results
        resultsGrid.scrollIntoView({ behavior: 'smooth' });
    }
});
