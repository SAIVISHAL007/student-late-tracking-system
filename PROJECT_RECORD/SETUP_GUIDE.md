# Installation & Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (Node Package Manager)

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm init -y
npm install express mongoose cors
npm install -D nodemon
```

### 2. Create Directory Structure
```
backend/
├── server.js
├── models/
│   └── student.js
├── routes/
│   └── studentRoutes.js
└── package.json
```

### 3. Start MongoDB Service
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 4. Run Backend Server
```bash
npm start
# or for development
npm run dev
```

## Frontend Setup

### 1. Create React App
```bash
npx create-react-app frontend
cd frontend
npm install axios
```

### 2. Create Directory Structure
```
frontend/src/
├── components/
│   ├── Login.js
│   ├── StudentForm.js
│   ├── LateList.js
│   └── Navbar.js
├── services/
│   └── api.js
├── utils/
│   ├── auth.js
│   └── exportUtils.js
└── App.js
```

### 3. Run Frontend
```bash
npm start
```

## Environment Configuration

### Backend (.env file)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studentLateTracking
NODE_ENV=development
```

### Frontend Environment
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Testing the Application

### 1. Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

### 2. Login Credentials
- Username: faculty, Password: pass123
- Username: admin, Password: admin123
- Username: teacher, Password: teacher123

### 3. API Testing
```bash
# Test student creation
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"rollNo":"CS001", "name":"John Doe", "year":"2nd Year"}'

# Test student retrieval
curl http://localhost:5000/api/students
```

## Production Deployment

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Environment Variables
```bash
export NODE_ENV=production
export PORT=80
export MONGODB_URI=mongodb://your-mongo-url
```

### 3. Start Production Server
```bash
cd backend
npm start
```

## Troubleshooting

### Common Issues
1. **MongoDB Connection Error**: Ensure MongoDB service is running
2. **Port Already in Use**: Change PORT in backend/.env
3. **CORS Issues**: Verify backend cors configuration
4. **Module Not Found**: Run `npm install` in respective directories

### Performance Tips
1. Use MongoDB indexes for faster queries
2. Implement pagination for large datasets
3. Use React.memo for component optimization
4. Enable gzip compression in production