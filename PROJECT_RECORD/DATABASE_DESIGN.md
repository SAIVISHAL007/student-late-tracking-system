# Database Design & Setup

## MongoDB Schema Design

### Student Collection Structure
```javascript
{
  _id: ObjectId,
  rollNo: String (unique, required),
  name: String (required),
  year: String (enum: ['1st Year', '2nd Year', '3rd Year', '4th Year']),
  lateDays: Number (default: 0),
  fines: Number (default: 0),
  status: String (enum: ['Regular', 'Warning', 'Critical', 'Suspended']),
  gracePeriodUsed: Number (default: 0),
  limitExceeded: Boolean (default: false),
  lateLogs: [{
    date: Date,
    fineAmount: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Performance Indexes
```javascript
// Single field indexes
db.students.createIndex({ "rollNo": 1 })        // Unique lookup
db.students.createIndex({ "year": 1 })          // Filter by year
db.students.createIndex({ "status": 1 })        // Filter by status

// Text search index
db.students.createIndex({ "name": "text" })     // Name search

// Compound indexes for complex queries
db.students.createIndex({ "year": 1, "status": 1 })
```

## Sample Data
```javascript
// Regular student
{
  "rollNo": "CS001",
  "name": "John Doe",
  "year": "2nd Year",
  "lateDays": 2,
  "fines": 0,
  "status": "Regular",
  "gracePeriodUsed": 2,
  "limitExceeded": false
}

// Warning student
{
  "rollNo": "CS002", 
  "name": "Jane Smith",
  "year": "3rd Year",
  "lateDays": 5,
  "fines": 40,
  "status": "Warning",
  "gracePeriodUsed": 3,
  "limitExceeded": false
}

// Critical student
{
  "rollNo": "CS003",
  "name": "Mike Johnson", 
  "year": "1st Year",
  "lateDays": 10,
  "fines": 490,
  "status": "Critical",
  "gracePeriodUsed": 3,
  "limitExceeded": false
}
```

## Database Connection
```javascript
// MongoDB connection with optimization
mongoose.connect('mongodb://localhost:27017/studentLateTracking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

## Query Examples
```javascript
// Find all warning students
db.students.find({ "status": "Warning" })

// Search students by name
db.students.find({ "name": { $regex: "john", $options: "i" } })

// Get students with high fines
db.students.find({ "fines": { $gt: 100 } })

// Count students by year
db.students.aggregate([
  { $group: { _id: "$year", count: { $sum: 1 } } }
])
```