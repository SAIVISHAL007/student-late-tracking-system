# Render.com Deployment Guide

## 🚀 Quick Deploy Steps:

### 1. Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name: `student-late-tracking-system`
4. Make it **Public** (so Render can access it)
5. Click "Create repository"

### 2. Push Your Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/student-late-tracking-system.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Render
1. **Go to**: https://render.com
2. **Sign up** with GitHub account
3. **New Web Service**
4. **Connect** your repository
5. **Configure**:
   - **Name**: student-late-tracking-system
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install; cd frontend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Auto-Deploy**: Yes

### 4. Environment Variables
Add these in Render dashboard:
- **MONGODB_URI**: `your_mongodb_atlas_connection_string`
- **NODE_ENV**: `production`
- **FRONTEND_URL**: `https://your-app-name.onrender.com` (will be provided after first deploy)

### 5. Done! 🎉
- Your app will be live at: `https://your-app-name.onrender.com`
- Share this URL with your professor
- Login credentials: faculty/pass123

## 💡 Tips:
- First deployment takes 3-5 minutes
- Render provides free SSL certificate
- App will sleep after 15 minutes of inactivity (free tier)
- Wake up time: ~30 seconds when accessed