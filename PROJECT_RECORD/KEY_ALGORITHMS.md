# Key Algorithms & Logic

## 1. Progressive Fine Calculation Algorithm
```javascript
// Fine calculation based on late days
const calculateFine = (lateDays) => {
  if (lateDays <= 3) {
    return 0; // Grace period - no fine
  }
  
  const chargableDays = lateDays - 3;
  return 10 * Math.pow(chargableDays, 2); // ₹10 × (days)²
};

// Example:
// 4 late days: ₹10 × (4-3)² = ₹10 × 1² = ₹10
// 5 late days: ₹10 × (5-3)² = ₹10 × 2² = ₹40
// 6 late days: ₹10 × (6-3)² = ₹10 × 3² = ₹90
```

## 2. Student Status Management
```javascript
const updateStudentStatus = (lateDays) => {
  if (lateDays <= 3) {
    return 'Regular';    // Grace period
  } else if (lateDays <= 7) {
    return 'Warning';    // Warning phase
  } else if (lateDays <= 15) {
    return 'Critical';   // Critical phase
  } else {
    return 'Suspended'; // Suspended
  }
};
```

## 3. Search & Filter Algorithm
```javascript
// MongoDB query for search and filter
const buildSearchQuery = (search, year, status) => {
  let query = {};
  
  // Text search in name or roll number
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { rollNo: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by year
  if (year && year !== 'All') {
    query.year = year;
  }
  
  // Filter by status
  if (status && status !== 'All') {
    query.status = status;
  }
  
  return query;
};
```

## 4. Authentication Logic
```javascript
const authenticateUser = (username, password) => {
  const FACULTY_CREDENTIALS = {
    "faculty": "pass123",
    "admin": "admin123", 
    "teacher": "teacher123"
  };
  
  return FACULTY_CREDENTIALS[username.toLowerCase()] === password;
};
```

## 5. CSV Export Algorithm
```javascript
const convertToCSV = (data) => {
  // Extract headers from first object
  const headers = Object.keys(data[0]);
  
  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const dataRows = data.map(row => 
    headers.map(header => {
      let value = row[header];
      
      // Handle special characters in CSV
      if (typeof value === 'string' && 
          (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value || '';
    }).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
};
```