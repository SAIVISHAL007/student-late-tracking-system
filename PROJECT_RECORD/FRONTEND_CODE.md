# Frontend Code - Essential Parts

## 1. Main App Component (App.js)
```javascript
import React, { useState, useEffect } from 'react';
import { isAuthenticated } from './utils/auth';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StudentForm from './components/StudentForm';
import LateList from './components/LateList';
import Record from './components/Record';
import AdminManagement from './components/AdminManagement';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeComponent, setActiveComponent] = useState('studentForm');

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderComponent = () => {
    switch(activeComponent) {
      case 'studentForm': return <StudentForm />;
      case 'lateList': return <LateList />;
      case 'record': return <Record />;
      case 'adminManagement': return <AdminManagement />;
      default: return <StudentForm />;
    }
  };

  return (
    <div className="App">
      <Navbar onLogout={handleLogout} />
      <div style={{ display: 'flex' }}>
        <Sidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
        <main style={{ flex: 1, padding: '2rem' }}>
          {renderComponent()}
        </main>
      </div>
    </div>
  );
}

export default App;
```

## 2. Authentication System (utils/auth.js)
```javascript
export const AUTH_STORAGE_KEY = "facultyAuth";

export const isAuthenticated = () => {
  try {
    const authData = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return false;
    const parsed = JSON.parse(authData);
    return parsed.isAuthenticated === true;
  } catch (error) {
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    const authData = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return null;
    return JSON.parse(authData);
  } catch (error) {
    return null;
  }
};

export const logout = () => {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return true;
  } catch (error) {
    return false;
  }
};
```

## 3. Login Component (components/Login.js)
```javascript
import React, { useState } from "react";

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const FACULTY_CREDENTIALS = {
    "faculty": "pass123",
    "admin": "admin123",
    "teacher": "teacher123"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    if (FACULTY_CREDENTIALS[credentials.username.toLowerCase()] === credentials.password) {
      sessionStorage.setItem("facultyAuth", JSON.stringify({
        username: credentials.username,
        loginTime: new Date().toISOString(),
        isAuthenticated: true
      }));
      
      setTimeout(() => {
        onLogin(credentials.username);
        setLoading(false);
      }, 500);
    } else {
      setError("❌ Invalid username or password");
      setLoading(false);
    }
  };

  return (
    <div style={{ /* Login form styles */ }}>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="username"
          value={credentials.username}
          onChange={(e) => setCredentials({...credentials, username: e.target.value})}
          placeholder="Enter faculty username"
        />
        <input 
          type="password" 
          name="password"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          placeholder="Enter password"
        />
        <button type="submit" disabled={loading}>
          {loading ? "🔄 Logging in..." : "🔑 Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
```

## 4. Student Management (components/StudentForm.js)
```javascript
import React, { useState } from "react";
import API from "../services/api";

function StudentForm() {
  const [student, setStudent] = useState({
    rollNo: "",
    name: "",
    year: "1st Year"
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/students", student);
      setMessage("✅ Student added successfully!");
      setStudent({ rollNo: "", name: "", year: "1st Year" });
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div>
      <h2>📝 Add New Student</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Roll Number:</label>
          <input
            type="text"
            value={student.rollNo}
            onChange={(e) => setStudent({...student, rollNo: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={student.name}
            onChange={(e) => setStudent({...student, name: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label>Year:</label>
          <select
            value={student.year}
            onChange={(e) => setStudent({...student, year: e.target.value})}
          >
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>
        
        <button type="submit">Add Student</button>
      </form>
      
      {message && <div>{message}</div>}
    </div>
  );
}

export default StudentForm;
```

## 5. Export Functionality (utils/exportUtils.js)
```javascript
export const convertToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';
  
  const csvHeaders = headers || Object.keys(data[0]);
  const headerRow = csvHeaders.join(',');
  const dataRows = data.map(row => 
    csvHeaders.map(header => {
      let value = row[header];
      if (value === null || value === undefined) value = '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
};

export const downloadCSV = (data, filename, headers = null) => {
  try {
    const csv = convertToCSV(data, headers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return false;
  }
};
```

## 6. API Configuration (services/api.js)
```javascript
import axios from "axios";

const API = axios.create({ 
  baseURL: "http://localhost:5000/api" 
});

export default API;
```

## 7. Package Dependencies (package.json)
```json
{
  "name": "student-late-tracking-frontend",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.3.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  },
  "browserslist": {
    "production": [">0.2%", "not dead"],
    "development": ["last 1 chrome version"]
  }
}
```