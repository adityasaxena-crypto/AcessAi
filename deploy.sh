#!/bin/bash

echo "🚀 aiAssistant Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

echo "Choose deployment platform:"
echo "1) Heroku"
echo "2) Railway" 
echo "3) Render"
echo "4) Google Cloud"
echo "5) Local development setup"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🔧 Setting up Heroku deployment..."
        
        # Check if Heroku CLI is installed
        if ! command -v heroku &> /dev/null; then
            echo "❌ Heroku CLI not found. Please install it first:"
            echo "https://devcenter.heroku.com/articles/heroku-cli"
            exit 1
        fi
        
        read -p "Enter your app name: " app_name
        read -p "Enter your Mistral API key: " mistral_key
        read -p "Enter your GLM API key: " glm_key
        read -p "Enter your Ollama API key: " ollama_key
        
        heroku create $app_name
        heroku config:set MISTRAL_API_KEY=$mistral_key
        heroku config:set GLM_API_KEY=$glm_key
        heroku config:set OLLAMA_API_KEY=$ollama_key
        
        git add .
        git commit -m "Deploy to Heroku"
        git push heroku main
        
        echo "✅ Deployed to Heroku!"
        echo "🌐 Your app: https://$app_name.herokuapp.com"
        ;;
        
    2)
        echo "🔧 Railway deployment..."
        echo "1. Go to https://railway.app"
        echo "2. Connect your GitHub repository"
        echo "3. Add environment variables in dashboard"
        echo "4. Deploy automatically"
        ;;
        
    3)
        echo "🔧 Render deployment..."
        echo "1. Go to https://render.com"
        echo "2. Create new Web Service"
        echo "3. Connect GitHub repo"
        echo "4. Set build: pip install -r requirements.txt"
        echo "5. Set start: gunicorn app:app"
        ;;
        
    4)
        echo "🔧 Google Cloud deployment..."
        if ! command -v gcloud &> /dev/null; then
            echo "❌ gcloud CLI not found. Please install it first."
            exit 1
        fi
        
        read -p "Enter project ID: " project_id
        gcloud config set project $project_id
        gcloud app deploy
        ;;
        
    5)
        echo "🔧 Setting up local development..."
        
        if [ ! -f ".env" ]; then
            cp .env.example .env
            echo "📝 Created .env file. Please edit it with your API keys."
        fi
        
        pip install -r requirements.txt
        echo "✅ Dependencies installed!"
        echo "🚀 Run: python app.py"
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo "🎉 Setup complete!"