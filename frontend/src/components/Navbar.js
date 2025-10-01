import React from "react";
import { getCurrentUser, logout, getUserDisplayName, getLoginDuration } from "../utils/auth";

function Navbar({ onLogout }) {
  const user = getCurrentUser();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      if (onLogout) onLogout();
    }
  };

  return (
    <nav style={{
      backgroundColor: "#f8f9fa",
      padding: "1rem 2rem",
      borderBottom: "1px solid #dee2e6",
      marginBottom: "2rem"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <h2 style={{ margin: 0, color: "#007bff" }}>
          📚 Student Late Tracker
        </h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {user ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "end", marginRight: "1rem" }}>
                <span style={{ color: "#495057", fontSize: "0.9rem", fontWeight: "600" }}>
                  👨‍🏫 {getUserDisplayName()}
                </span>
                <span style={{ color: "#6c757d", fontSize: "0.8rem" }}>
                  Session: {getLoginDuration()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#c82333"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#dc3545"}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>
              Track attendance and manage late arrivals
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;