# Backend Code - Essential Parts

## 1. Main Server Configuration (server.js)
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/studentLateTracking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/students', studentRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

## 2. Student Data Model (models/student.js)
```javascript
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year']
  },
  lateDays: {
    type: Number,
    default: 0,
    min: 0
  },
  fines: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Regular', 'Warning', 'Critical', 'Suspended'],
    default: 'Regular'
  },
  gracePeriodUsed: { type: Number, default: 0 },
  limitExceeded: { type: Boolean, default: false },
  lateLogs: [{
    date: { type: Date, default: Date.now },
    fineAmount: { type: Number, default: 0 }
  }]
}, {
  timestamps: true
});

// Performance Indexes
studentSchema.index({ rollNo: 1 });
studentSchema.index({ year: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ name: 'text' });

module.exports = mongoose.model('Student', studentSchema);
```

## 3. Key API Routes (routes/studentRoutes.js)
```javascript
const express = require('express');
const Student = require('../models/student');
const router = express.Router();

// Get all students with search/filter
router.get('/', async (req, res) => {
  try {
    const { search, year, status, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } }
      ];
    }
    if (year && year !== 'All') query.year = year;
    if (status && status !== 'All') query.status = status;

    const students = await Student.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .maxTimeMS(30000);

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Roll number already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Mark student as late (Key Algorithm)
router.patch('/:id/mark-late', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Increment late days
    student.lateDays += 1;

    // Calculate fine (Progressive: ₹10 × lateDays²)
    const newFine = student.lateDays > 3 ? 10 * Math.pow(student.lateDays - 3, 2) : 0;
    student.fines += newFine;

    // Update status based on late days
    if (student.lateDays <= 3) {
      student.status = 'Regular';
      student.gracePeriodUsed = student.lateDays;
    } else if (student.lateDays <= 7) {
      student.status = 'Warning';
    } else if (student.lateDays <= 15) {
      student.status = 'Critical';
    } else {
      student.status = 'Suspended';
      student.limitExceeded = true;
    }

    // Add to late logs
    student.lateLogs.push({
      date: new Date(),
      fineAmount: newFine
    });

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
```

## 4. Package Dependencies (package.json)
```json
{
  "name": "student-late-tracking-backend",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^6.10.0",
    "cors": "^2.8.5"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```