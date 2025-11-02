from flask import Flask, render_template, request, jsonify, Response, stream_template
from flask_cors import CORS
import os
import requests
from mistralai.client import MistralClient
import json
import threading
import time
from dotenv import load_dotenv

# Load environment variables (only if .env file exists)
try:
    load_dotenv()
except:
    pass  # In production, environment variables are set by the platform

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

@app.route('/')
def index():
    # Redirect directly to chat instead of landing page
    from flask import redirect, url_for
    return redirect(url_for('chat'))

@app.route('/landing')
def landing():
    # Optional landing page route for those who want to see it
    return render_template('index_new.html')

# API Keys from environment variables
MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')
GLM_API_KEY = os.getenv('GLM_API_KEY')
OLLAMA_API_KEY = os.getenv('OLLAMA_API_KEY')
OPENROUTER_API_KEY_1 = os.getenv('OPENROUTER_API_KEY_1', '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')
OPENROUTER_API_KEY_2 = os.getenv('OPENROUTER_API_KEY_2', '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')

# Check if API keys are loaded
if not MISTRAL_API_KEY:
    print("Warning: MISTRAL_API_KEY not found in environment variables")
if not GLM_API_KEY:
    print("Warning: GLM_API_KEY not found in environment variables")
if not OLLAMA_API_KEY:
    print("Warning: OLLAMA_API_KEY not found in environment variables")
if not OPENROUTER_API_KEY_1:
    print("Warning: OPENROUTER_API_KEY_1 not found in environment variables")
if not OPENROUTER_API_KEY_2:
    print("Warning: OPENROUTER_API_KEY_2 not found in environment variables")

def query_mistral(message):
    """Query Mistral AI API"""
    if not MISTRAL_API_KEY:
        return "Error: Mistral API key not configured"
    
    try:
        client = MistralClient(api_key=MISTRAL_API_KEY)
        chat_response = client.chat(
            model="mistral-medium-latest",
            messages=[{"role": "user", "content": message}]
        )
        return chat_response.choices[0].message.content
    except Exception as e:
        return f"Error querying Mistral: {str(e)}"

def query_glm(message):
    """Query GLM (Z.AI) API"""
    if not GLM_API_KEY:
        return "Error: GLM API key not configured"
    
    try:
        url = 'https://api.z.ai/api/paas/v4/chat/completions'
        headers = {
            'Content-Type': 'application/json',
            'Authorization': GLM_API_KEY
        }
        data = {
            "model": "GLM-4.5-Flash",
            "messages": [{"role": "user", "content": message}],
            "thinking": {"type": "enabled"},
            "max_tokens": 4096,
            "temperature": 1.0
        }
        response = requests.post(url, headers=headers, data=json.dumps(data))
        if response.status_code == 200:
            result = response.json()
            return result.get('choices', [{}])[0].get('message', {}).get('content', 'No response from GLM')
        else:
            return f"Error querying GLM: {response.text}"
    except Exception as e:
        return f"Error querying GLM: {str(e)}"

OLLAMA_MODELS = {
    'deepseek-v3.1:671b-cloud': 'DeepSeek V3.1 (671B)',
    'gpt-oss:20b-cloud': 'GPT-OSS (20B)',
    'gpt-oss:120b-cloud': 'GPT-OSS (120B)',
    'kimi-k2:1t-cloud': 'Kimi K2 (1T)',
    'qwen3-coder:480b-cloud': 'Qwen3 Coder (480B)',
    'glm-4.6:cloud': 'GLM 4.6'
}

OPENROUTER_MODELS = {
    'nvidia/nemotron-nano-12b-v2-vl:free': 'NVIDIA Nemotron Nano (Vision)',
    'minimax/minimax-m2:free': 'MiniMax M2'
}

def query_ollama(message, model_name):
    """Query specific Ollama Cloud model"""
    if not OLLAMA_API_KEY:
        return "Error: Ollama API key not configured"
    
    try:
        # Try using requests for HTTP-based API first
        url = 'https://ollama.com/api/chat'
        headers = {
            'Authorization': f'Bearer {OLLAMA_API_KEY}',
            'Content-Type': 'application/json'
        }
        data = {
            "model": model_name,
            "messages": [{"role": "user", "content": message}],
            "stream": False
        }

        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            result = response.json()
            return result.get('message', {}).get('content', 'No response from model')
        else:
            # Fallback: return a message indicating the API might not be available
            return f"Error querying {OLLAMA_MODELS.get(model_name, model_name)}: API may require additional configuration."

    except Exception as e:
        return f"Error querying {OLLAMA_MODELS.get(model_name, model_name)}: {str(e)}"

def query_openrouter_nemotron(message):
    """Query NVIDIA Nemotron Nano model via OpenRouter"""
    if not OPENROUTER_API_KEY_1:
        return "Error: OpenRouter API key 1 not configured"
    
    try:
        url = 'https://openrouter.ai/api/v1/chat/completions'
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {OPENROUTER_API_KEY_1}'
        }
        data = {
            "model": "nvidia/nemotron-nano-12b-v2-vl:free",
            "messages": [{"role": "user", "content": message}]
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            result = response.json()
            return result.get('choices', [{}])[0].get('message', {}).get('content', 'No response from NVIDIA Nemotron')
        else:
            return f"Error querying NVIDIA Nemotron: {response.text}"
    except Exception as e:
        return f"Error querying NVIDIA Nemotron: {str(e)}"

def query_openrouter_minimax(message):
    """Query MiniMax M2 model via OpenRouter"""
    if not OPENROUTER_API_KEY_2:
        return "Error: OpenRouter API key 2 not configured"
    
    try:
        url = 'https://openrouter.ai/api/v1/chat/completions'
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {OPENROUTER_API_KEY_2}'
        }
        data = {
            "model": "minimax/minimax-m2:free",
            "messages": [{"role": "user", "content": message}]
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            result = response.json()
            return result.get('choices', [{}])[0].get('message', {}).get('content', 'No response from MiniMax M2')
        else:
            return f"Error querying MiniMax M2: {response.text}"
    except Exception as e:
        return f"Error querying MiniMax M2: {str(e)}"

@app.route('/chat')
def chat():
    return render_template('chat_new.html')

@app.route('/query', methods=['POST'])
def query_apis():
    data = request.get_json()
    message = data.get('message', '')
    models = data.get('models', {})
    stream = data.get('stream', False)

    if stream:
        return Response(stream_responses(message, models), mimetype='text/plain')
    
    results = {}

    # Handle different model formats (from chat interface vs direct API calls)
    if isinstance(models, dict):
        # New format from chat interface
        if models.get('mistral'):
            results['mistral'] = query_mistral(message)

        if models.get('glm'):
            results['glm'] = query_glm(message)

        # Handle Ollama models - each can be individually selected
        for model_key in OLLAMA_MODELS.keys():
            if models.get(f'ollama_{model_key}'):
                results[f'ollama_{model_key}'] = query_ollama(message, model_key)
            elif models.get(model_key):  # Direct model name format
                results[model_key] = query_ollama(message, model_key)
        
        # Handle OpenRouter models
        if models.get('openrouter_nemotron'):
            results['openrouter_nemotron'] = query_openrouter_nemotron(message)
        
        if models.get('openrouter_minimax'):
            results['openrouter_minimax'] = query_openrouter_minimax(message)
    else:
        # Old format (array) for backward compatibility
        if 'mistral' in models:
            results['mistral'] = query_mistral(message)

        if 'glm' in models:
            results['glm'] = query_glm(message)

        if 'ollama' in models:
            results['ollama'] = query_ollama(message)

    return jsonify(results)

def stream_responses(message, models):
    """Stream responses from multiple models as they complete"""
    import concurrent.futures
    import queue
    
    result_queue = queue.Queue()
    
    def query_model(model_key):
        try:
            if model_key == 'mistral':
                result = query_mistral(message)
            elif model_key == 'glm':
                result = query_glm(message)
            elif model_key.startswith('ollama_'):
                actual_model = model_key.replace('ollama_', '')
                result = query_ollama(message, actual_model)
            elif model_key == 'openrouter_nemotron':
                result = query_openrouter_nemotron(message)
            elif model_key == 'openrouter_minimax':
                result = query_openrouter_minimax(message)
            else:
                result = f"Unknown model: {model_key}"
            
            result_queue.put({
                'model': model_key,
                'response': result,
                'status': 'complete'
            })
        except Exception as e:
            result_queue.put({
                'model': model_key,
                'response': f"Error: {str(e)}",
                'status': 'error'
            })
    
    # Start all model queries in parallel
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        
        if isinstance(models, dict):
            for model_key, enabled in models.items():
                if enabled:
                    futures.append(executor.submit(query_model, model_key))
        
        # Yield results as they complete
        completed = 0
        total = len(futures)
        
        while completed < total:
            try:
                result = result_queue.get(timeout=30)  # Increased timeout
                yield f"data: {json.dumps(result)}\n\n"
                completed += 1
            except queue.Empty:
                # Send a heartbeat to keep connection alive
                yield f"data: {json.dumps({'status': 'processing'})}\n\n"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)
