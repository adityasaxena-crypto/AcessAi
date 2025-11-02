# 🤖 aiAssistant - Multi-AI Chat Platform

A modern web application that lets you chat with multiple AI models simultaneously, featuring real-time streaming responses, dark mode, and a clean interface.

## ✨ Features

- 🔄 **Real-time Streaming**: Get responses as they're generated
- 🌙 **Dark Mode**: Beautiful dark theme with system detection
- 📱 **Responsive Design**: Works on desktop and mobile
- 🤖 **Multiple AI Models**: Mistral AI, GLM (Z.AI), and Ollama Cloud models
- 📊 **Vertical Tabs**: Organized interface for models, responses, and history
- ⚡ **Fast Performance**: Optimized for speed and reliability

## 🚀 Quick Deploy

### Option 1: Heroku (Recommended)
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Option 2: Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Option 3: One-Click Script
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🛠️ Manual Setup

### Prerequisites
- Python 3.11+
- Git
- API keys for AI services

### Installation
```bash
# Clone repository
git clone <your-repo-url>
cd aiAssistant

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run locally
python app.py
```

### Environment Variables
Create a `.env` file with:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
GLM_API_KEY=your_glm_api_key_here
OLLAMA_API_KEY=your_ollama_api_key_here
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t aiassistant .
docker run -p 5000:5000 --env-file .env aiassistant
```

## 🌐 Deployment Platforms

| Platform | Difficulty | Cost | Features |
|----------|------------|------|----------|
| **Heroku** | Easy | Free tier | Auto-scaling, easy setup |
| **Railway** | Easy | $5/month | Modern, fast deployment |
| **Render** | Easy | Free tier | Auto-deploy from Git |
| **Google Cloud** | Medium | Pay-as-go | Enterprise features |
| **DigitalOcean** | Medium | $5/month | VPS control |
| **AWS/Azure** | Hard | Variable | Full cloud features |

## 📱 Supported AI Models

### Core Models
- **Mistral AI**: General-purpose, excellent reasoning
- **GLM (Z.AI)**: Advanced language understanding

### Ollama Cloud Models
- **DeepSeek V3.1** (671B): Advanced reasoning specialist
- **GPT-OSS** (20B/120B): Open-source alternatives
- **Kimi K2** (1T): Large context specialist
- **Qwen3 Coder** (480B): Code generation expert
- **GLM 4.6**: Latest GLM model

## 🔧 Configuration

### API Keys Setup
1. **Mistral AI**: Get key from [console.mistral.ai](https://console.mistral.ai)
2. **GLM (Z.AI)**: Register at [z.ai](https://z.ai)
3. **Ollama Cloud**: Sign up at [ollama.com](https://ollama.com)

### Customization
- Modify `templates/` for UI changes
- Update `static/js/chat.js` for functionality
- Edit `app.py` for backend logic

## 🚀 Production Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set MISTRAL_API_KEY=your_key
heroku config:set GLM_API_KEY=your_key
heroku config:set OLLAMA_API_KEY=your_key
git push heroku main
```

### Railway
1. Connect GitHub repo at [railway.app](https://railway.app)
2. Add environment variables
3. Deploy automatically

### Google Cloud
```bash
gcloud app deploy
```

## 🔒 Security

- API keys stored as environment variables
- CORS enabled for frontend integration
- Input validation and sanitization
- Rate limiting recommended for production

## 📊 Monitoring

- Built-in error handling
- Streaming response tracking
- Chat history management
- Model performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@aiassistant.com
- 💬 Discord: [Join our community](https://discord.gg/aiassistant)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🎯 Roadmap

- [ ] Voice input/output
- [ ] File upload support
- [ ] Team collaboration features
- [ ] Custom model integration
- [ ] Mobile app
- [ ] API access

---

Made with ❤️ by the aiAssistant team