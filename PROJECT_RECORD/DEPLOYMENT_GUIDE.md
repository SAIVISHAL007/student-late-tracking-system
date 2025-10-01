# Deployment Guide - Making Your App Live

## Option 1: Vercel + MongoDB Atlas (FREE & RECOMMENDED)

### Step 1: Setup MongoDB Atlas (Free Database)

1. **Create MongoDB Atlas Account**
   - Go to https://mongodb.com/atlas
   - Sign up for free account
   - Create new cluster (M0 Sandbox - FREE)
   - Choose AWS/Google Cloud region closest to you

2. **Configure Database Access**
   - Database Access → Add New Database User
   - Username: `admin`, Password: `your-password` (save this!)
   - Database User Privileges: Read and write to any database

3. **Configure Network Access**
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` (Allow access from anywhere) for development
   - Click "Confirm"

4. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string (looks like):
   ```
   mongodb+srv://admin:<password>@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Prepare Backend for Deployment

1. **Update server.js for production:**
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studentLateTracking';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/students', studentRoutes);
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app; // For Vercel
```

2. **Create vercel.json in backend folder:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri"
  }
}
```

### Step 3: Deploy Backend to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy Backend:**
```bash
cd backend
vercel login
vercel
# Follow prompts:
# - Set up and deploy? Y
# - Which scope? Your account
# - Link to existing project? N
# - What's your project's name? student-tracker-backend
# - In which directory is your code? ./
# - Want to override settings? N
```

3. **Add Environment Variables:**
```bash
vercel env add MONGODB_URI
# Paste your MongoDB Atlas connection string
# Choose Production environment

vercel env add NODE_ENV
# Enter: production
# Choose Production environment
```

4. **Redeploy with environment variables:**
```bash
vercel --prod
```

### Step 4: Deploy Frontend to Vercel

1. **Update API URL in frontend/src/services/api.js:**
```javascript
import axios from "axios";

const API = axios.create({ 
  baseURL: process.env.NODE_ENV === 'production' 
    ? "https://your-backend-url.vercel.app/api"
    : "http://localhost:5000/api"
});

export default API;
```

2. **Build and Deploy Frontend:**
```bash
cd frontend
npm run build
vercel
# Follow similar prompts for frontend
```

### Step 5: Update CORS Settings

Update your backend CORS origin with your actual Vercel frontend URL:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-app.vercel.app'
  ],
  credentials: true
}));
```

## Alternative: One-Click Deployment Templates

### GitHub Repository Setup
1. Push your code to GitHub
2. Use these deployment buttons in your README:

```markdown
## Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/student-late-tracking)

## Deploy to Netlify  
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/student-late-tracking)
```

## Cost Breakdown:
- **MongoDB Atlas**: FREE (512MB storage)
- **Vercel**: FREE (100GB bandwidth, unlimited projects)
- **Custom Domain**: $10-15/year (optional)

**Total Cost: FREE for development/small projects!**

## Why Not GitHub Pages?
GitHub Pages only hosts static files (HTML/CSS/JS), but you need:
- Node.js server for backend
- Database for data storage
- API endpoints for functionality

Your app is "full-stack" so needs proper hosting with server capabilities.
```