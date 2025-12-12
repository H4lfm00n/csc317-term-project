# Deployment Guide for OrbitCart

## ⚠️ Important Note

**Netlify Limitations:**
- SQLite file storage doesn't persist in serverless functions
- Sessions may have issues with serverless architecture
- Better suited for static sites

**Recommended Alternatives:**
- **Render.com** (Free tier, perfect for Node.js apps)
- **Railway.app** (Easy deployment, $5/month free credit)
- **Vercel** (Good Node.js support)

## Netlify Deployment (If you still want to use it)

### Prerequisites
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Deploy to Netlify:**
   ```bash
   netlify deploy
   ```
   For production:
   ```bash
   netlify deploy --prod
   ```

3. **Or connect via GitHub:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build settings:
     - Build command: `npm install`
     - Publish directory: `public`
     - Functions directory: `netlify/functions`

### Environment Variables
Set these in Netlify Dashboard → Site settings → Environment variables:
- `SESSION_SECRET` - A random secret string for sessions
- `NODE_ENV` - Set to `production`

## Render.com Deployment (Recommended)

1. Go to [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add environment variable:
   - `SESSION_SECRET` - Random secret string

Render will automatically:
- Build and deploy your app
- Provide a free HTTPS URL
- Handle database persistence (SQLite will work)

## Railway.app Deployment

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Node.js and deploys
5. Add environment variable:
   - `SESSION_SECRET` - Random secret string

Railway provides:
- Free $5/month credit
- Persistent storage for SQLite
- Automatic HTTPS

