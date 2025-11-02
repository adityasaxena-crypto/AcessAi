# aiAssistant Deployment Guide

## 🚀 Deployment Options

### 1. **Heroku (Easiest - Free Tier Available)**

#### Prerequisites:
- Git installed
- Heroku CLI installed
- Heroku account

#### Steps:
```bash
# 1. Install Heroku CLI (if not installed)
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
heroku login

# 3. Create a new Heroku app
heroku create your-aiassistant-app

# 4. Set environment variables
heroku config:set MISTRAL_API_KEY=your_mistral_api_key_here
heroku config:set GLM_API_KEY=your_glm_api_key_here
heroku config:set OLLAMA_API_KEY=your_ollama_api_key_here

# 5. Deploy
git add .
git commit -m "Deploy aiAssistant"
git push heroku main
```

**Your app will be available at:** `https://your-aiassistant-app.herokuapp.com`

---

### 2. **Railway (Modern & Fast)**

#### Steps:
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard:
   - `MISTRAL_API_KEY`
   - `GLM_API_KEY` 
   - `OLLAMA_API_KEY`
4. Deploy automatically

---

### 3. **Render (Free Tier)**

#### Steps:
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `gunicorn app:app`
6. Add environment variables

---

### 4. **Google Cloud Platform**

#### Prerequisites:
- Google Cloud account
- gcloud CLI installed

#### Steps:
```bash
# 1. Initialize gcloud
gcloud init

# 2. Create new project
gcloud projects create your-aiassistant-project

# 3. Set project
gcloud config set project your-aiassistant-project

# 4. Deploy
gcloud app deploy
```

**Note:** Edit `app.yaml` with your API keys before deploying.

---

### 5. **DigitalOcean App Platform**

#### Steps:
1. Go to [DigitalOcean](https://cloud.digitalocean.com)
2. Create new App
3. Connect GitHub repository
4. Set environment variables
5. Deploy

---

## 🔧 Local Development

```bash
# 1. Clone repository
git clone your-repo-url
cd aiAssistant

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# 4. Run locally
python app.py
```

## 📝 Environment Variables Required

- `MISTRAL_API_KEY`: Your Mistral AI API key
- `GLM_API_KEY`: Your GLM (Z.AI) API key  
- `OLLAMA_API_KEY`: Your Ollama Cloud API key

## 🌐 Custom Domain (Optional)

After deployment, you can add a custom domain:

### Heroku:
```bash
heroku domains:add yourdomain.com
```

### Other platforms:
Check their documentation for custom domain setup.

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Consider rate limiting for production use

## 📊 Monitoring

Most platforms provide built-in monitoring. You can also add:
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Uptime monitoring (UptimeRobot)

## 💰 Cost Estimates

- **Heroku**: Free tier available, paid plans from $7/month
- **Railway**: $5/month for hobby plan
- **Render**: Free tier available, paid from $7/month
- **Google Cloud**: Pay-as-you-go, typically $5-20/month
- **DigitalOcean**: $5/month minimum

Choose based on your budget and requirements!