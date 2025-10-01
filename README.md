# 🎓 Student Late Tracking System

A comprehensive full-stack application for tracking student attendance with advanced features including late day limits, grace periods, and fine management.

## 🚀 Features

- **📝 Student Registration & Late Marking** - Quick student enrollment and attendance tracking
- **⏰ Daily Late Reports** - View all students who were late today
- **📊 Comprehensive Analytics** - Weekly, monthly, and semester reports
- **🎯 Smart Limit System** - 10-day limit + 4-day grace period + ₹5 fines
- **⚙️ Admin Management** - Semester promotion, data reset, and system statistics
- **🎨 Professional UI** - Modern sidebar navigation with responsive design

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express framework
- **MongoDB** with Mongoose ODM
- **CORS** enabled for cross-origin requests
- **dotenv** for environment management

### Frontend
- **React** with hooks and modern JavaScript
- **Axios** for API communication
- **CSS-in-JS** styling approach
- **Responsive design** with animations

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account or local MongoDB
- Git for version control

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Start the server:
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

### Frontend Setup
```bash
cd frontend
npm install
npm start      # Starts on http://localhost:3000
```

## 🔧 API Endpoints

### Student Management
- `POST /api/students/mark-late` - Mark student as late
- `GET /api/students/late-today` - Get today's late students
- `GET /api/students/records/:period` - Get attendance records

### Admin Operations
- `POST /api/students/promote-semester` - Promote all students
- `POST /api/students/reset-all-data` - Reset late data
- `DELETE /api/students/student/:rollNo` - Delete specific student
- `GET /api/students/system-stats` - Get system statistics

### Health Monitoring
- `GET /health` - Server health check
- `GET /api/students/health` - Database connectivity check

## 🚨 Troubleshooting Common Issues

### MongoDB Timeout Errors
If you see `Operation buffering timed out after 10000ms`:

1. **Check Network Connection**
   ```bash
   # Test API health
   curl http://localhost:5000/health
   ```

2. **Verify MongoDB URI**
   - Ensure MONGO_URI in `.env` is correct
   - Check MongoDB Atlas network access settings
   - Verify database user permissions

3. **Connection Improvements Applied**
   - ✅ Increased timeout settings (30-45 seconds)
   - ✅ Disabled mongoose buffering
   - ✅ Added connection pooling
   - ✅ Implemented retry logic
   - ✅ Added graceful shutdown handling

### Database Connection Issues
```bash
# Check if MongoDB is accessible
node -e "console.log(require('dotenv').config()); require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('✅ Connected')).catch(console.error)"
```

### Frontend API Errors
- Verify backend server is running on port 5000
- Check browser console for detailed error messages
- Ensure CORS is properly configured

## 🎯 Key Improvements Made

### Backend Optimizations
- **Enhanced Error Handling** - Detailed error messages with proper HTTP status codes
- **Request Validation** - Input sanitization and validation middleware
- **Connection Management** - Improved MongoDB connection with pooling and timeouts
- **Query Optimization** - Added `.lean()` for better performance and query timeouts
- **Health Monitoring** - Health check endpoints for system monitoring

### Frontend Enhancements
- **Better Error UX** - User-friendly error messages with actionable feedback
- **Request Timeouts** - 15-45 second timeouts for different operations
- **Loading States** - Visual feedback during operations
- **Input Validation** - Client-side validation before API calls

### System Architecture
- **Graceful Shutdown** - Proper cleanup on server termination
- **Connection Resilience** - Automatic reconnection and retry logic
- **Performance Monitoring** - Server health and database connectivity checks

## 📊 Business Logic

### Late Day System
1. **Normal Period** (1-10 days) - Standard tracking
2. **Grace Period** (11-14 days) - 4 additional days without fines
3. **Fine Period** (15+ days) - ₹5 per day after grace period

### Admin Operations
- **Semester Promotion** - Increment semester, reset late data
- **Data Reset** - Clear attendance data for testing
- **Individual Management** - Delete specific students
- **System Statistics** - Real-time analytics

## 🔐 Security Features
- Input validation and sanitization
- MongoDB injection protection
- CORS configuration
- Environment variable protection

## 🚀 Production Deployment
- Use `npm start` for production backend
- Build frontend with `npm run build`
- Configure proper MongoDB Atlas network settings
- Set appropriate environment variables

## 👨‍💻 Developer
**Chelluri Sai Vishal**
- Built with modern React and Node.js
- Optimized for educational institution use
- Designed for scalability and maintainability

---

💡 **Need Help?** Check the health endpoints first, then review error messages for specific guidance!