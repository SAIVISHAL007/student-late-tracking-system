import React, { useState } from "react";

function Sidebar({ currentPage, onPageChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: "mark-late",
      icon: "🕐",
      title: "Mark Student Late",
      description: "Record late arrivals"
    },
    {
      id: "late-today",
      icon: "📋",
      title: "Late Students Today",
      description: "View today's late students"
    },
    {
      id: "records",
      icon: "📊",
      title: "Late Records",
      description: "Weekly, monthly & semester reports"
    },
    {
      id: "admin",
      icon: "⚙️",
      title: "Admin Management",
      description: "Semester promotion & data management"
    }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Dispatch custom event to notify App component about sidebar state change
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { collapsed: !isCollapsed } }));
  };

  return (
    <div style={{
      position: "fixed",
      left: 0,
      top: 0,
      height: "100vh",
      width: isCollapsed ? "70px" : "280px",
      backgroundColor: "#2c3e50",
      color: "white",
      transition: "width 0.3s ease",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
    }}>
      {/* Header */}
      <div style={{
        padding: "1rem",
        borderBottom: "1px solid #34495e",
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "space-between"
      }}>
        {!isCollapsed && (
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: "1.2rem",
              fontWeight: "600",
              color: "#ecf0f1"
            }}>
              📚 Late Tracker
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: "0.8rem", 
              color: "#bdc3c7",
              marginTop: "0.25rem"
            }}>
              Navigation Menu
            </p>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "4px",
            transition: "background-color 0.2s ease"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#34495e"}
          onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
        >
          {isCollapsed ? "☰" : "✖"}
        </button>
      </div>

      {/* Menu Items */}
      <div style={{
        flex: 1,
        padding: "1rem 0",
        overflowY: "auto"
      }}>
        {menuItems.map(item => (
          <div
            key={item.id}
            onClick={() => onPageChange(item.id)}
            style={{
              padding: isCollapsed ? "1rem 0" : "1rem",
              margin: "0.25rem",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: currentPage === item.id ? "#3498db" : "transparent",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: isCollapsed ? 0 : "1rem",
              justifyContent: isCollapsed ? "center" : "flex-start"
            }}
            onMouseOver={(e) => {
              if (currentPage !== item.id) {
                e.target.style.backgroundColor = "#34495e";
              }
            }}
            onMouseOut={(e) => {
              if (currentPage !== item.id) {
                e.target.style.backgroundColor = "transparent";
              }
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
            {!isCollapsed && (
              <div>
                <div style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: currentPage === item.id ? "white" : "#ecf0f1"
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: "0.8rem",
                  color: currentPage === item.id ? "#e8f4fd" : "#bdc3c7",
                  marginTop: "0.25rem"
                }}>
                  {item.description}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;