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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        padding: "3rem",
        borderRadius: "12px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e9ecef",
        width: "100%",
        maxWidth: "400px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            color: "#343a40",
            fontSize: "2rem",
            fontWeight: "700",
            marginBottom: "0.5rem"
          }}>
            🎓 Faculty Login
          </h1>
          <p style={{
            color: "#6c757d",
            fontSize: "1rem",
            margin: "0"
          }}>
            Student Late Tracking System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#495057",
              fontWeight: "500"
            }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              placeholder="Enter faculty username"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #dee2e6",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "border-color 0.2s",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#007bff"}
              onBlur={(e) => e.target.style.borderColor = "#dee2e6"}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#495057",
              fontWeight: "500"
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #dee2e6",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "border-color 0.2s",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#007bff"}
              onBlur={(e) => e.target.style.borderColor = "#dee2e6"}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "12px 16px",
              borderRadius: "6px",
              border: "1px solid #f5c6cb",
              marginBottom: "1.5rem",
              fontSize: "0.9rem"
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: loading ? "#6c757d" : "#007bff",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
              opacity: loading ? 0.8 : 1
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = "#0056b3";
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.backgroundColor = "#007bff";
            }}
          >
            {loading ? "🔄 Logging in..." : "🔑 Login"}
          </button>
        </form>

        <div style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#e7f3ff",
          borderRadius: "6px",
          border: "1px solid #b3d7ff"
        }}>
          <h4 style={{ 
            color: "#004085", 
            fontSize: "0.9rem", 
            marginBottom: "0.5rem",
            fontWeight: "600"
          }}>
            🔐 Demo Credentials:
          </h4>
          <div style={{ fontSize: "0.8rem", color: "#004085" }}>
            <div><strong>faculty</strong> / pass123</div>
            <div><strong>admin</strong> / admin123</div>
            <div><strong>teacher</strong> / teacher123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;