# Student Late Tracking System - Project Record

## Project Overview
A full-stack web application for tracking student attendance and managing late arrivals with automated fine calculation.

## Technology Stack
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Session-based faculty login

## Key Features
1. Faculty authentication system
2. Student registration and management
3. Late arrival tracking with progressive fines
4. Export functionality (CSV/Text)
5. Search and filter capabilities
6. Performance-optimized database queries

## Project Structure
```
StudentLateTrackingSystem/
├── backend/
│   ├── server.js              # Main server file
│   ├── models/student.js      # Student data model
│   └── routes/studentRoutes.js # API endpoints
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/api.js    # API configuration
│   │   └── utils/             # Utility functions
│   └── public/                # Static files
└── PROJECT_RECORD/            # Essential code for record
```

## Database Schema
- Student collection with fields: rollNo, name, year, lateDays, fines, status
- Indexed for performance optimization
- Automatic fine calculation based on late days

## Key Algorithms
1. **Progressive Fine System**: ₹10 × (lateDays)²
2. **Grace Period**: 3 free late days per student
3. **Status Management**: Regular → Warning → Critical → Suspended

## Installation & Setup
1. Install Node.js and MongoDB
2. Backend: `npm install` → `npm start`
3. Frontend: `npm install` → `npm start`
4. Access at http://localhost:3000

---
*This is a simplified version containing only essential code components for academic record purposes.*